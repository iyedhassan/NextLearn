<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFormsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('forms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title');

            $table->enum('type', [
                'Admission',
                'Audition',
                'Exercise',
                'Exam'
            ]);

            $table->text('description')->nullable();
            $table->text('tags')->nullable();

            $table->enum('state', ['Draft', 'Published'])->default('Draft');

            $table->unsignedInteger('time_limit')->nullable(); // in minutes
            $table->unsignedInteger('passing_score')->nullable(); // percentage

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('type');
            $table->index('state');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('forms');
    }
}
