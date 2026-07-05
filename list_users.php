<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = App\Models\User::all();

echo "Total Users: " . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "ID: {$user->id} | Email: {$user->email} | Role: {$user->role} | Name: {$user->name}\n";
}

echo "\n--- Students with Admissions ---\n\n";

$students = App\Models\User::where('role', 'Student')->get();

foreach ($students as $student) {
    $admissions = App\Models\Admission::where('user_id', $student->id)->with('form')->get();

    if ($admissions->count() > 0) {
        echo "Student: {$student->name} ({$student->email})\n";
        foreach ($admissions as $admission) {
            echo "  - {$admission->form->title} | Approved: " . ($admission->is_approved ? 'YES' : 'NO') . "\n";
        }
        echo "\n";
    }
}
