<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddReviewToFeedbackType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (DB::getDriverName() === 'mysql') {
            // For MySQL, we need to alter the enum column to include 'Review'
            DB::statement("ALTER TABLE feedbacks MODIFY COLUMN type ENUM('Bug', 'Feature', 'Question', 'Other', 'Review') DEFAULT 'Other'");
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE feedbacks MODIFY COLUMN type ENUM('Bug', 'Feature', 'Question', 'Other') DEFAULT 'Other'");
        }
    }
}
