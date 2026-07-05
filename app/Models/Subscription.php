<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'plan_id',
        'coupon_id',
        'quantity',
        'state',
        'starts_at',
        'ends_at',
        'cancelled_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'quantity' => 'integer',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'state' => 'Pending',
        'quantity' => 1,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that owns the subscription.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this subscription.
     */
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the coupon used for this subscription.
     */
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get all invoices for this subscription.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('state', 'Activated');
    }

    /**
     * Scope a query to only include pending subscriptions.
     */
    public function scopePending($query)
    {
        return $query->where('state', 'Pending');
    }

    /**
     * Scope a query to only include expired subscriptions.
     */
    public function scopeExpired($query)
    {
        return $query->where('state', 'Expired');
    }

    /**
     * Scope a query to only include cancelled subscriptions.
     */
    public function scopeCancelled($query)
    {
        return $query->where('state', 'Cancelled');
    }

    /**
     * Scope a query for subscriptions of a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if subscription is active.
     */
    public function isActive(): bool
    {
        return $this->state === 'Activated'
            && (!$this->ends_at || $this->ends_at->isFuture());
    }

    /**
     * Check if subscription is pending.
     */
    public function isPending(): bool
    {
        return $this->state === 'Pending';
    }

    /**
     * Check if subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->state === 'Expired'
            || ($this->ends_at && $this->ends_at->isPast());
    }

    /**
     * Check if subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->state === 'Cancelled';
    }

    /**
     * Activate the subscription.
     */
    public function activate(): bool
    {
        return $this->update([
            'state' => 'Activated',
            'starts_at' => $this->starts_at ?? now(),
        ]);
    }

    /**
     * Cancel the subscription.
     */
    public function cancel(): bool
    {
        return $this->update([
            'state' => 'Cancelled',
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Mark as failed.
     */
    public function markAsFailed(): bool
    {
        return $this->update(['state' => 'Failed']);
    }

    /**
     * Mark as expired.
     */
    public function markAsExpired(): bool
    {
        return $this->update(['state' => 'Expired']);
    }

    /**
     * Get total amount (with coupon discount if applicable).
     */
    public function getTotalAmountAttribute(): float
    {
        $amount = $this->plan->price * $this->quantity;

        if ($this->coupon && $this->coupon->isValid()) {
            $discount = $this->coupon->calculateDiscount($amount);
            $amount -= $discount;
        }

        return max(0, $amount);
    }

    /**
     * Get discount amount.
     */
    public function getDiscountAmountAttribute(): float
    {
        if (!$this->coupon || !$this->coupon->isValid()) {
            return 0;
        }

        $amount = $this->plan->price * $this->quantity;
        return $this->coupon->calculateDiscount($amount);
    }

    /**
     * Get days remaining.
     */
    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->ends_at || !$this->isActive()) {
            return null;
        }

        return max(0, now()->diffInDays($this->ends_at, false));
    }

    /**
     * Check if subscription is about to expire (within 7 days).
     */
    public function isAboutToExpire(): bool
    {
        $daysRemaining = $this->days_remaining;
        return $daysRemaining !== null && $daysRemaining <= 7 && $daysRemaining > 0;
    }
}
