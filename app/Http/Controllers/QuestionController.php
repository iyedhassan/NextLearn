<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource (usually for a specific form).
     */
    public function index(Request $request)
    {
        $query = Question::query();

        if ($request->has('form_id')) {
            $query->where('form_id', $request->form_id);
        }

        return $query->orderBy('order')->paginate(50);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form_id' => 'required|exists:forms,id',
            'title' => 'required|string',
            'type' => 'required|in:Short,Link,Text,Select,Check',
            'options' => 'nullable|string', // newline separated
            'correct_answers' => 'nullable|string',
            'is_required' => 'boolean',
            'is_matchable' => 'boolean',
            'order' => 'integer',
        ]);

        $form = Form::findOrFail($validated['form_id']);

        if ($request->user()->id !== $form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question = Question::create($validated);

        return response()->json($question, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Question::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $form = $question->form;

        if ($request->user()->id !== $form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string',
            'type' => 'sometimes|in:Short,Link,Text,Select,Check',
            'options' => 'nullable|string',
            'correct_answers' => 'nullable|string',
            'is_required' => 'boolean',
            'is_matchable' => 'boolean',
            'order' => 'integer',
        ]);

        $question->update($validated);

        return response()->json($question);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $question = Question::findOrFail($id);
        $form = $question->form;

        if ($request->user()->id !== $form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $question->delete();

        return response()->json(null, 204);
    }
}
