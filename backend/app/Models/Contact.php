<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'company',
        'position',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'status',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'contact_tag');
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class)->orderBy('interaction_date', 'desc');
    }

    public function scopeSearch($query, $search)
    {
        if ($search) {
            // Escape SQL wildcards to prevent unexpected behavior
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $search);
            return $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    public function scopeByTags($query, $tagIds)
    {
        if ($tagIds && is_array($tagIds) && count($tagIds) > 0) {
            return $query->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('tags.id', $tagIds);
            });
        }
        return $query;
    }

    public function scopeByStatus($query, $status)
    {
        // Validate status before using it in query
        if ($status && in_array($status, ['active', 'inactive', 'lead', 'customer'])) {
            return $query->where('status', $status);
        }
        return $query;
    }
}