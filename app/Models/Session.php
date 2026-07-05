<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Session extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'student_id',
        'tutor_id',
        'start_at',
        'end_at',
        'state',
        'cost',
        'additional_info',
        'explanation',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'cost' => 'integer',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'state' => 'Pending',
        'cost' => 1,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the student (user) for this session.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the tutor (user) for this session.
     */
    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    /**
     * Get all lessons for this session.
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }



    /**
     * Get all answers for this session.
     */
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }



    // ==================== SCOPES ====================

    /**
     * Scope a query to only include pending sessions.
     */
    public function scopePending($query)
    {
        return $query->where('state', 'Pending');
    }

    /**
     * Scope a query to only include confirmed sessions.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('state', 'Confirmed');
    }

    /**
     * Scope a query to only include ongoing sessions.
     */
    public function scopeOngoing($query)
    {
        return $query->where('state', 'Ongoing');
    }

    /**
     * Scope a query to only include finished sessions.
     */
    public function scopeFinished($query)
    {
        return $query->where('state', 'Finished');
    }

    /**
     * Scope a query to only include upcoming sessions.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_at', '>', now())
            ->whereIn('state', ['Pending', 'Confirmed']);
    }

    /**
     * Scope a query for sessions of a specific student.
     */
    public function scopeForStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query for sessions of a specific tutor.
     */
    public function scopeForTutor($query, $tutorId)
    {
        return $query->where('tutor_id', $tutorId);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if session is pending.
     */
    public function isPending(): bool
    {
        return $this->state === 'Pending';
    }

    /**
     * Check if session is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->state === 'Confirmed';
    }

    /**
     * Check if session is ongoing.
     */
    public function isOngoing(): bool
    {
        return $this->state === 'Ongoing';
    }

    /**
     * Check if session is finished.
     */
    public function isFinished(): bool
    {
        return $this->state === 'Finished';
    }

    /**
     * Check if session is canceled.
     */
    public function isCanceled(): bool
    {
        return $this->state === 'Canceled';
    }

    /**
     * Confirm the session.
     */
    public function confirm(): bool
    {
        return $this->update(['state' => 'Confirmed']);
    }

    /**
     * Cancel the session.
     */
    public function cancel(): bool
    {
        return $this->update(['state' => 'Canceled']);
    }

    /**
     * Start the session.
     */
    public function start(): bool
    {
        return $this->update(['state' => 'Ongoing']);
    }

    /**
     * Finish the session.
     */
    public function finish(): bool
    {
        return $this->update(['state' => 'Finished']);
    }

    /**
     * Get session duration in minutes.
     */
    public function getDurationAttribute(): ?int
    {
        if ($this->start_at && $this->end_at) {
            return $this->start_at->diffInMinutes($this->end_at);
        }
        return null;
    }
}
