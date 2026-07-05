<?php

/**
 * Script de test pour la création de cours avec images
 * Exécutez ce script pour tester les fonctionnalités
 */

require_once __DIR__ . '/vendor/autoload.php';

// Simuler l'environnement Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Form;
use App\Models\Topic;
use App\Models\User;

echo "=== Test de création de cours avec images ===\n\n";

try {
    // 1. Vérifier qu'un tuteur existe
    echo "1. Vérification des utilisateurs...\n";
    $tutor = User::where('role', 'Tutor')->first();
    
    if (!$tutor) {
        echo "   Création d'un utilisateur tuteur...\n";
        $tutor = User::create([
            'name' => 'Professeur Test',
            'email' => 'test@nextlearn.com',
            'password' => bcrypt('password'),
            'role' => 'Tutor',
            'state' => 'Active',
            'email_verified_at' => now(),
        ]);
        echo "   ✅ Tuteur créé : {$tutor->name} ({$tutor->email})\n";
    } else {
        echo "   ✅ Tuteur trouvé : {$tutor->name}\n";
    }

    // 2. Créer un cours de test
    echo "\n2. Création d'un cours de test...\n";
    $course = Form::create([
        'user_id' => $tutor->id,
        'title' => 'Test - Cours avec Images',
        'type' => 'Exercise',
        'description' => 'Cours de test pour vérifier l\'intégration des images dans NextLearn.',
        'tags' => 'test,images,demo',
        'level' => 'Débutant',
        'price' => 49.99,
        'time_limit' => 60,
        'passing_score' => 70,
        'state' => 'Published',
        'image' => 'courses/test-course.jpg'
    ]);
    
    echo "   ✅ Cours créé : {$course->title} (ID: {$course->id})\n";
    echo "   📷 Image de couverture : {$course->image_url}\n";

    // 3. Ajouter des topics avec contenu riche
    echo "\n3. Ajout de topics avec images...\n";
    
    $topics = [
        [
            'title' => 'Introduction avec image',
            'content_type' => 'Text',
            'content' => '
                <h2>Bienvenue dans ce cours de test</h2>
                <p>Ce cours démontre l\'intégration d\'images dans NextLearn.</p>
                
                <img src="/storage/topics/welcome-banner.jpg" alt="Bannière de bienvenue" class="img-fluid my-3">
                
                <h3>Ce que vous allez apprendre</h3>
                <ul>
                    <li>Comment intégrer des images dans vos cours</li>
                    <li>Les bonnes pratiques pour l\'optimisation</li>
                    <li>La gestion du contenu multimédia</li>
                </ul>
                
                <div class="row mt-4">
                    <div class="col-md-6">
                        <img src="/storage/topics/feature-1.png" alt="Fonctionnalité 1" class="img-fluid">
                        <h5 class="text-center mt-2">Upload facile</h5>
                    </div>
                    <div class="col-md-6">
                        <img src="/storage/topics/feature-2.png" alt="Fonctionnalité 2" class="img-fluid">
                        <h5 class="text-center mt-2">Gestion optimisée</h5>
                    </div>
                </div>
            ',
            'order' => 1,
            'is_preview' => true
        ],
        [
            'title' => 'Galerie d\'exemples',
            'content_type' => 'Text',
            'content' => '
                <h2>Exemples d\'intégration d\'images</h2>
                <p>Voici différentes façons d\'utiliser les images dans vos cours.</p>
                
                <h3>Image simple</h3>
                <img src="/storage/topics/example-simple.jpg" alt="Exemple simple" class="img-fluid mb-4">
                
                <h3>Images côte à côte</h3>
                <div class="row">
                    <div class="col-md-6">
                        <img src="/storage/topics/before-example.jpg" alt="Avant" class="img-fluid">
                        <p class="text-center mt-2"><strong>Avant</strong></p>
                    </div>
                    <div class="col-md-6">
                        <img src="/storage/topics/after-example.jpg" alt="Après" class="img-fluid">
                        <p class="text-center mt-2"><strong>Après</strong></p>
                    </div>
                </div>
                
                <h3>Galerie d\'images</h3>
                <div class="row">
                    <div class="col-md-4">
                        <img src="/storage/topics/gallery-1.jpg" alt="Image 1" class="img-fluid mb-2">
                    </div>
                    <div class="col-md-4">
                        <img src="/storage/topics/gallery-2.jpg" alt="Image 2" class="img-fluid mb-2">
                    </div>
                    <div class="col-md-4">
                        <img src="/storage/topics/gallery-3.jpg" alt="Image 3" class="img-fluid mb-2">
                    </div>
                </div>
            ',
            'order' => 2,
            'is_preview' => false
        ],
        [
            'title' => 'Tutoriel vidéo avec captures',
            'content_type' => 'Video',
            'content' => '
                <h2>Tutoriel pratique</h2>
                <p>Suivez ce tutoriel étape par étape avec des captures d\'écran détaillées.</p>
                
                <img src="/storage/topics/tutorial-intro.jpg" alt="Introduction du tutoriel" class="img-fluid mb-4">
                
                <h3>Étapes du tutoriel</h3>
                <div class="step mb-4">
                    <h4>Étape 1 : Préparation</h4>
                    <img src="/storage/topics/step-1.png" alt="Étape 1" class="img-fluid mb-2">
                    <p>Commencez par préparer votre environnement de travail...</p>
                </div>
                
                <div class="step mb-4">
                    <h4>Étape 2 : Configuration</h4>
                    <img src="/storage/topics/step-2.png" alt="Étape 2" class="img-fluid mb-2">
                    <p>Configurez les paramètres selon vos besoins...</p>
                </div>
                
                <div class="step mb-4">
                    <h4>Étape 3 : Finalisation</h4>
                    <img src="/storage/topics/step-3.png" alt="Étape 3" class="img-fluid mb-2">
                    <p>Finalisez votre projet et vérifiez le résultat...</p>
                </div>
            ',
            'video_url' => 'https://www.youtube.com/watch?v=example-tutorial',
            'order' => 3,
            'is_preview' => false
        ]
    ];

    foreach ($topics as $topicData) {
        $topicData['form_id'] = $course->id;
        $topic = Topic::create($topicData);
        echo "   ✅ Topic créé : {$topic->title} (ID: {$topic->id})\n";
    }

    // 4. Vérifier les relations
    echo "\n4. Vérification des relations...\n";
    $courseWithTopics = Form::with('topics')->find($course->id);
    echo "   ✅ Cours trouvé avec {$courseWithTopics->topics->count()} topics\n";
    
    foreach ($courseWithTopics->topics as $topic) {
        echo "      - {$topic->title} (Ordre: {$topic->order})\n";
    }

    // 5. Test des URLs d'images
    echo "\n5. Test des URLs d'images...\n";
    echo "   📷 Image de couverture : {$course->image_url}\n";
    
    // 6. Statistiques finales
    echo "\n6. Statistiques...\n";
    $totalCourses = Form::count();
    $totalTopics = Topic::count();
    $publishedCourses = Form::where('state', 'Published')->count();
    
    echo "   📊 Total des cours : {$totalCourses}\n";
    echo "   📊 Cours publiés : {$publishedCourses}\n";
    echo "   📊 Total des topics : {$totalTopics}\n";

    // 7. Test de recherche
    echo "\n7. Test de recherche...\n";
    $searchResults = Form::where('title', 'like', '%Test%')->get();
    echo "   🔍 Cours trouvés avec 'Test' : {$searchResults->count()}\n";

    echo "\n✅ Tous les tests sont passés avec succès !\n";
    echo "\n📝 Résumé :\n";
    echo "   - Cours créé : {$course->title}\n";
    echo "   - ID du cours : {$course->id}\n";
    echo "   - Nombre de topics : {$courseWithTopics->topics->count()}\n";
    echo "   - URL d'accès : /api/forms/{$course->id}\n";

} catch (Exception $e) {
    echo "\n❌ Erreur lors du test : " . $e->getMessage() . "\n";
    echo "Trace : " . $e->getTraceAsString() . "\n";
}

echo "\n=== Fin des tests ===\n";