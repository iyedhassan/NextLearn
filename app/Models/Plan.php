<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'interval',
        'is_recommended',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_recommended' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'interval' => 'Monthly',
        'is_recommended' => false,
        'is_active' => true,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all features for this plan.
     */
    public function features()
    {
        return $this->hasMany(Feature::class);
    }

    /**
     * Get all subscriptions for this plan.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active subscriptions for this plan.
     */
    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('state', 'Activated');
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active plans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include recommended plans.
     */
    public function scopeRecommended($query)
    {
        return $query->where('is_recommended', true);
    }

    /**
     * Scope a query to filter by interval.
     */
    public function scopeInterval($query, $interval)
    {
        return $query->where('interval', $interval);
    }

    /**
     * Scope a query to order by price.
     */
    public function scopeOrderByPrice($query, $direction = 'asc')
    {
        return $query->orderBy('price', $direction);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if plan is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if plan is recommended.
     */
    public function isRecommended(): bool
    {
        return $this->is_recommended;
    }

    /**
     * Activate the plan.
     */
    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the plan.
     */
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Mark as recommended.
     */
    public function markAsRecommended(): bool
    {
        return $this->update(['is_recommended' => true]);
    }

    /**
     * Unmark as recommended.
     */
    public function unmarkAsRecommended(): bool
    {
        return $this->update(['is_recommended' => false]);
    }

    /**
     * Get total active subscribers.
     */
    public function getTotalSubscribersAttribute(): int
    {
        return $this->activeSubscriptions()->count();
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format((float) $this->price, 2);
    }

    /**
     * Get price per month (normalized).
     */
    public function getPricePerMonthAttribute(): float
    {
        $price = (float) $this->price;

        switch ($this->interval) {
            case 'Single':
                return 0.0;
            case 'Weekly':
                return $price * 4;
            case 'Monthly':
                return $price;
            case 'Yearly':
                return $price / 12;
            default:
                return $price;
        }
    }
}
