<?php

/**
 * Exemple de script pour créer des cours avec des images
 * Ce script montre comment insérer des cours avec des photos dans NextLearn
 */

require_once __DIR__ . '/../vendor/autoload.php';

use App\Models\Form;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * Exemple 1: Créer un cours avec une image de couverture
 */
function createCourseWithCoverImage()
{
    // Trouver un utilisateur tuteur ou admin
    $tutor = User::where('role', 'Tutor')->first();
    
    if (!$tutor) {
        echo "Aucun tuteur trouvé. Créez d'abord un utilisateur avec le rôle 'Tutor'.\n";
        return;
    }

    // Créer le cours avec une image de couverture
    $course = Form::create([
        'user_id' => $tutor->id,
        'title' => 'Introduction à la Programmation Web',
        'type' => 'Exercise',
        'description' => 'Apprenez les bases du développement web avec HTML, CSS et JavaScript. Ce cours couvre tous les concepts fondamentaux nécessaires pour créer vos premiers sites web.',
        'tags' => 'web,html,css,javascript,débutant',
        'level' => 'Débutant',
        'price' => 99.99,
        'time_limit' => 120, // 2 heures
        'passing_score' => 70,
        'state' => 'Published',
        // URL d'image ou chemin vers le stockage
        'image' => 'courses/web-programming-intro.jpg'
    ]);

    echo "Cours créé avec succès: {$course->title} (ID: {$course->id})\n";
    echo "Image de couverture: {$course->image_url}\n";

    return $course;
}

/**
 * Exemple 2: Ajouter des topics avec du contenu et des images
 */
function addTopicsWithImages($courseId)
{
    $topics = [
        [
            'title' => 'Introduction au HTML',
            'content_type' => 'Text',
            'content' => '
                <h2>Qu\'est-ce que le HTML ?</h2>
                <p>HTML (HyperText Markup Language) est le langage de balisage standard pour créer des pages web.</p>
                
                <img src="/storage/topics/html-structure.png" alt="Structure HTML" class="img-fluid my-3">
                
                <h3>Structure de base</h3>
                <pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
    &lt;title&gt;Ma première page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Bonjour le monde !&lt;/h1&gt;
&lt;/body&gt;
&lt;/html&gt;
                </code></pre>
                
                <img src="/storage/topics/html-example.png" alt="Exemple HTML" class="img-fluid my-3">
            ',
            'order' => 1,
            'is_preview' => true
        ],
        [
            'title' => 'Les bases du CSS',
            'content_type' => 'Text',
            'content' => '
                <h2>Introduction au CSS</h2>
                <p>CSS (Cascading Style Sheets) permet de styliser vos pages HTML.</p>
                
                <img src="/storage/topics/css-basics.jpg" alt="CSS Basics" class="img-fluid my-3">
                
                <h3>Syntaxe CSS</h3>
                <pre><code>
selector {
    property: value;
    property: value;
}
                </code></pre>
                
                <div class="row">
                    <div class="col-md-6">
                        <img src="/storage/topics/css-selectors.png" alt="Sélecteurs CSS" class="img-fluid">
                    </div>
                    <div class="col-md-6">
                        <img src="/storage/topics/css-properties.png" alt="Propriétés CSS" class="img-fluid">
                    </div>
                </div>
            ',
            'order' => 2,
            'is_preview' => false
        ],
        [
            'title' => 'JavaScript pour débutants',
            'content_type' => 'Video',
            'content' => '
                <h2>Introduction à JavaScript</h2>
                <p>JavaScript est le langage de programmation du web. Il permet d\'ajouter de l\'interactivité à vos pages.</p>
                
                <img src="/storage/topics/javascript-intro.jpg" alt="JavaScript Introduction" class="img-fluid my-3">
                
                <h3>Votre premier script</h3>
                <pre><code>
// Afficher un message
console.log("Bonjour JavaScript !");

// Modifier le contenu d\'une page
document.getElementById("demo").innerHTML = "Hello World!";
                </code></pre>
            ',
            'video_url' => 'https://www.youtube.com/watch?v=javascript-basics',
            'order' => 3,
            'is_preview' => false
        ]
    ];

    foreach ($topics as $topicData) {
        $topicData['form_id'] = $courseId;
        
        $topic = Topic::create($topicData);
        echo "Topic créé: {$topic->title} (ID: {$topic->id})\n";
    }
}

/**
 * Exemple 3: Créer plusieurs cours avec différents types d'images
 */
function createMultipleCoursesWithImages()
{
    $tutor = User::where('role', 'Tutor')->first();
    
    if (!$tutor) {
        echo "Aucun tuteur trouvé.\n";
        return;
    }

    $courses = [
        [
            'title' => 'Photographie Numérique',
            'type' => 'Exercise',
            'description' => 'Maîtrisez l\'art de la photographie numérique, de la prise de vue au post-traitement.',
            'tags' => 'photographie,numérique,art,créativité',
            'level' => 'Intermédiaire',
            'price' => 149.99,
            'image' => 'courses/photography-course.jpg'
        ],
        [
            'title' => 'Cuisine Française Traditionnelle',
            'type' => 'Exercise',
            'description' => 'Découvrez les secrets de la cuisine française avec nos chefs expérimentés.',
            'tags' => 'cuisine,français,gastronomie,chef',
            'level' => 'Débutant',
            'price' => 79.99,
            'image' => 'courses/french-cooking.jpg'
        ],
        [
            'title' => 'Marketing Digital Avancé',
            'type' => 'Exam',
            'description' => 'Stratégies avancées de marketing digital pour booster votre business en ligne.',
            'tags' => 'marketing,digital,business,stratégie',
            'level' => 'Avancé',
            'price' => 199.99,
            'image' => 'courses/digital-marketing.jpg'
        ]
    ];

    foreach ($courses as $courseData) {
        $courseData['user_id'] = $tutor->id;
        $courseData['state'] = 'Published';
        $courseData['time_limit'] = 90;
        $courseData['passing_score'] = 75;
        
        $course = Form::create($courseData);
        echo "Cours créé: {$course->title} (ID: {$course->id})\n";
        echo "Image: {$course->image_url}\n\n";
    }
}

/**
 * Fonction utilitaire pour uploader une image
 */
function uploadCourseImage($file, $courseName)
{
    // Générer un nom de fichier unique
    $filename = 'courses/' . Str::slug($courseName) . '-' . time() . '.' . $file->getClientOriginalExtension();
    
    // Stocker le fichier
    $path = Storage::disk('public')->putFileAs('courses', $file, $filename);
    
    return $path;
}

// Exécution des exemples
echo "=== Création de cours avec images ===\n\n";

// Exemple 1: Cours principal
$course = createCourseWithCoverImage();

if ($course) {
    // Exemple 2: Ajouter des topics avec images
    echo "\n=== Ajout de topics avec images ===\n";
    addTopicsWithImages($course->id);
}

// Exemple 3: Créer plusieurs cours
echo "\n=== Création de cours multiples ===\n";
createMultipleCoursesWithImages();

echo "\n=== Terminé ===\n";