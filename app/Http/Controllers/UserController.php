<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with('person')->latest();

        // Search by name or email
        if ($request->has('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('person', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return $query->paginate(20);
    }

    /**
     * Get the authenticated user.
     */
    /**
     * Get the authenticated user.
     */
    public function me(Request $request)
    {
        return $request->user()->load('person');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'sometimes|string|in:Admin,Student,Tutor',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Create empty person profile
        $user->person()->create([
            'first_name' => explode(' ', $user->name)[0],
            'last_name' => explode(' ', $user->name)[1] ?? '',
        ]);

        return response()->json($user, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return User::with('person')->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Security check: only allow user update themselves or admin
        if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|string|in:Admin,Student,Tutor',
            'state' => 'sometimes|string|in:Active,Inactive,Banned,On Validation',
            // Person fields
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'headline' => 'nullable|string|max:100',
            'biography' => 'nullable|string',
            'website' => 'nullable|string|max:255',
            'twitter' => 'nullable|string|max:255',
            'facebook' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'youtube' => 'nullable|string|max:255',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Separate user fields from person fields
        $userFields = ['email', 'password', 'role', 'state'];
        $userData = array_intersect_key($validated, array_flip($userFields));

        // Sync name if first/last are present
        if (isset($validated['first_name']) || isset($validated['last_name'])) {
            $fname = $validated['first_name'] ?? ($user->person->first_name ?? '');
            $lname = $validated['last_name'] ?? ($user->person->last_name ?? '');
            $userData['name'] = trim($fname . ' ' . $lname);
        } elseif (isset($validated['name'])) {
            $userData['name'] = $validated['name'];
        }

        $user->update($userData);

        // Prepare Person data
        $personFields = ['first_name', 'last_name', 'website', 'twitter', 'facebook', 'linkedin', 'youtube'];
        $personData = array_intersect_key($validated, array_flip($personFields));

        // Map UI fields to DB columns
        if (isset($validated['headline']))
            $personData['specialization'] = $validated['headline'];
        if (isset($validated['biography']))
            $personData['bio'] = $validated['biography'];

        if (!empty($personData)) {
            $user->person()->updateOrCreate(
                ['user_id' => $user->id],
                $personData
            );
        }

        return response()->json($user->load('person'));
    }

    public function uploadPhoto(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'profile_photo' => 'required|image|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
            $user->save();
        }

        return response()->json($user->load('person'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
