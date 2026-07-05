<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuestionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('form_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->enum('type', ['Short', 'Link', 'Text', 'Select', 'Check'])->default('Short');

            $table->longText('options')->nullable();
            $table->text('correct_answers')->nullable();

            $table->boolean('is_required')->default(true);
            $table->boolean('is_matchable')->default(false);
            $table->boolean('show_matches')->default(false);

            $table->unsignedInteger('order')->default(1);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('form_id');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('questions');
    }
}
