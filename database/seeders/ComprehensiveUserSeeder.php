<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Person;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ComprehensiveUserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'name' => 'Dr. Thomas Müller',
                'email' => 'thomas.muller@nextlearn.com',
                'role' => 'Tutor',
                'first_name' => 'Thomas',
                'last_name' => 'Müller',
                'headline' => 'Expert en Intelligence Artificielle',
                'bio' => 'Ancien chercheur au CNRS, Thomas partage sa passion pour le deep learning.'
            ],
            [
                'name' => 'Marie Curie',
                'email' => 'marie.curie@nextlearn.com',
                'role' => 'Tutor',
                'first_name' => 'Marie',
                'last_name' => 'Curie',
                'headline' => 'Spécialiste en Physique Quantique',
                'bio' => 'Deux prix Nobel, mais toujours prête à enseigner les bases de la physique.'
            ],
            [
                'name' => 'Sophie Laurent',
                'email' => 'sophie.laurent@nextlearn.com',
                'role' => 'Tutor',
                'first_name' => 'Sophie',
                'last_name' => 'Laurent',
                'headline' => 'UI/UX Design Master',
                'bio' => 'Designer freelance depuis 12 ans, Sophie a travaillé avec les plus grandes agences.'
            ],
            [
                'name' => 'Lucas Bernard',
                'email' => 'lucas.bernard@nextlearn.com',
                'role' => 'Student',
                'first_name' => 'Lucas',
                'last_name' => 'Bernard',
                'headline' => 'Étudiant passionné par le Web',
                'bio' => 'Cherche à devenir développeur Fullstack d\'ici la fin de l\'année.'
            ],
            [
                'name' => 'Emma Petit',
                'email' => 'emma.petit@nextlearn.com',
                'role' => 'Student',
                'first_name' => 'Emma',
                'last_name' => 'Petit',
                'headline' => 'Apprentie Data Analyst',
                'bio' => 'En reconversion professionnelle pour maîtriser Python et la Big Data.'
            ]
        ];

        foreach ($users as $u) {
            $user = User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('password'),
                    'role' => $u['role'],
                    'state' => 'Active',
                ]
            );

            Person::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'first_name' => $u['first_name'],
                    'last_name' => $u['last_name'],
                    'specialization' => $u['headline'],
                    'bio' => $u['bio']
                ]
            );
        }

        $this->command->info('Utilisateurs et profils créés avec succès !');
    }
}
