<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Admission model representing a user’s request to join a form (e.g., course admission).
 */
class Admission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'form_id',
        'is_approved',
        'verified_at',
        'admin_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_approved' => 'boolean',
        'verified_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * The user who submitted the admission.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The form (or course) the admission is for.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * The admin who verified/approved the admission.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only approved admissions.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only pending admissions.
     */
    public function scopePending($query)
    {
        return $query->where('is_approved', false)->whereNull('verified_at');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Mark the admission as approved.
     */
    public function approve(int $adminId): bool
    {
        return $this->update([
            'is_approved' => true,
            'verified_at' => now(),
            'admin_id' => $adminId,
        ]);
    }

    /**
     * Mark the admission as rejected.
     */
    public function reject(): bool
    {
        return $this->update([
            'is_approved' => false,
            'verified_at' => now(),
            'admin_id' => null,
        ]);
    }
}
