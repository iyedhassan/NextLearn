<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'slug',
        'name',
        'discount',
        'discount_type',
        'expires_at',
        'max_uses',
        'used_count',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'discount' => 'decimal:2',
        'expires_at' => 'datetime',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'discount_type' => 'Percentage',
        'used_count' => 0,
        'is_active' => true,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all subscriptions using this coupon.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active coupons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include valid coupons.
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')
                    ->orWhereRaw('used_count < max_uses');
            });
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if coupon is valid.
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Check if coupon is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if coupon has reached max uses.
     */
    public function hasReachedMaxUses(): bool
    {
        return $this->max_uses && $this->used_count >= $this->max_uses;
    }

    /**
     * Calculate discount amount for a given price.
     */
    public function calculateDiscount(float $amount): float
    {
        if (!$this->isValid()) {
            return 0;
        }

        $discount = (float) $this->discount;

        if ($this->discount_type === 'Percentage') {
            return ($amount * $discount) / 100;
        }

        // Fixed discount
        return min($discount, $amount);
    }

    /**
     * Increment usage count.
     */
    public function incrementUsage(): bool
    {
        return $this->increment('used_count');
    }

    /**
     * Activate the coupon.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the coupon.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }
}
