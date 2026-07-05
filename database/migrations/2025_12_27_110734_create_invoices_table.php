<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('form_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('invoice_number')->unique();

            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);

            $table->enum('status', ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'])->default('Pending');

            $table->string('payment_method')->nullable();
            $table->string('payment_id')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('due_date')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('subscription_id');
            $table->index('form_id');
            $table->index('user_id');
            $table->index('invoice_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
