<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Kernel::class)->bootstrap();

// Check for courses tags and titles
$courses = \App\Models\Form::all();

echo "ID | Title | Tags | Level" . PHP_EOL;
echo "------------------------------------------------" . PHP_EOL;
foreach ($courses as $c) {
    echo "{$c->id} | {$c->title} | {$c->tags} | {$c->level}" . PHP_EOL;
}
