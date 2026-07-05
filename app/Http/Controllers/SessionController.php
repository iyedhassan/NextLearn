<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Session::query();

        if ($request->user() && !$request->user()->isAdmin()) {
            $query->where(function ($q) use ($request) {
                $q->where('student_id', $request->user()->id)
                    ->orWhere('tutor_id', $request->user()->id);
            });
        }

        if ($request->has('state')) {
            $query->where('state', $request->state);
        }

        return $query->with(['student', 'tutor', 'lessons'])->latest()->paginate(20);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'tutor_id' => 'required|exists:users,id',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'cost' => 'integer|min:0',
            'additional_info' => 'nullable|string',
        ]);

        $session = Session::create($validated + ['state' => 'Pending']);

        return response()->json($session, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $session = Session::with(['student', 'tutor', 'lessons', 'auditions', 'answers'])->findOrFail($id);

        if (
            !$request->user()->isAdmin() &&
            $request->user()->id !== $session->student_id &&
            $request->user()->id !== $session->tutor_id
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $session;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $session = Session::findOrFail($id);

        if (
            !$request->user()->isAdmin() &&
            $request->user()->id !== $session->student_id &&
            $request->user()->id !== $session->tutor_id
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'state' => 'sometimes|in:Pending,Confirmed,Canceled,Ongoing,Finished',
            'explanation' => 'nullable|string',
            'additional_info' => 'nullable|string',
            'start_at' => 'sometimes|date',
            'end_at' => 'sometimes|date|after:start_at',
        ]);

        $session->update($validated);

        return response()->json($session);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session = Session::findOrFail($id);
        $session->delete();

        return response()->json(null, 204);
    }

    /**
     * Confirm a session.
     */
    public function confirm(Request $request, $id)
    {
        $session = Session::findOrFail($id);

        // Only tutor or admin can confirm
        if (!$request->user()->isAdmin() && $request->user()->id !== $session->tutor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $session->confirm();
        return response()->json(['message' => 'Session confirmed.', 'session' => $session]);
    }
}
