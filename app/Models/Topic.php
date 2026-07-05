<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Topic extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'form_id',
        'title',
        'content_type',
        'content',
        'video_url',
        'video_path',
        'order',
        'is_preview',
    ];

    protected $appends = ['video_full_url'];

    public function getVideoFullUrlAttribute()
    {
        if ($this->video_path) {
            return asset('storage/' . $this->video_path);
        }
        return $this->video_url;
    }

    /**
     * Get the course (form) this topic belongs to.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }
}
