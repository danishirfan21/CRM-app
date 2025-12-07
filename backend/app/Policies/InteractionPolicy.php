<?php

namespace App\Policies;

use App\Models\Interaction;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Auth\Access\HandlesAuthorization;

class InteractionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the interaction.
     */
    public function view(User $user, Interaction $interaction): bool
    {
        // Admins can view all interactions
        if ($user->isAdmin()) {
            return true;
        }

        // Users can view their own interactions
        // Or all interactions if you want (modify based on requirements)
        return true;
    }

    /**
     * Determine whether the user can create interactions for a contact.
     */
    public function create(User $user, Contact $contact): bool
    {
        // All authenticated users can create interactions
        return true;
    }

    /**
     * Determine whether the user can update the interaction.
     */
    public function update(User $user, Interaction $interaction): bool
    {
        // Admins can update all interactions
        if ($user->isAdmin()) {
            return true;
        }

        // Users can only update their own interactions
        return $interaction->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the interaction.
     */
    public function delete(User $user, Interaction $interaction): bool
    {
        // Admins can delete all interactions
        if ($user->isAdmin()) {
            return true;
        }

        // Users can only delete their own interactions
        return $interaction->user_id === $user->id;
    }
}