<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Feature;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. FREE PLAN
        $free = Plan::create([
            'name' => 'Gratuit',
            'description' => 'Idéal pour découvrir NextLearn.',
            'price' => 0.00,
            'interval' => 'Single',
            'is_recommended' => false,
            'is_active' => true,
        ]);

        $free->features()->createMany([
            ['title' => 'Accès aux cours gratuits'],
            ['title' => 'Communauté active'],
            ['title' => 'Support basique'],
        ]);

        // 2. PRO PLAN
        $pro = Plan::create([
            'name' => 'Pro Apprenant',
            'description' => 'Pour ceux qui veulent accélérer leur carrière.',
            'price' => 29.99,
            'interval' => 'Monthly',
            'is_recommended' => true,
            'is_active' => true,
        ]);

        $pro->features()->createMany([
            ['title' => 'Accès illimité aux cours'],
            ['title' => 'Certifications incluses'],
            ['title' => 'Sessions avec mentors'],
            ['title' => 'Projets réels (Portfolio)'],
        ]);

        // 3. ENTERPRISE PLAN
        $enterprise = Plan::create([
            'name' => 'Équipe / Entreprise',
            'description' => 'Solution complète pour les organisations.',
            'price' => 199.99,
            'interval' => 'Monthly',
            'is_recommended' => false,
            'is_active' => true,
        ]);

        $enterprise->features()->createMany([
            ['title' => 'Tableau de bord équipe'],
            ['title' => 'API Access'],
            ['title' => 'Support prioritaire 24/7'],
            ['title' => 'Formations personnalisées'],
        ]);
    }
}
