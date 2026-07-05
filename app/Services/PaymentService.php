<?php

namespace App\Services;

use App\Models\Invoice;
use Exception;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Process a mock payment.
     *
     * @param Invoice $invoice
     * @param array $paymentData
     * @return array
     * @throws Exception
     */
    public function processPayment(Invoice $invoice, array $paymentData)
    {
        // Simulate external API call delay
        usleep(500000); // 500ms

        // Allow zero amounts for free content, only negative is invalid
        if ($invoice->total < 0) {
            throw new Exception("Invalid payment amount.");
        }

        // Simulate a unique transaction ID from a gateway like Stripe
        $transactionId = 'pi_' . Str::random(24);

        // Update invoice
        $invoice->markAsPaid($transactionId, $paymentData['method'] ?? 'Mock');

        // Logic for activating related entities (e.g., subscription)
        if ($invoice->subscription) {
            $invoice->subscription->activate();
        }

        return [
            'success' => true,
            'transaction_id' => $transactionId,
            'amount' => $invoice->total,
            'status' => 'paid',
        ];
    }

    /**
     * Refund a mock payment.
     */
    public function refundPayment(Invoice $invoice)
    {
        if ($invoice->status !== 'Paid') {
            throw new Exception("Only paid invoices can be refunded.");
        }

        $invoice->update(['status' => 'Refunded']);

        return [
            'success' => true,
            'status' => 'refunded',
        ];
    }
}
