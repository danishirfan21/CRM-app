<?php

namespace App\Policies;

use App\Models\Note;
use App\Models\User;
use App\Models\Contact;
use Illuminate\Auth\Access\HandlesAuthorization;

class NotePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the note.
     */
    public function view(User $user, Note $note): bool
    {
        // Admins can view all notes
        if ($user->isAdmin()) {
            return true;
        }

        // Users can view their own notes
        if ($note->user_id === $user->id) {
            return true;
        }

        // Users can view non-private notes
        return !$note->is_private;
    }

    /**
     * Determine whether the user can create notes for a contact.
     */
    public function create(User $user, Contact $contact): bool
    {
        // All authenticated users can create notes
        return true;
    }

    /**
     * Determine whether the user can update the note.
     */
    public function update(User $user, Note $note): bool
    {
        // Admins can update all notes
        if ($user->isAdmin()) {
            return true;
        }

        // Users can only update their own notes
        return $note->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the note.
     */
    public function delete(User $user, Note $note): bool
    {
        // Admins can delete all notes
        if ($user->isAdmin()) {
            return true;
        }

        // Users can only delete their own notes
        return $note->user_id === $user->id;
    }
}