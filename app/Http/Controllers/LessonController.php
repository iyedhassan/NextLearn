<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Lesson::query();

        if ($request->has('session_id')) {
            $query->where('session_id', $request->session_id);
        }

        return $query->with(['session', 'form'])->paginate(20);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:sessions,id',
            'form_id' => 'required|exists:forms,id',
            'completed_at' => 'nullable|date',
        ]);

        $lesson = Lesson::create($validated);

        return response()->json($lesson, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Lesson::with(['session', 'form'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);

        $validated = $request->validate([
            'session_id' => 'sometimes|exists:sessions,id',
            'form_id' => 'sometimes|exists:forms,id',
            'completed_at' => 'nullable|date',
        ]);

        $lesson->update($validated);

        return response()->json($lesson);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $lesson = Lesson::findOrFail($id);
        $lesson->delete();

        return response()->json(null, 204);
    }

    /**
     * Mark lesson as completed.
     */
    public function complete($id)
    {
        $lesson = Lesson::findOrFail($id);
        $lesson->markCompleted();

        return response()->json(['message' => 'Lesson marked as completed.', 'lesson' => $lesson]);
    }
}
