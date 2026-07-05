<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Feedback::query();

        // If form_id is provided, it's likely a public request for course reviews
        if ($request->has('form_id')) {
            $query->where('form_id', $request->form_id)->where('type', 'Review');
        } else {
            // Otherwise, filter by user unless admin
            if ($request->user() && !$request->user()->isAdmin()) {
                $query->where('user_id', $request->user()->id);
            } elseif (!$request->user()) {
                // If not logged in and no form_id, return nothing or public data
                return response()->json(['data' => []]);
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->with(['user.person', 'form'])->latest()->paginate(20);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Log::info("Feedback Store Request", $request->all());

        // Auto-fill attributes for reviews coming from student dashboard which might send 'comment'
        if ($request->has('rating') && $request->has('form_id')) {
            $request->merge([
                'type' => 'Review',
                'subject' => 'Review for Course #' . $request->form_id,
                'message' => $request->input('comment', $request->input('message')),
            ]);
        }

        try {
            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'type' => 'required|in:Bug,Feature,Question,Other,Review',
                'form_id' => 'nullable|exists:forms,id',
                'rating' => 'nullable|integer|min:1|max:5',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error("Feedback Validation Error", $e->errors());
            throw $e;
        }

        // Validation for Paid Course Review
        if (($validated['type'] ?? '') === 'Review' && !empty($validated['form_id'])) {
            \Illuminate\Support\Facades\Log::info("Checking admission for user {$request->user()->id} and form {$validated['form_id']}");

            $hasAccess = \App\Models\Admission::where('user_id', $request->user()->id)
                ->where('form_id', $validated['form_id'])
                ->where('is_approved', true)
                ->exists();

            \Illuminate\Support\Facades\Log::info("Has access: " . ($hasAccess ? 'YES' : 'NO'));

            if (!$hasAccess) {
                \Illuminate\Support\Facades\Log::warning("User {$request->user()->id} tried to review course {$validated['form_id']} without approved admission");
                return response()->json(['message' => 'Vous devez avoir acheté et obtenu l\'approbation pour ce cours avant de laisser un avis.'], 403);
            }
        }

        $feedback = Feedback::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'type' => $validated['type'],
            'status' => 'New',
            'form_id' => $validated['form_id'] ?? null,
            'rating' => $validated['rating'] ?? null,
        ]);

        return response()->json($feedback, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $feedback = Feedback::with('user')->findOrFail($id);

        if (!request()->user()->isAdmin() && request()->user()->id != $feedback->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $feedback;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $feedback = Feedback::findOrFail($id);

        // Authorization: Admin can update any feedback, users can only update their own reviews
        $isAdmin = $request->user()->isAdmin();
        $isOwner = $request->user()->id == $feedback->user_id;

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Students can only update their own reviews (rating and message)
        if (!$isAdmin && strtolower($feedback->type) !== 'review') {
            return response()->json(['message' => 'You can only edit reviews'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'message' => 'sometimes|string',
            'status' => 'sometimes|in:New,In Progress,Resolved,Closed',
        ]);

        // Students can only update rating and message
        if (!$isAdmin) {
            $validated = array_intersect_key($validated, array_flip(['rating', 'message']));
        }

        $feedback->update($validated);

        return response()->json($feedback);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);

        // Authorization: Admin can delete any feedback, users can only delete their own
        $isAdmin = request()->user()->isAdmin();
        $isOwner = request()->user()->id == $feedback->user_id;

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $feedback->delete();

        return response()->json(null, 204);
    }
}
