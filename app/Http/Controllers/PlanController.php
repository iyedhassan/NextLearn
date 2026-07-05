<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Plan::query();

        if ($request->has('interval')) {
            $query->where('interval', $request->interval);
        }

        // Only admins see inactive plans
        $isAdmin = $request->user() && $request->user()->isAdmin();

        if (!$isAdmin) {
            $query->active();
        }

        return $query->with('features')->orderBy('price')->get();
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
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'interval' => 'required|in:Single,Weekly,Monthly,Yearly',
            'is_recommended' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return response()->json($plan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Plan::with('features')->findOrFail($id);
    }

    /**
     * Update the specified resource (Admin only).
     */
    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'interval' => 'sometimes|in:Single,Weekly,Monthly,Yearly',
            'is_recommended' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json($plan);
    }

    /**
     * Remove the specified resource (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $plan = Plan::findOrFail($id);
        $plan->delete();

        return response()->json(null, 204);
    }
}
