<?php

namespace Database\Seeders;

use App\Models\Form;
use App\Models\Question;
use App\Models\User;
use App\Models\Topic;
use App\Models\Category;
use Illuminate\Database\Seeder;

class FormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $admin = User::firstWhere('email', 'admin@gmail.com');
        $tutor = User::firstWhere('email', 'instructor@gmail.com');

        if (!$admin || !$tutor) {
            return;
        }

        // --- POPULAR COURSES ---

        // 1. AI Course
        $aiCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Intelligence Artificielle')->id,
            'title' => "Introduction à l'Intelligence Artificielle",
            'type' => 'Admission',
            'description' => "Maîtrisez les concepts fondamentaux de l'IA, du Machine Learning au Deep Learning. Ce cours vous donne les clés pour comprendre et construire le futur technologique.",
            'tags' => 'IA, Technologie, Futur',
            'state' => 'Published',
            'price' => 149.99,
            'time_limit' => 120,
            'passing_score' => 80,
            'image' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
            'level' => 'Avancé'
        ]);

        Topic::create([
            'form_id' => $aiCourse->id,
            'title' => 'Qu\'est-ce que l\'IA ?',
            'content' => 'Introduction aux réseaux de neurones.',
            'order' => 1
        ]);

        Question::create([
            'form_id' => $aiCourse->id,
            'title' => 'Qu est-ce que le Machine Learning ?',
            'type' => 'Text',
            'is_required' => true,
            'order' => 1,
        ]);

        // 2. Web Fullstack Course
        $webCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Web')->id,
            'title' => "Développement Web Fullstack Master",
            'type' => 'Admission',
            'description' => "Devenez un expert du web. Apprenez React pour le frontend et Laravel pour le backend. Construisez des applications robustes et scalables.",
            'tags' => 'Web, React, Laravel',
            'state' => 'Published',
            'price' => 199.00,
            'time_limit' => null,
            'passing_score' => 75,
            'image' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
            'level' => 'Intermédiaire'
        ]);

        // 3. UX/UI Design
        $designCourse = Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Design')->id,
            'title' => "UX/UI Design Moderne",
            'type' => 'Admission',
            'description' => "Créez des expériences mémorables. Apprenez les principes du design centré utilisateur et maîtrisez Figma pour vos prototypes.",
            'tags' => 'Design, UX, UI, Figma',
            'state' => 'Published',
            'price' => 89.99,
            'time_limit' => 45,
            'passing_score' => 70,
            'image' => 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=800&q=80',
            'level' => 'Débutant'
        ]);

        // 4. Data Science
        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Data Science')->id,
            'title' => "Data Science avec Python",
            'type' => 'Admission',
            'description' => "Analysez de grands ensembles de données. Apprenez Pandas, NumPy et Matplotlib pour transformer les données en décisions.",
            'tags' => 'Data, Python, Analyse',
            'state' => 'Published',
            'price' => 129.00,
            'level' => 'Intermédiaire',
            'image' => 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&w=800&q=80'
        ]);

        // 5. Mobile Development
        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Mobile')->id,
            'title' => "Développement iOS avec Swift",
            'type' => 'Admission',
            'description' => "Créez des applications iPhone magnifiques et performantes. Apprenez SwiftUI et le développement natif Apple.",
            'tags' => 'Mobile, iOS, Swift',
            'state' => 'Published',
            'price' => 159.99,
            'level' => 'Avancé',
            'image' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80'
        ]);

        // 6. Flutter Masterclass
        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Mobile')->id,
            'title' => "Flutter & Dart : Le Guide Complet",
            'type' => 'Admission',
            'description' => "Développez pour iOS et Android avec une seule base de code. Maîtrisez Flutter pour créer des apps multiplateformes.",
            'tags' => 'Mobile, Flutter, Dart',
            'state' => 'Published',
            'price' => 110.00,
            'level' => 'Intermédiaire',
            'image' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
        ]);

        // 7. Cyber Sécurité
        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Cybersécurité')->id,
            'title' => "Fondamentaux de la Cybersécurité",
            'type' => 'Admission',
            'description' => "Apprenez à protéger les systèmes et les bases de données contre les cyberattaques. Comprenez le hacking éthique.",
            'tags' => 'Securité, Réseaux, IT',
            'state' => 'Published',
            'price' => 175.00,
            'level' => 'Débutant',
            'image' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
        ]);

        // 8. Marketing Digital
        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Marketing')->id,
            'title' => "Marketing Digital 360",
            'type' => 'Admission',
            'description' => "SEO, Ads, et Stratégie de contenu. Boostez la visibilité de n'importe quel business en ligne.",
            'tags' => 'Marketing, SEO, Business',
            'state' => 'Published',
            'price' => 65.00,
            'level' => 'Débutant',
            'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
        ]);

        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Web')->id,
            'title' => "Python pour Débutants",
            'type' => 'Admission',
            'description' => "Apprenez les bases de Python, le langage le plus populaire au monde.",
            'tags' => 'Python, Code, Débutant',
            'state' => 'Published',
            'price' => 49.00,
            'level' => 'Débutant',
            'image' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
        ]);

        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Web')->id,
            'title' => "React Avancé & Patterns",
            'type' => 'Admission',
            'description' => "Maîtrisez les hooks, le context API et les patterns de performance React.",
            'tags' => 'React, Frontend, JS',
            'state' => 'Published',
            'price' => 120.00,
            'level' => 'Avancé',
            'image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80'
        ]);

        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Développement Web')->id,
            'title' => "PHP Masterclass 2024",
            'type' => 'Admission',
            'description' => "Devenez un expert PHP. De la POO aux frameworks modernes.",
            'tags' => 'PHP, Backend, Web',
            'state' => 'Published',
            'price' => 85.00,
            'level' => 'Intermédiaire',
            'image' => 'https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?auto=format&fit=crop&w=800&q=80'
        ]);

        Form::create([
            'user_id' => $tutor->id,
            'category_id' => Category::findOrCreateByName('Design')->id,
            'title' => "UI/UX avec Adobe XD",
            'type' => 'Admission',
            'description' => "Concevez des interfaces d'applications mobiles professionnelles avec Adobe XD.",
            'tags' => 'Design, UI, UX, Adobe',
            'state' => 'Published',
            'price' => 75.00,
            'level' => 'Intermédiaire',
            'image' => 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'
        ]);

        // --- OTHER FORMS ---

        $exerciseForm = Form::create([
            'user_id' => $tutor->id,
            'title' => 'Calcul Algébrique',
            'type' => 'Exercise',
            'description' => 'Exercices pratiques sur l\'algèbre.',
            'state' => 'Published',
            'price' => 0.00,
        ]);

        Question::create([
            'form_id' => $exerciseForm->id,
            'title' => 'Solve for x: 2x + 4 = 10',
            'type' => 'Short',
            'correct_answers' => '3',
            'is_matchable' => true,
            'order' => 1,
        ]);
    }
}
