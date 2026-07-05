<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload une image pour un cours
     */
    public function uploadCourseImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'course_id' => 'nullable|exists:forms,id'
        ]);

        try {
            $file = $request->file('image');

            // Générer un nom unique
            $filename = 'courses/' . Str::random(20) . '.' . $file->getClientOriginalExtension();

            // Stocker l'image
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            $path = $disk->putFileAs('', $file, $filename);

            // Retourner l'URL complète
            $url = $disk->url($path);

            return response()->json([
                'success' => true,
                'path' => $path,
                'url' => $url,
                'full_url' => asset('storage/' . $path)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload une image pour le contenu d'un topic
     */
    public function uploadTopicImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'topic_id' => 'nullable|exists:topics,id'
        ]);

        try {
            $file = $request->file('image');

            // Générer un nom unique
            $filename = 'topics/' . Str::random(20) . '.' . $file->getClientOriginalExtension();

            // Stocker l'image
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            $path = $disk->putFileAs('', $file, $filename);

            // Retourner l'URL complète
            $url = $disk->url($path);

            return response()->json([
                'success' => true,
                'path' => $path,
                'url' => $url,
                'full_url' => asset('storage/' . $path)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload multiple images
     */
    public function uploadMultipleImages(Request $request)
    {
        $request->validate([
            'images' => 'required|array|max:5', // Max 5 images
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'type' => 'required|in:course,topic'
        ]);

        try {
            $uploadedImages = [];

            foreach ($request->file('images') as $file) {
                $directory = $request->type === 'course' ? 'courses' : 'topics';
                $filename = $directory . '/' . Str::random(20) . '.' . $file->getClientOriginalExtension();

                /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                $disk = Storage::disk('public');

                $path = $disk->putFileAs('', $file, $filename);
                $url = $disk->url($path);

                $uploadedImages[] = [
                    'path' => $path,
                    'url' => $url,
                    'full_url' => asset('storage/' . $path)
                ];
            }

            return response()->json([
                'success' => true,
                'images' => $uploadedImages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une image
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            if (Storage::disk('public')->exists($request->path)) {
                Storage::disk('public')->delete($request->path);

                return response()->json([
                    'success' => true,
                    'message' => 'Image supprimée avec succès'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Image non trouvée'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
            ], 500);
        }
    }
}