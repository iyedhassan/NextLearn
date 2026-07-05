<?php

/**
 * Démonstration de l'upload d'images pour les cours
 * Ce script montre comment uploader des images via l'API
 */

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

echo "=== Démonstration Upload d'Images ===\n\n";

// Créer des images d'exemple (pixels colorés simples)
function createSampleImage($filename, $color = 'blue') {
    $colors = [
        'blue' => [0, 100, 200],
        'green' => [0, 150, 0],
        'red' => [200, 50, 50],
        'purple' => [150, 0, 150],
        'orange' => [255, 165, 0]
    ];
    
    $rgb = $colors[$color] ?? $colors['blue'];
    
    // Créer une image 400x300
    $image = imagecreate(400, 300);
    $bgColor = imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);
    $textColor = imagecolorallocate($image, 255, 255, 255);
    
    // Ajouter du texte
    $text = strtoupper($color) . ' IMAGE';
    imagestring($image, 5, 150, 140, $text, $textColor);
    
    // Sauvegarder
    imagejpeg($image, $filename, 90);
    imagedestroy($image);
    
    return $filename;
}

try {
    // 1. Créer des images d'exemple
    echo "1. Création d'images d'exemple...\n";
    
    $tempDir = sys_get_temp_dir();
    $sampleImages = [
        'course-cover.jpg' => createSampleImage($tempDir . '/course-cover.jpg', 'blue'),
        'topic-intro.jpg' => createSampleImage($tempDir . '/topic-intro.jpg', 'green'),
        'topic-demo.jpg' => createSampleImage($tempDir . '/topic-demo.jpg', 'red'),
        'topic-example.jpg' => createSampleImage($tempDir . '/topic-example.jpg', 'purple'),
        'topic-conclusion.jpg' => createSampleImage($tempDir . '/topic-conclusion.jpg', 'orange')
    ];
    
    echo "   ✅ " . count($sampleImages) . " images créées\n\n";
    
    // 2. Trouver ou créer un tuteur
    $tutor = User::firstOrCreate(
        ['email' => 'demo@nextlearn.com'],
        [
            'name' => 'Démo Tuteur',
            'password' => bcrypt('password'),
            'role' => 'Tutor',
            'state' => 'Active',
            'email_verified_at' => now(),
        ]
    );
    
    echo "2. Tuteur: {$tutor->name}\n\n";
    
    // 3. Uploader l'image de couverture et créer le cours
    echo "3. Upload de l'image de couverture...\n";
    
    $coverImagePath = $sampleImages['course-cover.jpg'];
    $coverFilename = 'courses/demo-' . time() . '.jpg';
    
    // Simuler l'upload en copiant directement dans le storage
    $storagePath = storage_path('app/public/' . $coverFilename);
    $storageDir = dirname($storagePath);
    
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
    }
    
    copy($coverImagePath, $storagePath);
    echo "   ✅ Image de couverture uploadée: {$coverFilename}\n";
    
    // 4. Créer le cours avec l'image
    echo "\n4. Création du cours avec image...\n";
    
    $course = Form::create([
        'user_id' => $tutor->id,
        'title' => 'Cours Démo avec Images Uploadées',
        'type' => 'Exercise',
        'description' => 'Ce cours démontre l\'upload et l\'utilisation d\'images dans NextLearn. Toutes les images ont été uploadées via le système.',
        'tags' => 'demo,upload,images,test',
        'level' => 'Débutant',
        'price' => 49.99,
        'time_limit' => 90,
        'passing_score' => 70,
        'state' => 'Published',
        'image' => $coverFilename
    ]);
    
    echo "   ✅ Cours créé: {$course->title} (ID: {$course->id})\n";
    echo "   🖼️ Image URL: {$course->image_url}\n";
    
    // 5. Uploader les images des topics et créer les chapitres
    echo "\n5. Upload des images de topics et création des chapitres...\n";
    
    $topicsData = [
        [
            'title' => 'Introduction avec Image Uploadée',
            'image_key' => 'topic-intro.jpg',
            'content_template' => '
                <h2>Bienvenue dans ce cours démo</h2>
                <p>Cette image a été uploadée via le système NextLearn :</p>
                <img src="/storage/topics/{IMAGE_PATH}" alt="Image d\'introduction" class="img-fluid my-4">
                <p>Le système d\'upload permet de gérer facilement vos images de cours.</p>
            '
        ],
        [
            'title' => 'Démonstration Pratique',
            'image_key' => 'topic-demo.jpg',
            'content_template' => '
                <h2>Démonstration avec Image</h2>
                <p>Voici un exemple de chapitre avec une image uploadée :</p>
                <div class="text-center my-4">
                    <img src="/storage/topics/{IMAGE_PATH}" alt="Démonstration" class="img-fluid" style="max-width: 80%;">
                    <p class="mt-2"><small>Image uploadée automatiquement</small></p>
                </div>
                <p>L\'image est automatiquement redimensionnée et optimisée.</p>
            '
        ],
        [
            'title' => 'Exemple Avancé',
            'image_key' => 'topic-example.jpg',
            'content_template' => '
                <h2>Exemple Avancé d\'Utilisation</h2>
                <p>Les images peuvent être intégrées de différentes manières :</p>
                
                <div class="row">
                    <div class="col-md-8">
                        <h4>Contenu principal</h4>
                        <p>Votre contenu textuel principal peut accompagner l\'image pour créer une expérience d\'apprentissage riche et engageante.</p>
                        <ul>
                            <li>Images haute qualité</li>
                            <li>Redimensionnement automatique</li>
                            <li>Optimisation pour le web</li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <img src="/storage/topics/{IMAGE_PATH}" alt="Exemple" class="img-fluid">
                    </div>
                </div>
            '
        ],
        [
            'title' => 'Conclusion avec Image',
            'image_key' => 'topic-conclusion.jpg',
            'content_template' => '
                <h2>Conclusion du Cours</h2>
                <p>Félicitations ! Vous avez terminé ce cours de démonstration.</p>
                
                <img src="/storage/topics/{IMAGE_PATH}" alt="Conclusion" class="img-fluid my-4">
                
                <div class="alert alert-success">
                    <h5>✅ Ce que vous avez appris :</h5>
                    <ul class="mb-0">
                        <li>Comment les images sont intégrées dans NextLearn</li>
                        <li>L\'upload automatique et l\'optimisation</li>
                        <li>L\'affichage responsive des images</li>
                    </ul>
                </div>
            '
        ]
    ];
    
    foreach ($topicsData as $index => $topicData) {
        // Upload de l'image du topic
        $sourceImage = $sampleImages[$topicData['image_key']];
        $topicFilename = 'topics/demo-topic-' . ($index + 1) . '-' . time() . '.jpg';
        $topicStoragePath = storage_path('app/public/' . $topicFilename);
        $topicStorageDir = dirname($topicStoragePath);
        
        if (!is_dir($topicStorageDir)) {
            mkdir($topicStorageDir, 0755, true);
        }
        
        copy($sourceImage, $topicStoragePath);
        
        // Remplacer le placeholder dans le contenu
        $content = str_replace('{IMAGE_PATH}', $topicFilename, $topicData['content_template']);
        
        // Créer le topic
        $topic = Topic::create([
            'form_id' => $course->id,
            'title' => $topicData['title'],
            'content_type' => 'Text',
            'content' => $content,
            'order' => $index + 1,
            'is_preview' => $index === 0 // Premier chapitre en aperçu
        ]);
        
        echo "   ✅ Topic créé: {$topic->title}\n";
        echo "      📷 Image: /storage/{$topicFilename}\n";
    }
    
    // 6. Statistiques finales
    echo "\n6. Statistiques du cours créé...\n";
    $courseWithTopics = Form::with('topics')->find($course->id);
    
    echo "   📚 Titre: {$courseWithTopics->title}\n";
    echo "   🆔 ID: {$courseWithTopics->id}\n";
    echo "   📖 Chapitres: " . $courseWithTopics->topics->count() . "\n";
    echo "   🖼️ Images uploadées: " . (count($topicsData) + 1) . "\n";
    echo "   💰 Prix: {$courseWithTopics->price}€\n";
    echo "   🌐 URL API: /api/forms/{$courseWithTopics->id}\n";
    
    // 7. Vérifier que les images sont accessibles
    echo "\n7. Vérification des images...\n";
    
    // Vérifier l'image de couverture
    if (file_exists(storage_path('app/public/' . $course->image))) {
        echo "   ✅ Image de couverture: OK\n";
    } else {
        echo "   ❌ Image de couverture: Manquante\n";
    }
    
    // Vérifier les images des topics
    $topicImagesOk = 0;
    foreach ($courseWithTopics->topics as $topic) {
        // Extraire les chemins d'images du contenu
        preg_match_all('/\/storage\/topics\/([^"]+)/', $topic->content, $matches);
        foreach ($matches[1] as $imagePath) {
            if (file_exists(storage_path('app/public/topics/' . $imagePath))) {
                $topicImagesOk++;
            }
        }
    }
    
    echo "   ✅ Images de topics: {$topicImagesOk} OK\n";
    
    // 8. Nettoyer les fichiers temporaires
    echo "\n8. Nettoyage...\n";
    foreach ($sampleImages as $tempFile) {
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
    }
    echo "   ✅ Fichiers temporaires supprimés\n";
    
    echo "\n🎉 Démonstration terminée avec succès !\n";
    echo "\n📝 Pour voir le résultat :\n";
    echo "   1. Démarrez le serveur: php artisan serve\n";
    echo "   2. Ouvrez: http://localhost:8000/test_courses_display.html\n";
    echo "   3. Cherchez le cours: '{$course->title}'\n";
    echo "   4. Ou directement: http://localhost:8000/api/forms/{$course->id}\n";
    
    echo "\n📊 Résumé :\n";
    echo "   - Cours créé avec image de couverture uploadée\n";
    echo "   - " . count($topicsData) . " chapitres avec images uploadées\n";
    echo "   - Toutes les images sont stockées dans storage/app/public/\n";
    echo "   - Les URLs sont générées automatiquement\n";
    echo "   - Le contenu HTML intègre les images de manière responsive\n";

} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    
    // Nettoyer en cas d'erreur
    if (isset($sampleImages)) {
        foreach ($sampleImages as $tempFile) {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }
}

?>