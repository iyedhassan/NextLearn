<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Form;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with('course.user')
            ->get();

        return response()->json($favorites);
    }

    public function toggle(Request $request, $courseId)
    {
        $user = $request->user();
        $course = Form::findOrFail($courseId);

        $favorite = Favorite::where('user_id', $user->id)
            ->where('form_id', $course->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['favorited' => false, 'message' => 'Supprimé des favoris']);
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'form_id' => $course->id
            ]);
            return response()->json(['favorited' => true, 'message' => 'Ajouté aux favoris']);
        }
    }
}
