<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\Invoice;
use App\Models\Admission;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Form::query();

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('state')) {
            $query->where('state', $request->state);
        }

        if ($request->has('q') && $request->q) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category) {
            $categoryName = $request->category;
            $query->where(function ($q) use ($categoryName) {
                $q->whereHas('category', function ($cq) use ($categoryName) {
                    $cq->where('name', $categoryName);
                })->orWhere('tags', 'like', "%{$categoryName}%");
            });
        }

        if ($request->has('level') && $request->level) {
            $query->where('level', $request->level);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sorting
        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'popularity':
                $query->withCount('admissions')->orderBy('admissions_count', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Tutors can filter for their own courses in management views
        $user = auth('sanctum')->user();
        if ($request->has('own') && $user) {
            $query->where('user_id', $user->id);
        }

        return $query->with(['user.person', 'topics', 'category'])->paginate(6);
    }

    /**
     * Store a newly created resource in storage (Tutor/Admin only).
     */
    public function store(Request $request)
    {
        if ($request->user()->role === 'Student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:Admission,Exercise,Exam,Audition',
            'description' => 'nullable|string',
            'tags' => 'nullable|string',
            'category_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'nullable|numeric|min:0|max:999999',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Support file upload
            'level' => 'nullable|string|max:50',
            'state' => 'nullable|in:Draft,Published,Pending',
        ]);

        // Logic: if non-admin tries to publish, set to Pending
        if (isset($validated['state']) && $validated['state'] === 'Published' && !$request->user()->isAdmin()) {
            $validated['state'] = 'Pending';
        }

        // Handle category creation/assignment
        if ($request->has('category_name') && !empty($request->category_name)) {
            $category = Category::findOrCreateByName($request->category_name);
            $validated['category_id'] = $category->id;
            $validated['tags'] = $request->category_name; // Sync tags with category name for transparency
        } elseif ($request->has('category_id') && !empty($request->category_id)) {
            $validated['category_id'] = $request->category_id;
        } elseif ($request->has('tags') && !empty($request->tags)) {
            // If only tags are provided, use the first tag as category name
            $firstTag = trim(explode(',', $request->tags)[0]);
            if (!empty($firstTag)) {
                $category = Category::findOrCreateByName($firstTag);
                $validated['category_id'] = $category->id;
            }
        }

        // Remove category_name from validated data
        unset($validated['category_name']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('courses', 'public');
            $validated['image'] = $path;
        }

        $validated['user_id'] = $request->user()->id;

        // Set default state if not provided
        if (!isset($validated['state'])) {
            $validated['state'] = 'Draft';
        }

        $form = Form::create($validated);

        // Load the form with image_url accessor
        $form->load(['user.person', 'topics', 'category']);

        return response()->json($form, 201);
    }

    /**
     * Display the specified resource with its topics.
     */
    public function show($id)
    {
        return Form::with(['topics', 'questions', 'user.person', 'feedbacks.user'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $form = Form::findOrFail($id);

        // Ensure user owns the form or is admin
        if ((int) $request->user()->id !== (int) $form->user_id && !$request->user()->isAdmin()) {
            \Illuminate\Support\Facades\Log::warning("Form Update 403. User: {$request->user()->id}, Owner: {$form->user_id}");
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:Admission,Exercise,Exam,Audition',
            'description' => 'nullable|string',
            'tags' => 'nullable|string',
            'category_name' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'nullable|numeric|min:0|max:999999',
            'state' => 'sometimes|in:Draft,Published,Pending,Archived',
            'time_limit' => 'nullable|integer|min:0',
            'passing_score' => 'nullable|integer|min:0|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Cover image
            'level' => 'nullable|string|max:50',
        ]);

        // Logic: if non-admin tries to publish, set to Pending
        if (isset($validated['state']) && $validated['state'] === 'Published' && !$request->user()->isAdmin()) {
            $validated['state'] = 'Pending';
        }

        // Handle category creation/assignment
        if ($request->has('category_name') && !empty($request->category_name)) {
            $category = Category::findOrCreateByName($request->category_name);
            $validated['category_id'] = $category->id;
            $validated['tags'] = $request->category_name;
        } elseif ($request->has('category_id') && !empty($request->category_id)) {
            $validated['category_id'] = $request->category_id;
        } elseif ($request->has('tags') && !empty($request->tags)) {
            $firstTag = trim(explode(',', $request->tags)[0]);
            if (!empty($firstTag)) {
                $category = Category::findOrCreateByName($firstTag);
                $validated['category_id'] = $category->id;
            }
        }

        // Remove category_name from validated data
        unset($validated['category_name']);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($form->image && Storage::disk('public')->exists($form->image)) {
                Storage::disk('public')->delete($form->image);
            }

            $path = $request->file('image')->store('courses', 'public');
            $validated['image'] = $path;
        }

        $form->update($validated);

        return response()->json($form);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $form = Form::findOrFail($id);

        if ((int) $request->user()->id !== (int) $form->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $form->delete();

        return response()->json(null, 204);
    }

    /**
     * Purchase/Order a course.
     */
    public function purchase(Request $request, $id)
    {
        $course = Form::findOrFail($id);
        $user = $request->user();

        // Check if already purchased
        $exists = Admission::where('user_id', $user->id)->where('form_id', $course->id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Vous êtes déjà inscrit à ce cours.'], 422);
        }

        return DB::transaction(function () use ($course, $user) {
            $isFree = $course->price <= 0;

            // Create Admission
            $admission = Admission::create([
                'user_id' => $user->id,
                'form_id' => $course->id,
                'is_approved' => $isFree, // Auto-approve if free
                'verified_at' => $isFree ? now() : null,
            ]);

            // Create Invoice
            $invoice = Invoice::create([
                'user_id' => $user->id,
                'form_id' => $course->id,
                'invoice_number' => 'INV-CRS-' . strtoupper(Str::random(10)),
                'subtotal' => $course->price,
                'total' => $course->price,
                'status' => $isFree ? 'Paid' : 'Pending', // Mark Paid if free
                'due_date' => now()->addDays(3),
                'paid_at' => $isFree ? now() : null,
                'payment_method' => $isFree ? 'Free' : null,
            ]);

            return response()->json([
                'message' => $isFree
                    ? 'Inscription réussie ! Le cours est maintenant disponible dans votre tableau de bord.'
                    : 'Votre commande a été enregistrée. Veuillez procéder au paiement.',
                'admission' => $admission,
                'invoice' => $invoice
            ]);
        });
    }
}
