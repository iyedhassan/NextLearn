<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'form_id',
        'title',
        'type',
        'options',
        'correct_answers',
        'is_required',
        'is_matchable',
        'show_matches',
        'order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_required' => 'boolean',
        'is_matchable' => 'boolean',
        'show_matches' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'type' => 'Short',
        'is_required' => true,
        'is_matchable' => false,
        'show_matches' => false,
        'order' => 1,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the form that owns the question.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get all answers for this question.
     */
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include required questions.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope a query to only include matchable questions.
     */
    public function scopeMatchable($query)
    {
        return $query->where('is_matchable', true);
    }

    /**
     * Scope a query to order by question order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if question is required.
     */
    public function isRequired(): bool
    {
        return $this->is_required;
    }

    /**
     * Check if question is matchable (has correct answer).
     */
    public function isMatchable(): bool
    {
        return $this->is_matchable;
    }

    /**
     * Check if answer is correct.
     */
    public function isCorrectAnswer(string $answer): bool
    {
        if (!$this->is_matchable || !$this->correct_answers) {
            return false;
        }

        return trim($answer) === trim($this->correct_answers);
    }

    /**
     * Get options as array.
     */
    public function getOptionsArrayAttribute(): array
    {
        if (!$this->options) {
            return [];
        }

        return explode("\n", $this->options);
    }
}
