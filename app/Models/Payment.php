<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'form_id',
        'admin_id',
        'invoice_id',
        'payment_number',
        'amount',
        'payment_method',
        'payment_details',
        'status',
        'rejection_reason',
        'validated_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'payment_details' => 'array',
        'validated_at' => 'datetime',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user (student) who made the payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course (form) being purchased.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get the admin who validated/rejected the payment.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the invoice generated after payment acceptance.
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include accepted payments.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope a query to only include rejected payments.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if payment is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is accepted.
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if payment is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Accept the payment.
     */
    public function accept($adminId)
    {
        $this->update([
            'status' => 'accepted',
            'admin_id' => $adminId,
            'validated_at' => now(),
        ]);
    }

    /**
     * Reject the payment.
     */
    public function reject($adminId, $reason = null)
    {
        $this->update([
            'status' => 'rejected',
            'admin_id' => $adminId,
            'rejection_reason' => $reason,
            'validated_at' => now(),
        ]);
    }
}
