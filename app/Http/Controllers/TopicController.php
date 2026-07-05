<?php

namespace App\Http\Controllers;

use App\Models\Topic;
use App\Models\Form;
use Illuminate\Http\Request;

class TopicController extends Controller
{
    /**
     * Display a listing of the topics for a course.
     */
    public function index(Request $request)
    {
        $request->validate(['form_id' => 'required|exists:forms,id']);

        $course = Form::findOrFail($request->form_id);
        $user = $request->user();

        // If not admin and not the owner
        if (!$user || (!$user->isAdmin() && $user->id !== $course->user_id)) {
            // Check if student is approved for this course
            $isApproved = \App\Models\Admission::where('user_id', $user->id)
                ->where('form_id', $course->id)
                ->where('is_approved', true)
                ->exists();

            if (!$isApproved) {
                // If not approved, return only preview topics
                return Topic::where('form_id', $request->form_id)
                    ->where('is_preview', true)
                    ->orderBy('order')
                    ->get();
            }
        }

        return Topic::where('form_id', $request->form_id)
            ->orderBy('order')
            ->get();
    }

    /**
     * Store a newly created topic.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'title' => 'required|string|max:255',
            'content_type' => 'nullable|string|in:Text,Video,Quiz,File',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimes:mp4,mov,avi,wmv,flv,webm|max:102400', // max 100MB
            'order' => 'integer|min:0',
            'is_preview' => 'boolean',
        ]);

        $course = Form::findOrFail($validated['form_id']);

        // Only owner or admin
        if ((int) $request->user()->id !== (int) $course->user_id && !$request->user()->isAdmin()) {
            \Illuminate\Support\Facades\Log::warning("Topic Store 403: User ID {$request->user()->id} vs Owner ID {$course->user_id}");
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('videos', 'public');
            $validated['video_path'] = $path;
        }

        $topic = Topic::create($validated);

        return response()->json($topic, 201);
    }

    /**
     * Display the specified topic.
     */
    public function show(Request $request, $id)
    {
        $topic = Topic::with('form')->findOrFail($id);

        if ($topic->is_preview) {
            return $topic;
        }

        $user = $request->user();
        $course = $topic->form;

        if (!$user || (!$user->isAdmin() && $user->id !== $course->user_id)) {
            $isApproved = \App\Models\Admission::where('user_id', $user->id)
                ->where('form_id', $course->id)
                ->where('is_approved', true)
                ->exists();

            if (!$isApproved) {
                return response()->json(['message' => 'Contenu verrouillé. Accès réservé aux étudiants inscrits et validés.'], 403);
            }
        }

        return $topic;
    }

    /**
     * Update the specified topic.
     */
    public function update(Request $request, $id)
    {
        $topic = Topic::with('form')->findOrFail($id);

        if ((int) $request->user()->id !== (int) $topic->form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content_type' => 'nullable|string|in:Text,Video,Quiz,File',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'video_file' => 'nullable|file|mimes:mp4,mov,avi,wmv,flv,webm|max:102400',
            'order' => 'sometimes|integer|min:0',
            'is_preview' => 'boolean',
        ]);

        if ($request->hasFile('video_file')) {
            $path = $request->file('video_file')->store('videos', 'public');
            $validated['video_path'] = $path;
        }

        $topic->update($validated);

        return response()->json($topic);
    }

    /**
     * Remove the specified topic.
     */
    public function destroy(Request $request, $id)
    {
        $topic = Topic::with('form')->findOrFail($id);

        if ((int) $request->user()->id !== (int) $topic->form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $topic->delete();

        return response()->json(null, 204);
    }
}
