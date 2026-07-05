<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\PaymentService;
use App\Services\NotificationService;
use Exception;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    protected $paymentService;
    protected $notificationService;

    public function __construct(PaymentService $paymentService, NotificationService $notificationService)
    {
        $this->paymentService = $paymentService;
        $this->notificationService = $notificationService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Invoice::query();

        if ($request->user() && !$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return $query->with(['subscription.plan', 'user', 'form'])->latest()->paginate(20);
    }

    /**
     * Store a newly created resource in storage (Admin only).
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'user_id' => 'required|exists:users,id',
            'invoice_number' => 'required|string|unique:invoices',
            'subtotal' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'status' => 'required|in:Pending,Paid,Cancelled,Refunded',
            'due_date' => 'nullable|date',
        ]);

        $invoice = Invoice::create($validated);

        return response()->json($invoice, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $invoice = Invoice::with(['subscription.plan', 'user'])->findOrFail($id);

        if (!$request->user()->isAdmin() && $request->user()->id !== $invoice->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $invoice;
    }

    /**
     * Pay the invoice.
     */
    public function markAsPaid(Request $request, $id)
    {
        $invoice = Invoice::with('user')->findOrFail($id);

        // Ensure user owns the invoice
        if (!$request->user()->isAdmin() && $request->user()->id !== $invoice->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($invoice->status === 'Paid') {
            return response()->json(['message' => 'L\'invoice est déjà payée.'], 400);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string',
            'payment_data' => 'nullable|array',
        ]);

        try {
            $result = $this->paymentService->processPayment($invoice, [
                'method' => $validated['payment_method'],
                'data' => $validated['payment_data'] ?? []
            ]);

            // Auto-approve admission if it exists
            $admission = \App\Models\Admission::where('user_id', $invoice->user_id)
                ->where('form_id', $invoice->form_id)
                ->with('form')
                ->first();

            if ($admission) {
                // Remove auto-approval: admission stays pending until admin manual check
                // $admission->update(['is_approved' => true]);

                // Send notification that payment is received but access is pending validation
                $courseName = $admission->form ? $admission->form->title : 'votre cours';
                $this->notificationService->notify(
                    $invoice->user,
                    "Paiement reçu - En attente de validation",
                    "Votre paiement de {$invoice->total}€ pour le cours '{$courseName}' a été reçu. Un administrateur va maintenant valider votre accès. Vous recevrez une notification dès que le cours sera débloqué.",
                    ['type' => 'info', 'course_id' => $invoice->form_id]
                );
            } else {
                // Fallback notification if no admission found
                $this->notificationService->notifyPaymentSuccess($invoice->user, $invoice->total);
            }

            return response()->json([
                'message' => 'Paiement réussi.',
                'result' => $result,
                'invoice' => $invoice->fresh(['subscription'])
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Échec du paiement : ' . $e->getMessage()], 422);
        }
    }

    /**
     * Update the specified resource (Admin only).
     */
    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:Pending,Paid,Cancelled,Refunded,Failed',
            'payment_method' => 'nullable|string',
            'payment_id' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return response()->json($invoice);
    }

    /**
     * Remove the specified resource (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(null, 204);
    }
}
