<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSessionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');

            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();

            $table->enum('state', [
                'Pending',
                'Confirmed',
                'Canceled',
                'Ongoing',
                'Finished'
            ])->default('Pending');

            $table->unsignedInteger('cost')->default(1);

            $table->longText('additional_info')->nullable();
            $table->longText('explanation')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('student_id');
            $table->index('tutor_id');
            $table->index('state');
            $table->index('start_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sessions');
    }
}
