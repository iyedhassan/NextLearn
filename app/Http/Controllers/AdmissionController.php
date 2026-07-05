<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AdmissionController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Admission::query();

        if ($request->user() && !$request->user()->isAdmin()) {
            if ($request->user()->isTutor()) {
                // Tutors see students enrolled in their courses
                $query->whereHas('form', function ($q) use ($request) {
                    $q->where('user_id', $request->user()->id);
                });
            } else {
                // Students only see their own admissions
                $query->where('user_id', $request->user()->id);
            }
        }

        if ($request->has('is_approved')) {
            $isApproved = filter_var($request->is_approved, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isApproved === null && ($request->is_approved === '0' || $request->is_approved === 'false')) {
                $isApproved = false;
            }
            if ($isApproved !== null) {
                $query->where('is_approved', $isApproved);
                if ($isApproved === false && !$request->has('include_verified')) {
                    $query->whereNull('verified_at');
                }
            }
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return $query->with(['user', 'form', 'admin'])->paginate(20);
    }

    /**
     * Store a newly created resource (Apply for course).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
        ]);

        // Check if application already exists
        $exists = Admission::where('user_id', $request->user()->id)
            ->where('form_id', $validated['form_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Vous avez déjà postulé pour ce cours.'], 422);
        }

        $admission = Admission::create([
            'user_id' => $request->user()->id,
            'form_id' => $validated['form_id'],
            'is_approved' => false,
        ]);

        return response()->json($admission, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $admission = Admission::with(['user', 'form', 'admin'])->findOrFail($id);

        if (!$request->user()->isAdmin() && $request->user()->id !== $admission->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $admission;
    }

    /**
     * Update the specified resource (Approve/Reject - Admin only).
     */
    public function update(Request $request, $id)
    {
        $admission = Admission::with(['user', 'form'])->findOrFail($id);

        $isAdmin = $request->user()->isAdmin();
        $isTutor = $request->user()->isTutor() && $admission->form->user_id === $request->user()->id;

        if (!$isAdmin && !$isTutor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'is_approved' => 'required|boolean',
        ]);

        if ($validated['is_approved']) {
            $admission->approve($request->user()->id);
            $this->notificationService->notify(
                $admission->user,
                "Admission Approuvée !",
                "Votre demande pour rejoindre le cours '{$admission->form->title}' a été acceptée. Bienvenue !"
            );
        } else {
            $admission->reject();
            $this->notificationService->notify(
                $admission->user,
                "Demande d'Admission",
                "Malheureusement, votre demande pour le cours '{$admission->form->title}' n'a pas été retenue pour le moment."
            );
        }

        return response()->json($admission);
    }

    /**
     * Remove the specified resource (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $admission = Admission::findOrFail($id);
        $admission->delete();

        return response()->json(null, 204);
    }
}
