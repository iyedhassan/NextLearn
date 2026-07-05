<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->user() && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Coupon::latest()->paginate(20);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'slug' => 'required|string|unique:coupons',
            'name' => 'required|string',
            'discount' => 'required|numeric|min:0',
            'discount_type' => 'required|in:Percentage,Fixed',
            'expires_at' => 'nullable|date',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $coupon = Coupon::create($validated);

        return response()->json($coupon, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $coupon = Coupon::findOrFail($id);

        if (!request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $coupon;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'slug' => 'sometimes|string|unique:coupons,slug,' . $id,
            'name' => 'sometimes|string',
            'discount' => 'sometimes|numeric|min:0',
            'discount_type' => 'sometimes|in:Percentage,Fixed',
            'expires_at' => 'nullable|date',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $coupon->update($validated);

        return response()->json($coupon);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        if (!request()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(null, 204);
    }

    /**
     * Validate a coupon by slug.
     */
    public function validateCoupon(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string',
        ]);

        $coupon = Coupon::where('slug', $validated['slug'])->first();

        if (!$coupon) {
            return response()->json(['message' => 'Coupon not found.'], 404);
        }

        if (!$coupon->isValid()) {
            return response()->json(['message' => 'This coupon is no longer valid.'], 400);
        }

        return response()->json([
            'valid' => true,
            'coupon' => $coupon
        ]);
    }
}
