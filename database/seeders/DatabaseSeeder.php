<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            ComprehensiveUserSeeder::class,
            PlanSeeder::class,
            FormSeeder::class,
            CoursesWithImagesSeeder::class,
            RealisticCoursesSeeder::class,
        ]);
    }
}
