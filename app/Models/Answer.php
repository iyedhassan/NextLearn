<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Answer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'question_id',
        'form_id',
        'session_id',
        'answer',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that submitted the answer.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the question this answer belongs to.
     */
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the form this answer belongs to.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get the session this answer belongs to (if any).
     */
    public function session()
    {
        return $this->belongsTo(Session::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query for answers by a specific user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query for answers to a specific form.
     */
    public function scopeForForm($query, $formId)
    {
        return $query->where('form_id', $formId);
    }

    /**
     * Scope a query for answers in a specific session.
     */
    public function scopeInSession($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if this answer is correct.
     */
    public function isCorrect(): bool
    {
        if (!$this->question || !$this->question->is_matchable) {
            return false;
        }

        return $this->question->isCorrectAnswer($this->answer);
    }

    /**
     * Get score for this answer (1 if correct, 0 if wrong).
     */
    public function getScore(): int
    {
        return $this->isCorrect() ? 1 : 0;
    }
}
