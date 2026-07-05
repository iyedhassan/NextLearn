<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'middle_names',
        'last_name',
        'document',
        'birth',
        'gender',
        'nationality',
        'bio',
        'specialization',
        'website',
        'twitter',
        'facebook',
        'linkedin',
        'youtube',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'birth' => 'datetime',
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user that owns the person profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ==================== ACCESSORS ====================

    /**
     * Get the full name.
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_names,
            $this->last_name,
        ]);

        return implode(' ', $parts);
    }

    /**
     * Get the age from birth date.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birth ? $this->birth->diffInYears(now()) : null;
    }
}
