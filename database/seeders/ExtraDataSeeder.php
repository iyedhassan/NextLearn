<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Person;
use App\Models\Feedback;
use App\Models\Form;
use Illuminate\Database\Seeder;

class ExtraDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Populate Instructor Bios
        $tutor1 = User::firstWhere('email', 'instructor@gmail.com');
        if ($tutor1) {
            Person::updateOrCreate(
                ['user_id' => $tutor1->id],
                [
                    'first_name' => 'Sarah',
                    'last_name' => 'Laroche',
                    'specialization' => 'IA & Data Science',
                    'bio' => "Experte en Intelligence Artificielle avec plus de 10 ans d'expérience dans le secteur de la tech. Passionnée par la transmission de connaissances.",
                ]
            );
        }

        $tutor2 = User::firstWhere('email', 'tutor@example.com');
        if ($tutor2) {
            Person::updateOrCreate(
                ['user_id' => $tutor2->id],
                [
                    'first_name' => 'Alex',
                    'last_name' => 'Rivier',
                    'specialization' => 'Développement Fullstack',
                    'bio' => "Ingénieur logiciel spécialisé dans les architectures web modernes. Consultant pour plusieurs entreprises Fortune 500.",
                ]
            );
        }

        // 2. Real Student Feedbacks for Popular Courses
        $student = User::firstWhere('email', 'student@gmail.com');
        $aiCourse = Form::firstWhere('title', "Introduction à l'Intelligence Artificielle");
        $webCourse = Form::firstWhere('title', "Développement Web Fullstack Master");

        if ($student && $aiCourse) {
            Feedback::create([
                'user_id' => $student->id,
                'form_id' => $aiCourse->id,
                'subject' => 'Excellente formation AI',
                'message' => "Le contenu est d'une clarté incroyable. Les exercices pratiques m'ont aidé à comprendre des concepts qui me paraissaient impossibles.",
                'type' => 'Other',
                'status' => 'Resolved',
                'rating' => 5
            ]);
        }

        if ($student && $webCourse) {
            Feedback::create([
                'user_id' => $student->id,
                'form_id' => $webCourse->id,
                'subject' => 'Fullstack Power',
                'message' => "La synergie entre React et Laravel est parfaitement expliquée. Je recommande à 100%.",
                'type' => 'Other',
                'status' => 'Resolved',
                'rating' => 4
            ]);
        }
    }
}
