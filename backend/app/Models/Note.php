<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'user_id',
        'content',
        'is_private',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    // FIXED: Removed eager loading - load 'user' only when needed
    // This prevents N+1 queries and unnecessary memory usage
    // Controllers will explicitly load the user relationship when required

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter notes based on visibility permissions
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \App\Models\User $user
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVisible($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where(function ($q) use ($user) {
            $q->where('is_private', false)
                ->orWhere('user_id', $user->id);
        });
    }
}