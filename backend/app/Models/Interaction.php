<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'user_id',
        'type',
        'subject',
        'description',
        'interaction_date',
        'duration_minutes',
    ];

    protected $casts = [
        'interaction_date' => 'datetime',
    ];

    // Removed eager loading - load 'user' only when needed
    // protected $with = ['user'];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}