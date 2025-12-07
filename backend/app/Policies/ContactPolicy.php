<?php

namespace App\Policies;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ContactPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any contacts.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view the contacts list
        return true;
    }

    /**
     * Determine whether the user can view the contact.
     */
    public function view(User $user, Contact $contact): bool
    {
        // Admins can view all contacts
        if ($user->isAdmin()) {
            return true;
        }

        // Regular users can view all contacts (modify this based on your requirements)
        // If you want users to only see their own contacts, you'd need to add
        // a user_id column to the contacts table
        return true;

        // Alternative: If contacts have a user_id (owner):
        // return $contact->user_id === $user->id;
    }

    /**
     * Determine whether the user can create contacts.
     */
    public function create(User $user): bool
    {
        // Only admins can create contacts
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the contact.
     */
    public function update(User $user, Contact $contact): bool
    {
        // Only admins can update contacts
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the contact.
     */
    public function delete(User $user, Contact $contact): bool
    {
        // Only admins can delete contacts
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage tags for the contact.
     */
    public function manageTags(User $user, Contact $contact): bool
    {
        // Only admins can manage tags
        return $user->isAdmin();
    }
}