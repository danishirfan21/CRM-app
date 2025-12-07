<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NoteController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, $contactId)
    {
        // Verify contact exists
        $contact = Contact::findOrFail($contactId);
        
        // Check if user can view this contact (optional - uncomment if needed)
        // $this->authorize('view', $contact);

        // Get notes that are visible to the current user
        $notes = Note::where('contact_id', $contactId)
            ->visible($request->user())
            ->with('user:id,name,email') // Load user relationship here (not in model)
            ->latest()
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request, $contactId)
    {
        // Verify contact exists
        $contact = Contact::findOrFail($contactId);
        
        // Check if user can create notes for this contact (uses policy)
        $this->authorize('create', [Note::class, $contact]);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'is_private' => 'boolean',
        ], [
            'content.required' => 'Note content is required.',
            'content.max' => 'Note content cannot exceed 5000 characters.',
        ]);

        $note = Note::create([
            'contact_id' => $contactId,
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'is_private' => $validated['is_private'] ?? true,
        ]);

        $note->load('user:id,name,email');
        return response()->json([
            'note' => $note,
            'message' => 'Note added successfully!',
        ], 201);
    }

    public function update(Request $request, $contactId, $id)
    {
        // Verify contact exists
        Contact::findOrFail($contactId);
        
        $note = Note::where('contact_id', $contactId)->findOrFail($id);

        // Check if user can update this note (uses policy)
        $this->authorize('update', $note);

        $validated = $request->validate([
            'content' => 'sometimes|required|string|max:5000',
            'is_private' => 'sometimes|boolean',
        ], [
            'content.max' => 'Note content cannot exceed 5000 characters.',
        ]);

        $note->update($validated);
        $note->load('user:id,name,email');

        return response()->json([
            'note' => $note,
            'message' => 'Note updated successfully!',
        ]);
    }

    public function destroy(Request $request, $contactId, $id)
    {
        // Verify contact exists
        Contact::findOrFail($contactId);
        
        $note = Note::where('contact_id', $contactId)->findOrFail($id);

        // Check if user can delete this note (uses policy)
        $this->authorize('delete', $note);

        $note->delete();
        return response()->json(['message' => 'Note deleted successfully']);
    }
}