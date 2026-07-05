<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Lesson model representing a lesson within a session and form.
 */
class Lesson extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_id',
        'form_id',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed_at' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * The session this lesson belongs to.
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    /**
     * The form this lesson belongs to.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope to only completed lessons.
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    /**
     * Scope to only pending lessons.
     */
    public function scopePending($query)
    {
        return $query->whereNull('completed_at');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if the lesson is completed.
     */
    public function isCompleted(): bool
    {
        return $this->completed_at !== null;
    }

    /**
     * Mark the lesson as completed now.
     */
    public function markCompleted(): bool
    {
        return $this->update(['completed_at' => now()]);
    }
}
