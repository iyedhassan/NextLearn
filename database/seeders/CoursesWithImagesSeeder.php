<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\Topic;
use App\Models\User;
use App\Models\Category;

class CoursesWithImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Créer un utilisateur tuteur si il n'existe pas
        $tutor = User::firstOrCreate(
            ['email' => 'tutor@nextlearn.com'],
            [
                'name' => 'Professeur Martin',
                'password' => bcrypt('password'),
                'role' => 'Tutor',
                'state' => 'Active',
                'email_verified_at' => now(),
            ]
        );

        // Cours 1: Développement Web
        $webCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Web')->id,
            'title' => 'Développement Web Complet',
            'type' => 'Exercise',
            'description' => 'Apprenez à créer des sites web modernes avec HTML5, CSS3, JavaScript et les frameworks populaires. Ce cours couvre tout ce dont vous avez besoin pour devenir développeur web.',
            'tags' => 'web,html,css,javascript,react,nodejs',
            'level' => 'Débutant',
            'price' => 149.99,
            'time_limit' => 180,
            'passing_score' => 75,
            'state' => 'Published',
            'image' => 'courses/web-development.jpg'
        ]);

        // Topics pour le cours de développement web
        $webTopics = [
            [
                'title' => 'Introduction au HTML5',
                'content_type' => 'Text',
                'content' => '
                    <h2>Bienvenue dans le monde du HTML5</h2>
                    <p>HTML5 est la dernière version du langage de balisage HTML. Il apporte de nombreuses nouvelles fonctionnalités.</p>
                    
                    <img src="/storage/topics/html5-logo.png" alt="HTML5 Logo" class="img-fluid my-3" style="max-width: 200px;">
                    
                    <h3>Nouvelles balises HTML5</h3>
                    <ul>
                        <li><code>&lt;header&gt;</code> - En-tête de page ou section</li>
                        <li><code>&lt;nav&gt;</code> - Navigation</li>
                        <li><code>&lt;main&gt;</code> - Contenu principal</li>
                        <li><code>&lt;article&gt;</code> - Article autonome</li>
                        <li><code>&lt;section&gt;</code> - Section de contenu</li>
                        <li><code>&lt;footer&gt;</code> - Pied de page</li>
                    </ul>
                    
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <img src="/storage/topics/html5-structure.png" alt="Structure HTML5" class="img-fluid">
                            <p class="text-center mt-2"><small>Structure sémantique HTML5</small></p>
                        </div>
                        <div class="col-md-6">
                            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="fr"&gt;
&lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;title&gt;Ma Page&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;header&gt;
        &lt;h1&gt;Mon Site&lt;/h1&gt;
        &lt;nav&gt;...&lt;/nav&gt;
    &lt;/header&gt;
    &lt;main&gt;
        &lt;article&gt;...&lt;/article&gt;
    &lt;/main&gt;
    &lt;footer&gt;...&lt;/footer&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
                        </div>
                    </div>
                ',
                'order' => 1,
                'is_preview' => true
            ],
            [
                'title' => 'CSS3 et Flexbox',
                'content_type' => 'Text',
                'content' => '
                    <h2>Maîtriser CSS3 et Flexbox</h2>
                    <p>CSS3 apporte de nombreuses nouvelles propriétés pour styliser vos pages web de manière moderne.</p>
                    
                    <img src="/storage/topics/css3-features.jpg" alt="Fonctionnalités CSS3" class="img-fluid my-3">
                    
                    <h3>Flexbox - La révolution du layout</h3>
                    <p>Flexbox permet de créer des layouts flexibles et responsives facilement.</p>
                    
                    <div class="row">
                        <div class="col-md-8">
                            <pre><code>.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.item {
    flex: 1;
    padding: 20px;
    margin: 10px;
    background: #f0f0f0;
    border-radius: 8px;
}</code></pre>
                        </div>
                        <div class="col-md-4">
                            <img src="/storage/topics/flexbox-demo.png" alt="Démonstration Flexbox" class="img-fluid">
                        </div>
                    </div>
                    
                    <h4>Propriétés Flexbox principales</h4>
                    <img src="/storage/topics/flexbox-properties.png" alt="Propriétés Flexbox" class="img-fluid my-3">
                ',
                'order' => 2,
                'is_preview' => false
            ],
            [
                'title' => 'JavaScript ES6+',
                'content_type' => 'Video',
                'content' => '
                    <h2>JavaScript Moderne (ES6+)</h2>
                    <p>Découvrez les nouvelles fonctionnalités de JavaScript qui révolutionnent le développement web.</p>
                    
                    <img src="/storage/topics/javascript-es6.jpg" alt="JavaScript ES6" class="img-fluid my-3">
                    
                    <h3>Nouvelles syntaxes</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <h4>Arrow Functions</h4>
                            <pre><code>// Ancienne syntaxe
function add(a, b) {
    return a + b;
}

// Nouvelle syntaxe
const add = (a, b) => a + b;</code></pre>
                        </div>
                        <div class="col-md-6">
                            <h4>Destructuring</h4>
                            <pre><code>// Extraction de propriétés
const {name, age} = user;

// Extraction de tableau
const [first, second] = array;</code></pre>
                        </div>
                    </div>
                    
                    <img src="/storage/topics/es6-features.png" alt="Fonctionnalités ES6" class="img-fluid my-3">
                ',
                'video_url' => 'https://www.youtube.com/watch?v=javascript-es6-tutorial',
                'order' => 3,
                'is_preview' => false
            ]
        ];

        foreach ($webTopics as $topicData) {
            $topicData['form_id'] = $webCourse->id;
            Topic::create($topicData);
        }

        // Cours 2: Design Graphique
        $designCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Design')->id,
            'title' => 'Design Graphique avec Photoshop',
            'type' => 'Exercise',
            'description' => 'Maîtrisez les techniques de design graphique professionnel avec Adobe Photoshop. De la retouche photo à la création de visuels marketing.',
            'tags' => 'design,photoshop,graphisme,créativité,adobe',
            'level' => 'Intermédiaire',
            'price' => 199.99,
            'time_limit' => 240,
            'passing_score' => 80,
            'state' => 'Published',
            'image' => 'courses/graphic-design.jpg'
        ]);

        // Topics pour le cours de design
        $designTopics = [
            [
                'title' => 'Interface et outils Photoshop',
                'content_type' => 'Text',
                'content' => '
                    <h2>Découverte de l\'interface Photoshop</h2>
                    <p>Apprenez à naviguer dans l\'interface complexe mais puissante de Photoshop.</p>
                    
                    <img src="/storage/topics/photoshop-interface.jpg" alt="Interface Photoshop" class="img-fluid my-3">
                    
                    <h3>Les outils essentiels</h3>
                    <div class="row">
                        <div class="col-md-6">
                            <img src="/storage/topics/photoshop-tools.png" alt="Outils Photoshop" class="img-fluid">
                        </div>
                        <div class="col-md-6">
                            <ul>
                                <li><strong>Outil Sélection (V)</strong> - Déplacer et sélectionner</li>
                                <li><strong>Outil Pinceau (B)</strong> - Peindre et dessiner</li>
                                <li><strong>Outil Texte (T)</strong> - Ajouter du texte</li>
                                <li><strong>Outil Recadrage (C)</strong> - Recadrer les images</li>
                                <li><strong>Outil Pipette (I)</strong> - Prélever les couleurs</li>
                            </ul>
                        </div>
                    </div>
                ',
                'order' => 1,
                'is_preview' => true
            ],
            [
                'title' => 'Retouche photo avancée',
                'content_type' => 'Text',
                'content' => '
                    <h2>Techniques de retouche professionnelle</h2>
                    <p>Apprenez les techniques utilisées par les professionnels pour sublimer vos photos.</p>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h4>Avant retouche</h4>
                            <img src="/storage/topics/photo-before.jpg" alt="Photo avant retouche" class="img-fluid">
                        </div>
                        <div class="col-md-6">
                            <h4>Après retouche</h4>
                            <img src="/storage/topics/photo-after.jpg" alt="Photo après retouche" class="img-fluid">
                        </div>
                    </div>
                    
                    <h3>Techniques principales</h3>
                    <img src="/storage/topics/retouching-techniques.png" alt="Techniques de retouche" class="img-fluid my-3">
                ',
                'order' => 2,
                'is_preview' => false
            ]
        ];

        foreach ($designTopics as $topicData) {
            $topicData['form_id'] = $designCourse->id;
            Topic::create($topicData);
        }

        // Cours 3: Marketing Digital
        $marketingCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Marketing')->id,
            'title' => 'Marketing Digital et Réseaux Sociaux',
            'type' => 'Exam',
            'description' => 'Développez votre stratégie marketing digital complète. Apprenez à utiliser les réseaux sociaux, le SEO, la publicité en ligne pour booster votre business.',
            'tags' => 'marketing,digital,seo,réseaux sociaux,publicité',
            'level' => 'Avancé',
            'price' => 299.99,
            'time_limit' => 300,
            'passing_score' => 85,
            'state' => 'Published',
            'image' => 'courses/digital-marketing.jpg'
        ]);

        // Topics pour le cours de marketing
        $marketingTopics = [
            [
                'title' => 'Stratégie de contenu',
                'content_type' => 'Text',
                'content' => '
                    <h2>Créer une stratégie de contenu efficace</h2>
                    <p>Le contenu est roi dans le marketing digital. Apprenez à créer une stratégie qui engage votre audience.</p>
                    
                    <img src="/storage/topics/content-strategy.jpg" alt="Stratégie de contenu" class="img-fluid my-3">
                    
                    <h3>Les piliers d\'une bonne stratégie</h3>
                    <div class="row">
                        <div class="col-md-4 text-center">
                            <img src="/storage/topics/pillar-1.png" alt="Pilier 1" class="img-fluid mb-2">
                            <h5>Connaître son audience</h5>
                        </div>
                        <div class="col-md-4 text-center">
                            <img src="/storage/topics/pillar-2.png" alt="Pilier 2" class="img-fluid mb-2">
                            <h5>Créer de la valeur</h5>
                        </div>
                        <div class="col-md-4 text-center">
                            <img src="/storage/topics/pillar-3.png" alt="Pilier 3" class="img-fluid mb-2">
                            <h5>Mesurer les résultats</h5>
                        </div>
                    </div>
                ',
                'order' => 1,
                'is_preview' => true
            ]
        ];

        foreach ($marketingTopics as $topicData) {
            $topicData['form_id'] = $marketingCourse->id;
            Topic::create($topicData);
        }

        $this->command->info('Cours avec images créés avec succès !');
        $this->command->info('- ' . $webCourse->title . ' (ID: ' . $webCourse->id . ')');
        $this->command->info('- ' . $designCourse->title . ' (ID: ' . $designCourse->id . ')');
        $this->command->info('- ' . $marketingCourse->title . ' (ID: ' . $marketingCourse->id . ')');
    }
}