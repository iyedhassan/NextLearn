<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddReviewFieldsToFeedbacksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // For SQLite, we need to recreate the table to modify the CHECK constraint on 'type'
        // to include 'Review' as a valid option

        DB::statement("
            CREATE TABLE feedbacks_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                user_id INTEGER NOT NULL,
                subject VARCHAR NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR CHECK(type IN ('Bug', 'Feature', 'Question', 'Other', 'Review')) DEFAULT 'Other' NOT NULL,
                status VARCHAR CHECK(status IN ('New', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'New' NOT NULL,
                created_at DATETIME,
                updated_at DATETIME,
                deleted_at DATETIME,
                form_id INTEGER,
                rating INTEGER DEFAULT 5,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
            )
        ");

        // Copy all existing data
        DB::statement("
            INSERT INTO feedbacks_new (id, user_id, subject, message, type, status, created_at, updated_at, deleted_at, form_id, rating)
            SELECT id, user_id, subject, message, type, status, created_at, updated_at, deleted_at, form_id, rating
            FROM feedbacks
        ");

        // Drop old table and rename new one
        DB::statement("DROP TABLE feedbacks");
        DB::statement("ALTER TABLE feedbacks_new RENAME TO feedbacks");

        // Recreate indexes
        DB::statement("CREATE INDEX feedbacks_user_id_index ON feedbacks(user_id)");
        DB::statement("CREATE INDEX feedbacks_status_index ON feedbacks(status)");
        DB::statement("CREATE INDEX feedbacks_type_index ON feedbacks(type)");
        DB::statement("CREATE INDEX feedbacks_form_id_index ON feedbacks(form_id)");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Recreate original table structure without 'Review' type
        DB::statement("
            CREATE TABLE feedbacks_old (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                user_id INTEGER NOT NULL,
                subject VARCHAR NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR CHECK(type IN ('Bug', 'Feature', 'Question', 'Other')) DEFAULT 'Other' NOT NULL,
                status VARCHAR CHECK(status IN ('New', 'In Progress', 'Resolved', 'Closed')) DEFAULT 'New' NOT NULL,
                created_at DATETIME,
                updated_at DATETIME,
                deleted_at DATETIME,
                form_id INTEGER,
                rating INTEGER DEFAULT 5,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(form_id) REFERENCES forms(id) ON DELETE CASCADE
            )
        ");

        // Copy data excluding Review type feedbacks
        DB::statement("
            INSERT INTO feedbacks_old (id, user_id, subject, message, type, status, created_at, updated_at, deleted_at, form_id, rating)
            SELECT id, user_id, subject, message, type, status, created_at, updated_at, deleted_at, form_id, rating
            FROM feedbacks
            WHERE type != 'Review'
        ");

        DB::statement("DROP TABLE feedbacks");
        DB::statement("ALTER TABLE feedbacks_old RENAME TO feedbacks");

        // Recreate indexes
        DB::statement("CREATE INDEX feedbacks_user_id_index ON feedbacks(user_id)");
        DB::statement("CREATE INDEX feedbacks_status_index ON feedbacks(status)");
        DB::statement("CREATE INDEX feedbacks_type_index ON feedbacks(type)");
        DB::statement("CREATE INDEX feedbacks_form_id_index ON feedbacks(form_id)");
    }
}
