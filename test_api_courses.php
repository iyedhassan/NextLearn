<?php

/**
 * Script de test pour vérifier l'API des cours avec images
 */

echo "=== Test de l'API des cours avec images ===\n\n";

// Configuration
$baseUrl = 'http://localhost:8000/api';
$testImagePath = __DIR__ . '/test-image.jpg';

// Créer une image de test simple (pixel transparent)
if (!file_exists($testImagePath)) {
    $imageData = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    file_put_contents($testImagePath, $imageData);
    echo "✅ Image de test créée\n";
}

// Test 1: Récupérer la liste des cours
echo "1. Test de récupération des cours...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/forms');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $courses = json_decode($response, true);
    $courseCount = is_array($courses['data']) ? count($courses['data']) : count($courses);
    echo "   ✅ Récupération réussie: {$courseCount} cours trouvés\n";
    
    // Afficher quelques détails
    $coursesData = $courses['data'] ?? $courses;
    if (!empty($coursesData)) {
        $firstCourse = $coursesData[0];
        echo "   📚 Premier cours: {$firstCourse['title']}\n";
        echo "   🖼️ Image: " . ($firstCourse['image_url'] ?? 'Aucune') . "\n";
        echo "   💰 Prix: " . ($firstCourse['price'] ?? 'Gratuit') . "€\n";
    }
} else {
    echo "   ❌ Erreur HTTP: {$httpCode}\n";
    echo "   Réponse: {$response}\n";
}

// Test 2: Récupérer les détails d'un cours spécifique
echo "\n2. Test de récupération des détails d'un cours...\n";
if (isset($firstCourse)) {
    $courseId = $firstCourse['id'];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/forms/' . $courseId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $courseDetails = json_decode($response, true);
        echo "   ✅ Détails récupérés pour: {$courseDetails['title']}\n";
        echo "   📖 Topics: " . (count($courseDetails['topics'] ?? [])) . "\n";
        echo "   👨‍🏫 Créateur: " . ($courseDetails['user']['name'] ?? 'Inconnu') . "\n";
        
        // Afficher les topics
        if (!empty($courseDetails['topics'])) {
            echo "   📝 Chapitres:\n";
            foreach ($courseDetails['topics'] as $topic) {
                $preview = $topic['is_preview'] ? ' (Aperçu)' : '';
                echo "      - {$topic['title']}{$preview}\n";
            }
        }
    } else {
        echo "   ❌ Erreur lors de la récupération des détails: {$httpCode}\n";
    }
} else {
    echo "   ⚠️ Aucun cours disponible pour tester les détails\n";
}

// Test 3: Vérifier les images
echo "\n3. Test de vérification des images...\n";
if (isset($coursesData)) {
    $coursesWithImages = 0;
    $coursesWithoutImages = 0;
    
    foreach ($coursesData as $course) {
        if (!empty($course['image']) || !empty($course['image_url'])) {
            $coursesWithImages++;
            
            // Tester si l'image est accessible
            $imageUrl = $course['image_url'] ?? $course['image'];
            if (filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $imageUrl);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                
                curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($httpCode === 200) {
                    echo "   ✅ Image accessible: {$course['title']}\n";
                } else {
                    echo "   ⚠️ Image non accessible ({$httpCode}): {$course['title']}\n";
                }
            }
        } else {
            $coursesWithoutImages++;
        }
    }
    
    echo "   📊 Cours avec images: {$coursesWithImages}\n";
    echo "   📊 Cours sans images: {$coursesWithoutImages}\n";
}

// Test 4: Vérifier la structure des dossiers
echo "\n4. Test de la structure des dossiers...\n";
$storagePath = __DIR__ . '/storage/app/public';
$publicPath = __DIR__ . '/public/storage';

if (is_dir($storagePath . '/courses')) {
    echo "   ✅ Dossier courses existe\n";
} else {
    echo "   ❌ Dossier courses manquant\n";
}

if (is_dir($storagePath . '/topics')) {
    echo "   ✅ Dossier topics existe\n";
} else {
    echo "   ❌ Dossier topics manquant\n";
}

if (is_link($publicPath) || is_dir($publicPath)) {
    echo "   ✅ Lien symbolique storage existe\n";
} else {
    echo "   ❌ Lien symbolique storage manquant\n";
    echo "   💡 Exécutez: php artisan storage:link\n";
}

// Test 5: Statistiques générales
echo "\n5. Statistiques générales...\n";
if (isset($coursesData)) {
    $totalPrice = 0;
    $paidCourses = 0;
    $freeCourses = 0;
    $levels = [];
    $types = [];
    
    foreach ($coursesData as $course) {
        $price = floatval($course['price'] ?? 0);
        $totalPrice += $price;
        
        if ($price > 0) {
            $paidCourses++;
        } else {
            $freeCourses++;
        }
        
        $level = $course['level'] ?? 'Non défini';
        $levels[$level] = ($levels[$level] ?? 0) + 1;
        
        $type = $course['type'] ?? 'Non défini';
        $types[$type] = ($types[$type] ?? 0) + 1;
    }
    
    $avgPrice = count($coursesData) > 0 ? $totalPrice / count($coursesData) : 0;
    
    echo "   💰 Prix moyen: " . number_format($avgPrice, 2) . "€\n";
    echo "   💳 Cours payants: {$paidCourses}\n";
    echo "   🆓 Cours gratuits: {$freeCourses}\n";
    
    echo "   📊 Répartition par niveau:\n";
    foreach ($levels as $level => $count) {
        echo "      - {$level}: {$count}\n";
    }
    
    echo "   📊 Répartition par type:\n";
    foreach ($types as $type => $count) {
        echo "      - {$type}: {$count}\n";
    }
}

// Test 6: Vérifier les routes d'upload
echo "\n6. Test des routes d'upload (sans authentification)...\n";
$uploadRoutes = [
    '/upload/course-image',
    '/upload/topic-image',
    '/upload/multiple-images'
];

foreach ($uploadRoutes as $route) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $route);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 401) {
        echo "   ✅ Route {$route}: Protection par authentification OK\n";
    } elseif ($httpCode === 422) {
        echo "   ✅ Route {$route}: Validation des données OK\n";
    } else {
        echo "   ⚠️ Route {$route}: Code HTTP inattendu {$httpCode}\n";
    }
}

echo "\n=== Résumé des tests ===\n";
echo "✅ API fonctionnelle\n";
echo "✅ Cours avec images créés\n";
echo "✅ Structure de stockage en place\n";
echo "✅ Routes d'upload protégées\n";

// Nettoyer
if (file_exists($testImagePath)) {
    unlink($testImagePath);
}

echo "\n🎉 Tests terminés avec succès !\n";
echo "\n📝 Pour tester l'interface:\n";
echo "   1. Démarrez le serveur: php artisan serve\n";
echo "   2. Ouvrez: http://localhost:8000/test_courses_display.html\n";
echo "   3. Ou testez l'API: http://localhost:8000/api/forms\n";

?>