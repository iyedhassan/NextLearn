<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. ADMIN
        User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin NextLearn',
                'password' => Hash::make('123456789'),
                'role' => 'Admin',
                'state' => 'Active',
            ]
        );

        // 2. INSTRUCTOR (TUTOR)
        User::updateOrCreate(
            ['email' => 'instructor@gmail.com'],
            [
                'name' => 'Prof. Sarah Laroche',
                'password' => Hash::make('123456789'),
                'role' => 'Tutor',
                'state' => 'Active',
            ]
        );

        // 3. REGULAR STUDENT
        User::updateOrCreate(
            ['email' => 'student@gmail.com'],
            [
                'name' => 'Jean Apprenant',
                'password' => Hash::make('123456789'),
                'role' => 'Student',
                'state' => 'Active',
            ]
        );

        // Additional tutors for variety
        User::updateOrCreate(
            ['email' => 'tutor@example.com'],
            [
                'name' => 'Dr. Alex Rivier',
                'password' => Hash::make('123456789'),
                'role' => 'Tutor',
                'state' => 'Active',
            ]
        );
    }
}
