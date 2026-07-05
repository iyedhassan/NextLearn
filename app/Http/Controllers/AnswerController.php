<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Form;
use App\Models\Question;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Answer::query();

        if ($request->has('form_id')) {
            $query->where('form_id', $request->form_id);
        }

        if ($request->has('user_id')) {
            // Only allow viewing own answers unless admin
            if ($request->user()->id != $request->user_id && !$request->user()->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $query->where('user_id', $request->user_id);
        } else if (!$request->user()->isAdmin()) {
            // By default, users see only their own answers
            $query->where('user_id', $request->user()->id);
        }

        return $query->paginate(50);
    }

    /**
     * Store a newly created resource (Submit an answer).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer' => 'required|string',
            'session_id' => 'nullable|exists:sessions,id',
        ]);

        $question = Question::findOrFail($validated['question_id']);
        $form = $question->form;

        if (!$form->isPublished() && $form->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Form is not published'], 403);
        }

        // Check if answer already exists for this user/session/question to prevent duplicates
        $exists = Answer::where('user_id', $request->user()->id)
            ->where('question_id', $question->id)
            ->when($request->session_id, function ($q) use ($request) {
                return $q->where('session_id', $request->session_id);
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Answer already submitted for this question'], 422);
        }

        $answer = Answer::create([
            'user_id' => $request->user()->id,
            'question_id' => $question->id,
            'form_id' => $form->id,
            'session_id' => $request->session_id,
            'answer' => $validated['answer'],
        ]);

        return response()->json($answer, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $answer = Answer::findOrFail($id);

        if ($request->user()->id !== $answer->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $answer;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $answer = Answer::findOrFail($id);

        if ($request->user()->id !== $answer->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $answer->update($validated);

        return response()->json($answer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $answer = Answer::findOrFail($id);

        if ($request->user()->id !== $answer->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $answer->delete();

        return response()->json(null, 204);
    }
}
