<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'image',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url', 'courses_count'];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }
        return asset('storage/' . $this->image);
    }

    /**
     * Get the courses count attribute.
     */
    public function getCoursesCountAttribute()
    {
        return $this->forms()->count();
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get all forms (courses) for this category.
     */
    public function forms()
    {
        return $this->hasMany(Form::class);
    }

    /**
     * Get published forms for this category.
     */
    public function publishedForms()
    {
        return $this->hasMany(Form::class)->where('state', 'Published');
    }

    // ==================== SCOPES ====================

    /**
     * Scope to only active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Create a new category from name.
     */
    public static function createFromName($name)
    {
        $slug = Str::slug($name);

        // Vérifier si la catégorie existe déjà
        $existing = static::where('slug', $slug)->first();
        if ($existing) {
            return $existing;
        }

        // Créer une nouvelle catégorie
        return static::create([
            'name' => $name,
            'slug' => $slug,
            'description' => "Catégorie créée automatiquement pour: {$name}",
            'color' => static::getRandomColor(),
            'icon' => static::getRandomIcon(),
            'is_active' => true,
            'sort_order' => static::max('sort_order') + 1 ?? 0,
        ]);
    }

    /**
     * Get a random color for new categories.
     */
    public static function getRandomColor()
    {
        $colors = [
            '#007bff',
            '#28a745',
            '#dc3545',
            '#ffc107',
            '#17a2b8',
            '#6f42c1',
            '#e83e8c',
            '#fd7e14',
            '#20c997',
            '#6c757d'
        ];
        return $colors[array_rand($colors)];
    }

    /**
     * Get a random icon for new categories.
     */
    public static function getRandomIcon()
    {
        $icons = [
            'fas fa-book',
            'fas fa-graduation-cap',
            'fas fa-laptop-code',
            'fas fa-paint-brush',
            'fas fa-camera',
            'fas fa-music',
            'fas fa-dumbbell',
            'fas fa-utensils',
            'fas fa-car',
            'fas fa-heart',
            'fas fa-globe',
            'fas fa-lightbulb'
        ];
        return $icons[array_rand($icons)];
    }

    /**
     * Get or create category by name.
     */
    public static function findOrCreateByName($name)
    {
        $slug = Str::slug($name);

        // If name is mostly special chars, slug might be empty
        if (empty($slug)) {
            $slug = 'cat-' . Str::random(5);
        }

        return static::firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $name,
                'description' => "Catégorie: {$name}",
                'color' => static::getRandomColor(),
                'icon' => static::getRandomIcon(),
                'is_active' => true,
                'sort_order' => (static::max('sort_order') ?? 0) + 1,
            ]
        );
    }
}
