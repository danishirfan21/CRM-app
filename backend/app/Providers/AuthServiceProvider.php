<?php

namespace App\Providers;

use App\Models\Contact;
use App\Models\Note;
use App\Models\Interaction;
use App\Policies\ContactPolicy;
use App\Policies\NotePolicy;
use App\Policies\InteractionPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Contact::class => ContactPolicy::class,
        Note::class => NotePolicy::class,
        Interaction::class => InteractionPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}