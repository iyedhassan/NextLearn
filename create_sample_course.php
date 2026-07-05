<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Form;
use App\Models\Topic;
use App\Models\User;

echo "=== Création d'un cours avec images ===\n\n";

try {
    // 1. Créer ou trouver un utilisateur tuteur
    $tutor = User::firstOrCreate(
        ['email' => 'tuteur@nextlearn.com'],
        [
            'name' => 'Professeur Martin',
            'password' => bcrypt('password123'),
            'role' => 'Tutor',
            'state' => 'Active',
            'email_verified_at' => now(),
        ]
    );

    echo "✅ Tuteur: {$tutor->name} ({$tutor->email})\n\n";

    // 2. Créer un cours de photographie
    $course = Form::create([
        'user_id' => $tutor->id,
        'title' => 'Cours de Photographie Numérique',
        'type' => 'Exercise',
        'description' => 'Apprenez les techniques de base de la photographie numérique. Ce cours couvre la composition, l\'éclairage, et le post-traitement.',
        'tags' => 'photographie,numérique,art,créativité,appareil photo',
        'level' => 'Débutant',
        'price' => 129.99,
        'time_limit' => 180, // 3 heures
        'passing_score' => 75,
        'state' => 'Published',
        'image' => 'courses/photography-course.jpg' // Chemin vers l'image
    ]);

    echo "✅ Cours créé: {$course->title}\n";
    echo "   ID: {$course->id}\n";
    echo "   Prix: {$course->price}€\n";
    echo "   Image: {$course->image_url}\n\n";

    // 3. Ajouter des chapitres (topics) avec du contenu riche
    $topics = [
        [
            'title' => 'Introduction à la Photographie',
            'content_type' => 'Text',
            'content' => '
                <div class="course-content">
                    <h2>Bienvenue dans le monde de la photographie !</h2>
                    
                    <img src="/storage/topics/photography-intro.jpg" alt="Introduction à la photographie" class="img-fluid my-4" style="max-width: 100%; height: auto;">
                    
                    <p>La photographie est l\'art de capturer la lumière et les moments. Dans ce cours, vous découvrirez :</p>
                    
                    <ul>
                        <li>Les bases de la composition</li>
                        <li>La gestion de la lumière</li>
                        <li>Les réglages de l\'appareil photo</li>
                        <li>Le post-traitement</li>
                    </ul>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <img src="/storage/topics/camera-basics.jpg" alt="Bases de l\'appareil photo" class="img-fluid">
                            <p class="text-center mt-2"><small>Les contrôles de base de votre appareil</small></p>
                        </div>
                        <div class="col-md-6">
                            <img src="/storage/topics/composition-rules.jpg" alt="Règles de composition" class="img-fluid">
                            <p class="text-center mt-2"><small>Les règles de composition essentielles</small></p>
                        </div>
                    </div>
                </div>
            ',
            'order' => 1,
            'is_preview' => true
        ],
        [
            'title' => 'La Règle des Tiers',
            'content_type' => 'Text',
            'content' => '
                <div class="course-content">
                    <h2>Maîtriser la Règle des Tiers</h2>
                    
                    <p>La règle des tiers est l\'une des techniques de composition les plus importantes en photographie.</p>
                    
                    <img src="/storage/topics/rule-of-thirds-grid.jpg" alt="Grille de la règle des tiers" class="img-fluid my-4">
                    
                    <h3>Comment l\'appliquer ?</h3>
                    <p>Divisez votre image en 9 sections égales avec 2 lignes horizontales et 2 lignes verticales. Placez les éléments importants le long de ces lignes ou à leurs intersections.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h4>❌ Sans la règle des tiers</h4>
                            <img src="/storage/topics/photo-without-rule.jpg" alt="Photo sans règle des tiers" class="img-fluid mb-3">
                            <p>Le sujet est centré, l\'image manque de dynamisme.</p>
                        </div>
                        <div class="col-md-6">
                            <h4>✅ Avec la règle des tiers</h4>
                            <img src="/storage/topics/photo-with-rule.jpg" alt="Photo avec règle des tiers" class="img-fluid mb-3">
                            <p>Le sujet est placé sur une ligne de force, l\'image est plus équilibrée.</p>
                        </div>
                    </div>
                    
                    <div class="alert alert-info mt-4">
                        <h5>💡 Conseil pratique</h5>
                        <p>Activez la grille sur votre appareil photo ou smartphone pour vous aider à appliquer cette règle !</p>
                    </div>
                </div>
            ',
            'order' => 2,
            'is_preview' => false
        ],
        [
            'title' => 'Gestion de la Lumière',
            'content_type' => 'Text',
            'content' => '
                <div class="course-content">
                    <h2>Comprendre et Maîtriser la Lumière</h2>
                    
                    <p>La lumière est l\'élément le plus important en photographie. Apprenez à l\'utiliser à votre avantage.</p>
                    
                    <img src="/storage/topics/light-management.jpg" alt="Gestion de la lumière" class="img-fluid my-4">
                    
                    <h3>Types de Lumière</h3>
                    
                    <div class="row">
                        <div class="col-md-4">
                            <img src="/storage/topics/natural-light.jpg" alt="Lumière naturelle" class="img-fluid mb-2">
                            <h5>Lumière Naturelle</h5>
                            <p>Douce et flatteuse, idéale pour les portraits.</p>
                        </div>
                        <div class="col-md-4">
                            <img src="/storage/topics/artificial-light.jpg" alt="Lumière artificielle" class="img-fluid mb-2">
                            <h5>Lumière Artificielle</h5>
                            <p>Contrôlable et constante, parfaite en studio.</p>
                        </div>
                        <div class="col-md-4">
                            <img src="/storage/topics/mixed-light.jpg" alt="Lumière mixte" class="img-fluid mb-2">
                            <h5>Lumière Mixte</h5>
                            <p>Combinaison créative des deux sources.</p>
                        </div>
                    </div>
                    
                    <h3>Heures Dorées</h3>
                    <img src="/storage/topics/golden-hour.jpg" alt="Heure dorée" class="img-fluid my-3">
                    <p>Photographiez pendant l\'heure dorée (lever et coucher du soleil) pour obtenir une lumière chaude et douce.</p>
                </div>
            ',
            'order' => 3,
            'is_preview' => false
        ],
        [
            'title' => 'Post-traitement avec Lightroom',
            'content_type' => 'Video',
            'content' => '
                <div class="course-content">
                    <h2>Sublimer vos Photos avec Lightroom</h2>
                    
                    <p>Le post-traitement est essentiel pour révéler tout le potentiel de vos photos.</p>
                    
                    <img src="/storage/topics/lightroom-interface.jpg" alt="Interface Lightroom" class="img-fluid my-4">
                    
                    <h3>Workflow de Base</h3>
                    
                    <div class="step-by-step">
                        <div class="step mb-4">
                            <h4>1. Import et Organisation</h4>
                            <img src="/storage/topics/lightroom-import.jpg" alt="Import Lightroom" class="img-fluid mb-2">
                            <p>Importez vos photos et organisez-les en collections.</p>
                        </div>
                        
                        <div class="step mb-4">
                            <h4>2. Corrections de Base</h4>
                            <img src="/storage/topics/basic-corrections.jpg" alt="Corrections de base" class="img-fluid mb-2">
                            <p>Ajustez l\'exposition, les hautes lumières et les ombres.</p>
                        </div>
                        
                        <div class="step mb-4">
                            <h4>3. Corrections Locales</h4>
                            <img src="/storage/topics/local-corrections.jpg" alt="Corrections locales" class="img-fluid mb-2">
                            <p>Utilisez les outils de masquage pour des ajustements précis.</p>
                        </div>
                    </div>
                    
                    <div class="before-after mt-4">
                        <h3>Avant / Après</h3>
                        <div class="row">
                            <div class="col-md-6">
                                <img src="/storage/topics/photo-before-edit.jpg" alt="Avant retouche" class="img-fluid">
                                <p class="text-center mt-2"><strong>Avant</strong></p>
                            </div>
                            <div class="col-md-6">
                                <img src="/storage/topics/photo-after-edit.jpg" alt="Après retouche" class="img-fluid">
                                <p class="text-center mt-2"><strong>Après</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            ',
            'video_url' => 'https://www.youtube.com/watch?v=lightroom-tutorial',
            'order' => 4,
            'is_preview' => false
        ]
    ];

    // Créer les topics
    foreach ($topics as $topicData) {
        $topicData['form_id'] = $course->id;
        $topic = Topic::create($topicData);
        echo "✅ Chapitre créé: {$topic->title}\n";
    }

    echo "\n=== Cours créé avec succès ! ===\n";
    echo "📚 Titre: {$course->title}\n";
    echo "🆔 ID: {$course->id}\n";
    echo "👨‍🏫 Créateur: {$tutor->name}\n";
    echo "💰 Prix: {$course->price}€\n";
    echo "📊 Niveau: {$course->level}\n";
    echo "📝 Chapitres: " . count($topics) . "\n";
    echo "🌐 URL API: /api/forms/{$course->id}\n";
    echo "🖼️ Image: {$course->image_url}\n";

    // Créer un deuxième cours pour la démonstration
    echo "\n=== Création d'un second cours ===\n";
    
    $webCourse = Form::create([
        'user_id' => $tutor->id,
        'title' => 'Développement Web Moderne',
        'type' => 'Exercise',
        'description' => 'Apprenez à créer des sites web modernes avec HTML5, CSS3, JavaScript et React. Formation complète du débutant au niveau avancé.',
        'tags' => 'web,html,css,javascript,react,frontend',
        'level' => 'Intermédiaire',
        'price' => 199.99,
        'time_limit' => 300, // 5 heures
        'passing_score' => 80,
        'state' => 'Published',
        'image' => 'courses/web-development.jpg'
    ]);

    echo "✅ Cours web créé: {$webCourse->title} (ID: {$webCourse->id})\n";

    // Ajouter quelques topics au cours web
    $webTopics = [
        [
            'title' => 'HTML5 Sémantique',
            'content_type' => 'Text',
            'content' => '
                <h2>Structure HTML5 Moderne</h2>
                <p>Découvrez les nouvelles balises sémantiques de HTML5.</p>
                <img src="/storage/topics/html5-semantic.png" alt="HTML5 Sémantique" class="img-fluid my-3">
                <pre><code>&lt;header&gt;&lt;/header&gt;
&lt;nav&gt;&lt;/nav&gt;
&lt;main&gt;&lt;/main&gt;
&lt;footer&gt;&lt;/footer&gt;</code></pre>
            ',
            'order' => 1,
            'is_preview' => true
        ],
        [
            'title' => 'CSS Grid et Flexbox',
            'content_type' => 'Text',
            'content' => '
                <h2>Layouts Modernes avec CSS</h2>
                <img src="/storage/topics/css-grid-flexbox.jpg" alt="CSS Grid et Flexbox" class="img-fluid my-3">
                <p>Maîtrisez les techniques de layout les plus puissantes de CSS.</p>
            ',
            'order' => 2,
            'is_preview' => false
        ]
    ];

    foreach ($webTopics as $topicData) {
        $topicData['form_id'] = $webCourse->id;
        Topic::create($topicData);
    }

    echo "✅ Chapitres web ajoutés\n";

    // Statistiques finales
    $totalCourses = Form::count();
    $totalTopics = Topic::count();
    
    echo "\n📊 STATISTIQUES FINALES:\n";
    echo "   Total des cours: {$totalCourses}\n";
    echo "   Total des chapitres: {$totalTopics}\n";
    echo "   Cours publiés: " . Form::where('state', 'Published')->count() . "\n";

    echo "\n🎉 Insertion terminée avec succès !\n";

} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}