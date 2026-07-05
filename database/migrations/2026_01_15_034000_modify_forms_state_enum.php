<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('forms', function (Blueprint $table) {
            // Change enum to string to allow 'Pending' and 'Archived'
            // This requires doctrine/dbal if on older Laravel/specific drivers, 
            // but recent Laravel handles it better.
            // Changing to string removes the strict CHECK constraint on values.
            $table->string('state')->default('Draft')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We do not revert to restricted enum to avoid data loss of Pending/Archived items.
        Schema::table('forms', function (Blueprint $table) {
            $table->string('state')->default('Draft')->change();
        });
    }
};
