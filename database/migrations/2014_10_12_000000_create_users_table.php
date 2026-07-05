<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Role and State
            $table->enum('role', ['Admin', 'Student', 'Tutor'])->default('Student');
            $table->enum('state', ['Inactive', 'Active', 'On Validation', 'Banned'])->default('Inactive');

            // Basic Information
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');

            // Timestamps
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();

            // Activity Tracking
            $table->ipAddress('ip_address')->nullable();

            // Gamification
            $table->unsignedInteger('credits')->default(0);
            $table->unsignedInteger('reputation')->default(0);

            // API Authentication
            $table->rememberToken();
            $table->string('api_token', 80)->unique()->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('role');
            $table->index('state');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
