<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Subscription::query();

        if ($request->user() && !$request->user()->isAdmin()) {
            $query->forUser($request->user()->id);
        }

        return $query->with(['plan', 'coupon', 'user'])->paginate(20);
    }

    /**
     * Store a newly created resource (Checkout).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'coupon_id' => 'nullable|exists:coupons,id',
            'quantity' => 'integer|min:1',
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        if (!$plan->isActive()) {
            return response()->json(['message' => 'This plan is currently unavailable.'], 400);
        }

        return DB::transaction(function () use ($request, $plan, $validated) {
            $subscription = Subscription::create([
                'user_id' => $request->user()->id,
                'plan_id' => $plan->id,
                'coupon_id' => $validated['coupon_id'] ?? null,
                'quantity' => $validated['quantity'] ?? 1,
                'state' => 'Pending',
            ]);

            // Create Invoice automatically
            $subtotal = $plan->price * $subscription->quantity;
            $discount = $subscription->discount_amount;
            $tax = ($subtotal - $discount) * 0.20; // Example 20% tax
            $total = ($subtotal - $discount) + $tax;

            $invoice = Invoice::create([
                'subscription_id' => $subscription->id,
                'user_id' => $request->user()->id,
                'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'status' => 'Pending',
                'due_date' => now()->addDays(7),
            ]);

            return response()->json([
                'subscription' => $subscription->load('plan'),
                'invoice' => $invoice
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Subscription::with(['plan', 'coupon', 'invoices', 'user'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        if (!$request->user()->isAdmin() && $request->user()->id !== $subscription->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'state' => 'sometimes|in:Pending,Activated,Cancelled,Expired,Failed',
            'quantity' => 'sometimes|integer|min:1',
        ]);

        $subscription->update($validated);

        return response()->json($subscription);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $subscription = Subscription::findOrFail($id);

        if (!request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription->delete();

        return response()->json(null, 204);
    }

    /**
     * Activate the subscription manually (Admin only).
     */
    public function activate(Request $request, $id)
    {
        $subscription = Subscription::findOrFail($id);

        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription->activate();

        return response()->json(['message' => 'Subscription activated successfully.', 'subscription' => $subscription]);
    }
}
