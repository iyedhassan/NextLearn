<?php
use App\Models\User;
use App\Models\Form;

$tutor = User::where('email', 'tutor@nextlearn.com')->first();
if ($tutor) {
    echo "Tutor ID: {$tutor->id}\n";
    $courses = Form::where('user_id', $tutor->id)->get();
    foreach ($courses as $c) {
        echo "Course ID: {$c->id}, Title: {$c->title}, User ID: {$c->user_id}, State: {$c->state}\n";
    }
} else {
    echo "Tutor not found\n";
}
