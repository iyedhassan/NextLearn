<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feedback extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'type',
        'status',
        'form_id',
        'rating',
    ];

    protected $with = ['form', 'user'];

    public function course()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }

    public function form()
    {
        return $this->belongsTo(Form::class, 'form_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', 'New');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'Resolved');
    }
}
