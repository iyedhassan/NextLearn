<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Invoice model representing a billing invoice for a subscription.
 */
class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'subscription_id',
        'form_id',
        'user_id',
        'invoice_number',
        'subtotal',
        'discount',
        'tax',
        'total',
        'status',
        'payment_method',
        'payment_id',
        'paid_at',
        'due_date',
    ];

    protected $appends = ['balance'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
        'due_date' => 'datetime',
    ];

    /**
     * Get the balance (remaining amount to pay).
     */
    public function getBalanceAttribute()
    {
        return $this->status === 'Paid' ? 0 : $this->total;
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * The subscription this invoice belongs to.
     */
    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Get the course (form) this invoice belongs to.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * The user who is billed.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to only paid invoices.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'Paid');
    }

    /**
     * Scope to only pending invoices.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Mark the invoice as paid.
     */
    public function markAsPaid(?string $paymentId = null, ?string $method = null): bool
    {
        return $this->update([
            'status' => 'Paid',
            'paid_at' => now(),
            'payment_id' => $paymentId,
            'payment_method' => $method,
        ]);
    }

    /**
     * Determine if the invoice is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'Pending' && $this->due_date && $this->due_date->isPast();
    }
}
