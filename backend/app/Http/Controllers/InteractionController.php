<?php

namespace App\Http\Controllers;

use App\Models\Interaction;
use App\Models\Contact;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    public function index($contactId)
    {
        // Verify contact exists
        $contact = Contact::findOrFail($contactId);
        
        // Optional: Add authorization check
        // $this->authorize('view', $contact);

        $interactions = Interaction::where('contact_id', $contactId)
            ->with('user:id,name,email') // Load user relationship here
            ->latest('interaction_date')
            ->get();

        return response()->json($interactions);
    }

    public function store(Request $request, $contactId)
    {
        // Verify contact exists
        $contact = Contact::findOrFail($contactId);
        
        // Optional: Add authorization check
        // $this->authorize('update', $contact);

        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note,other',
            'subject' => 'required|string|max:255|min:3',
            'description' => 'nullable|string|max:2000',
            'interaction_date' => 'required|date|before_or_equal:today',
            'duration_minutes' => 'nullable|integer|min:0|max:1440',
        ], [
            'type.required' => 'Interaction type is required.',
            'subject.required' => 'Subject is required.',
            'subject.min' => 'Subject must be at least 3 characters.',
            'description.max' => 'Description cannot exceed 2000 characters.',
            'interaction_date.before_or_equal' => 'Interaction date cannot be in the future.',
            'duration_minutes.max' => 'Duration cannot exceed 24 hours (1440 minutes).',
        ]);

        $interaction = Interaction::create([
            'contact_id' => $contactId,
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        $interaction->load('user:id,name,email');
        return response()->json([
            'interaction' => $interaction,
            'message' => 'Interaction logged successfully!',
        ], 201);
    }

    public function update(Request $request, $contactId, $id)
    {
        // Verify contact exists
        Contact::findOrFail($contactId);
        
        $interaction = Interaction::where('contact_id', $contactId)->findOrFail($id);

        if ($interaction->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|required|in:call,email,meeting,note,other',
            'subject' => 'sometimes|required|string|max:255|min:3',
            'description' => 'nullable|string|max:2000',
            'interaction_date' => 'sometimes|required|date|before_or_equal:today',
            'duration_minutes' => 'nullable|integer|min:0|max:1440',
        ], [
            'subject.min' => 'Subject must be at least 3 characters.',
            'description.max' => 'Description cannot exceed 2000 characters.',
            'interaction_date.before_or_equal' => 'Interaction date cannot be in the future.',
            'duration_minutes.max' => 'Duration cannot exceed 24 hours (1440 minutes).',
        ]);

        $interaction->update($validated);
        $interaction->load('user:id,name,email');

        return response()->json([
            'interaction' => $interaction,
            'message' => 'Interaction updated successfully!',
        ]);
    }

    public function destroy(Request $request, $contactId, $id)
    {
        // Verify contact exists
        Contact::findOrFail($contactId);
        
        $interaction = Interaction::where('contact_id', $contactId)->findOrFail($id);

        if ($interaction->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $interaction->delete();
        return response()->json(['message' => 'Interaction deleted successfully']);
    }
}