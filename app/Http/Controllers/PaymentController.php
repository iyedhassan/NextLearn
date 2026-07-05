<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Form;
use App\Models\Admission;
use App\Models\Invoice;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $query = Payment::query();

        // Filter by user role
        if ($request->user() && !$request->user()->isAdmin()) {
            // Students see only their own payments
            $query->where('user_id', $request->user()->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->with(['user', 'form', 'admin', 'invoice'])
            ->latest()
            ->paginate(20);
    }

    /**
     * Store a newly created payment (Student initiates payment).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'payment_method' => 'required|string',
            'payment_details' => 'nullable|array',
        ]);

        $course = Form::findOrFail($validated['form_id']);
        $user = $request->user();

        // Check if already paid or payment pending
        $existingPayment = Payment::where('user_id', $user->id)
            ->where('form_id', $course->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->first();

        if ($existingPayment) {
            return response()->json([
                'message' => 'Vous avez déjà un paiement en cours ou accepté pour ce cours.',
                'payment' => $existingPayment
            ], 422);
        }

        return DB::transaction(function () use ($course, $user, $validated) {
            // Create payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'form_id' => $course->id,
                'payment_number' => 'PAY-' . strtoupper(Str::random(12)),
                'amount' => $course->price,
                'payment_method' => $validated['payment_method'],
                'payment_details' => $validated['payment_details'] ?? null,
                'status' => 'pending',
            ]);

            // Create admission in pending state (not approved yet)
            $admission = Admission::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'form_id' => $course->id,
                ],
                [
                    'is_approved' => false,
                ]
            );

            // Notify user
            $this->notificationService->notify(
                $user,
                "Paiement en attente de validation",
                "Votre paiement de {$payment->amount}€ pour le cours '{$course->title}' est en attente de validation par un administrateur. Vous serez notifié dès que votre accès sera débloqué."
            );

            return response()->json([
                'message' => 'Paiement créé avec succès. En attente de validation administrative.',
                'payment' => $payment->load(['form', 'user']),
            ], 201);
        });
    }

    /**
     * Display the specified payment.
     */
    public function show(Request $request, $id)
    {
        $payment = Payment::with(['user', 'form', 'admin', 'invoice'])->findOrFail($id);

        // Authorization: Admin or payment owner
        if (!$request->user()->isAdmin() && $request->user()->id !== $payment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $payment;
    }

    /**
     * Accept a payment (Admin only).
     */
    public function accept(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::with(['user', 'form'])->findOrFail($id);

        if (!$payment->isPending()) {
            return response()->json(['message' => 'Ce paiement a déjà été traité.'], 422);
        }

        return DB::transaction(function () use ($payment, $request) {
            // Accept the payment
            $payment->accept($request->user()->id);

            // Approve the admission
            $admission = Admission::where('user_id', $payment->user_id)
                ->where('form_id', $payment->form_id)
                ->first();

            if ($admission) {
                $admission->approve($request->user()->id);
            }

            // Generate invoice
            $invoice = Invoice::create([
                'user_id' => $payment->user_id,
                'form_id' => $payment->form_id,
                'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                'subtotal' => $payment->amount,
                'total' => $payment->amount,
                'status' => 'Paid',
                'payment_method' => $payment->payment_method,
                'payment_id' => $payment->payment_number,
                'paid_at' => now(),
                'due_date' => now(),
            ]);

            // Link invoice to payment
            $payment->update(['invoice_id' => $invoice->id]);

            // Notify student
            $this->notificationService->notify(
                $payment->user,
                "Paiement accepté ✅",
                "Votre paiement de {$payment->amount}€ pour le cours '{$payment->form->title}' a été validé ! Vous pouvez maintenant accéder au contenu du cours."
            );

            return response()->json([
                'message' => 'Paiement accepté avec succès.',
                'payment' => $payment->fresh(['user', 'form', 'admin', 'invoice']),
            ]);
        });
    }

    /**
     * Reject a payment (Admin only).
     */
    public function reject(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $payment = Payment::with(['user', 'form'])->findOrFail($id);

        if (!$payment->isPending()) {
            return response()->json(['message' => 'Ce paiement a déjà été traité.'], 422);
        }

        $payment->reject($request->user()->id, $validated['reason'] ?? null);

        // Notify student
        $reason = $validated['reason'] ?? 'Aucune raison spécifiée';
        $this->notificationService->notify(
            $payment->user,
            "Paiement rejeté ❌",
            "Votre paiement de {$payment->amount}€ pour le cours '{$payment->form->title}' a été rejeté. Raison : {$reason}"
        );

        return response()->json([
            'message' => 'Paiement rejeté.',
            'payment' => $payment->fresh(['user', 'form', 'admin']),
        ]);
    }

    /**
     * Remove the specified payment (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::findOrFail($id);

        // Also delete the associated pending admission to keep data clean
        $admission = Admission::where('user_id', $payment->user_id)
            ->where('form_id', $payment->form_id)
            ->where('is_approved', 0)
            ->first();

        if ($admission) {
            $admission->delete();
        }

        $payment->delete();

        return response()->json(null, 204);
    }
}
