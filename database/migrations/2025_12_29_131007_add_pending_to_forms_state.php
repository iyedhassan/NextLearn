<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddPendingToFormsState extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (DB::getDriverName() === 'mysql') {
            // For MySQL, we need to modify the enum column
            DB::statement("ALTER TABLE forms MODIFY COLUMN state ENUM('Draft', 'Published', 'Archived', 'Pending') DEFAULT 'Draft'");
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
            DB::statement("ALTER TABLE forms MODIFY COLUMN state ENUM('Draft', 'Published', 'Archived') DEFAULT 'Draft'");
        }
    }
}
