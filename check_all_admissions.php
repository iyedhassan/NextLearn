<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check all admissions with their approval status
$admissions = App\Models\Admission::with(['user', 'form'])->get();

echo "=== ALL ADMISSIONS ===\n\n";

foreach ($admissions as $admission) {
    echo "User: {$admission->user->name} ({$admission->user->email})\n";
    echo "Course: {$admission->form->title} (ID: {$admission->form_id})\n";
    echo "Approved: " . ($admission->is_approved ? 'YES ✓' : 'NO ✗') . "\n";
    echo "Verified At: " . ($admission->verified_at ? $admission->verified_at : 'NULL') . "\n";
    echo "---\n\n";
}
