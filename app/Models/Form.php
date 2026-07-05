<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Form extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'type',
        'description',
        'tags',
        'state',
        'time_limit',
        'passing_score',
        'image',
        'level',
        'price',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'time_limit' => 'integer',
        'passing_score' => 'integer',
        'price' => 'float',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'state' => 'Draft',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url', 'average_rating', 'review_count'];

    public function getAverageRatingAttribute()
    {
        $avg = $this->feedbacks()
            ->whereIn('type', ['Review', 'review'])
            ->whereNotNull('rating')
            ->avg('rating');

        return number_format((float) $avg, 1);
    }

    public function getReviewCountAttribute()
    {
        return $this->feedbacks()->whereIn('type', ['Review', 'review'])->count();
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // Ensure we always return a full URL even if APP_URL is not fully configured
        $url = Storage::disk('public')->url($this->image);
        if (!str_starts_with($url, 'http')) {
            $url = url($url);
        }
        return $url;
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user (creator) of the form.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the form.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all questions for this form.
     */
    public function questions()
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    /**
     * Get all topics for this course.
     */
    public function topics()
    {
        return $this->hasMany(Topic::class)->orderBy('order');
    }

    /**
     * Get all answers for this form.
     */
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    /**
     * Get all admissions using this form.
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get all lessons using this form.
     */
    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }



    /**
     * Get all feedbacks for this form.
     */
    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include published forms.
     */
    public function scopePublished($query)
    {
        return $query->where('state', 'Published');
    }

    /**
     * Scope a query to only include draft forms.
     */
    public function scopeDraft($query)
    {
        return $query->where('state', 'Draft');
    }

    /**
     * Scope a query to filter by form type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include admission forms.
     */
    public function scopeAdmissions($query)
    {
        return $query->where('type', 'Admission');
    }



    /**
     * Scope a query to only include exercise forms.
     */
    public function scopeExercises($query)
    {
        return $query->where('type', 'Exercise');
    }

    /**
     * Scope a query to only include exam forms.
     */
    public function scopeExams($query)
    {
        return $query->where('type', 'Exam');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if form is published.
     */
    public function isPublished(): bool
    {
        return $this->state === 'Published';
    }

    /**
     * Check if form is draft.
     */
    public function isDraft(): bool
    {
        return $this->state === 'Draft';
    }

    /**
     * Publish the form.
     */
    public function publish(): bool
    {
        return $this->update(['state' => 'Published']);
    }

    /**
     * Unpublish the form (set to draft).
     */
    public function unpublish(): bool
    {
        return $this->update(['state' => 'Draft']);
    }

    /**
     * Get total number of questions.
     */
    public function getTotalQuestionsAttribute(): int
    {
        return $this->questions()->count();
    }

    /**
     * Get total number of submissions.
     */
    public function getTotalSubmissionsAttribute(): int
    {
        return $this->answers()->distinct('user_id')->count('user_id');
    }

    /**
     * Check if form has a time limit.
     */
    public function hasTimeLimit(): bool
    {
        return $this->time_limit !== null && $this->time_limit > 0;
    }

    /**
     * Check if form has a passing score.
     */
    public function hasPassingScore(): bool
    {
        return $this->passing_score !== null && $this->passing_score > 0;
    }

    /**
     * Get user's score for this form.
     */
    public function getUserScore($userId): ?float
    {
        $userAnswers = $this->answers()->where('user_id', $userId)->get();

        if ($userAnswers->isEmpty()) {
            return null;
        }

        $totalQuestions = $this->questions()->where('is_matchable', true)->count();

        if ($totalQuestions === 0) {
            return null;
        }

        $correctAnswers = 0;

        foreach ($userAnswers as $answer) {
            $question = $answer->question;

            if ($question && $question->is_matchable && $question->correct_answers) {
                if ($answer->answer === $question->correct_answers) {
                    $correctAnswers++;
                }
            }
        }

        return ($correctAnswers / $totalQuestions) * 100;
    }

    /**
     * Check if user passed this form.
     */
    public function userPassed($userId): ?bool
    {
        if (!$this->hasPassingScore()) {
            return null;
        }

        $score = $this->getUserScore($userId);

        if ($score === null) {
            return null;
        }

        return $score >= $this->passing_score;
    }
}
