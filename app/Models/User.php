<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'state',
        'last_login_at',
        'last_seen_at',
        'ip_address',
        'credits',
        'reputation',
        'api_token',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'credits' => 'integer',
        'reputation' => 'integer',
    ];

    /**
     * The attributes that should be set to default values.
     *
     * @var array
     */
    protected $attributes = [
        'role' => 'Student',
        'state' => 'Inactive',
        'credits' => 0,
        'reputation' => 0,
    ];

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the person profile associated with the user.
     */
    public function person()
    {
        return $this->hasOne(Person::class);
    }


    /**
     * Get all subscriptions for the user.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the active subscription for the user.
     */
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('state', 'Activated')
            ->latest();
    }

    /**
     * Get all invoices for the user.
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get all forms created by the user.
     */
    public function forms()
    {
        return $this->hasMany(Form::class);
    }

    /**
     * Get all answers submitted by the user.
     */
    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    /**
     * Get all admissions for the user.
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get all sessions where user is a student.
     */
    public function sessionsAsStudent()
    {
        return $this->hasMany(Session::class, 'student_id');
    }

    /**
     * Get all sessions where user is a tutor.
     */
    public function sessionsAsTutor()
    {
        return $this->hasMany(Session::class, 'tutor_id');
    }

    /**
     * Get all feedbacks submitted by the user.
     */
    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('state', 'Active');
    }

    /**
     * Scope a query to only include users of a specific role.
     */
    public function scopeRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope a query to only include admins.
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'Admin');
    }

    /**
     * Scope a query to only include students.
     */
    public function scopeStudents($query)
    {
        return $query->where('role', 'Student');
    }

    /**
     * Scope a query to only include tutors.
     */
    public function scopeTutors($query)
    {
        return $query->where('role', 'Tutor');
    }

    /**
     * Scope a query to only include verified users.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    /**
     * Check if user is a student.
     */
    public function isStudent(): bool
    {
        return $this->role === 'Student';
    }

    /**
     * Check if user is a tutor.
     */
    public function isTutor(): bool
    {
        return $this->role === 'Tutor';
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->state === 'Active';
    }

    /**
     * Check if user is banned.
     */
    public function isBanned(): bool
    {
        return $this->state === 'Banned';
    }

    /**
     * Add credits to user account.
     */
    public function addCredits(int $amount): void
    {
        $this->increment('credits', $amount);
    }

    /**
     * Deduct credits from user account.
     */
    public function deductCredits(int $amount): bool
    {
        if ($this->credits >= $amount) {
            $this->decrement('credits', $amount);
            return true;
        }
        return false;
    }

    /**
     * Add reputation points.
     */
    public function addReputation(int $points): void
    {
        $this->increment('reputation', $points);
    }

    /**
     * Update last seen timestamp.
     */
    public function updateLastSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    /**
     * Update last login timestamp and IP.
     */
    public function updateLastLogin(?string $ip = null): void
    {
        $this->update([
            'last_login_at' => now(),
            'ip_address' => $ip ?? request()->ip(),
        ]);
    }

    /**
     * Get full name from person profile.
     */
    public function getFullNameAttribute(): ?string
    {
        if ($this->person) {
            return trim("{$this->person->first_name} {$this->person->last_name}");
        }
        return $this->name;
    }

    /**
     * Check if user has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->activeSubscription()->exists();
    }
}

