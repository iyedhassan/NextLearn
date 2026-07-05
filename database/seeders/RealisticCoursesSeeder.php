<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\User;
use App\Models\Topic;
use App\Models\Category;

class RealisticCoursesSeeder extends Seeder
{
    public function run()
    {
        $tutor = User::firstWhere('role', 'Tutor');
        if (!$tutor) {
            $tutor = User::create([
                'name' => 'Jean Dupont',
                'email' => 'jean.dupont@nextlearn.com',
                'password' => bcrypt('password'),
                'role' => 'Tutor',
                'state' => 'Active',
            ]);
        }

        $courses = [
            [
                'title' => 'Masterclass Photographie Paysage',
                'description' => 'Apprenez à capturer la beauté de la nature avec des techniques de composition et d\'exposition avancées.',
                'tags' => 'Photo, Art, Nature',
                'level' => 'Intermédiaire',
                'price' => 79.99,
                'image' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
                'topics' => ['Introduction au matériel', 'Règle des tiers', 'Gestion de l\'heure dorée']
            ],
            [
                'title' => 'Cuisine Gastronomique Italienne',
                'description' => 'Découvrez les secrets des chefs italiens pour réaliser des pâtes fraîches et des sauces authentiques.',
                'tags' => 'Cuisine, Gastronomie, Italie',
                'level' => 'Débutant',
                'price' => 45.00,
                'image' => 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=1200&q=80',
                'topics' => ['Les ingrédients clés', 'Technique de la pâte à la main', 'Dressage d\'assiette']
            ],
            [
                'title' => 'Méditation et Pleine Conscience',
                'description' => 'Réduisez votre stress et améliorez votre concentration grâce à des exercices quotidiens de méditation.',
                'tags' => 'Bien-être, Santé, Méditation',
                'level' => 'Tous niveaux',
                'price' => 0.00,
                'image' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
                'topics' => ['La respiration', 'Balayage corporel', 'Gestion des pensées envahissantes']
            ],
            [
                'title' => 'Finance Personnelle et Investissement',
                'description' => 'Prenez le contrôle de votre avenir financier. Apprenez à budgétiser, épargner et investir intelligemment.',
                'tags' => 'Finance, Business, Argent',
                'level' => 'Débutant',
                'price' => 120.00,
                'image' => 'https://images.unsplash.com/photo-1579621970795-87f9ac756a72?auto=format&fit=crop&w=1200&q=80',
                'topics' => ['Comprendre l\'intérêt composé', 'Stratégie d\'épargne', 'Base de la bourse']
            ],
            [
                'title' => 'Architecture Moderne et Design',
                'description' => 'Explorez les principes de l\'architecture contemporaine et l\'impact du design sur notre environnement.',
                'tags' => 'Architecture, Design, Art',
                'level' => 'Amateur',
                'price' => 95.00,
                'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
                'topics' => ['Histoire du modernisme', 'Matériaux durables', 'Urbanisme futuriste']
            ]
        ];

        foreach ($courses as $cData) {
            $topics = $cData['topics'];
            unset($cData['topics']);

            $cData['user_id'] = $tutor->id;
            $cData['type'] = 'Admission';
            $cData['state'] = 'Published';

            // Assign category based on the first tag
            $tags = explode(',', $cData['tags']);
            $categoryName = trim($tags[0]);
            $cData['category_id'] = Category::findOrCreateByName($categoryName)->id;

            $course = Form::create($cData);

            foreach ($topics as $idx => $tTitle) {
                Topic::create([
                    'form_id' => $course->id,
                    'title' => $tTitle,
                    'content' => 'Contenu détaillé pour ' . $tTitle,
                    'order' => $idx + 1
                ]);
            }
        }

        $this->command->info('5 nouveaux cours avec images ont été créés !');
    }
}
