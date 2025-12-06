<?php

namespace App\Http\Controllers;

use App\Models\Interaction;
use Illuminate\Http\Request;

class InteractionController extends Controller
{
    public function index($contactId)
    {
        $interactions = Interaction::where('contact_id', $contactId)
            ->latest('interaction_date')
            ->get();

        return response()->json($interactions);
    }

    public function store(Request $request, $contactId)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note,other',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'interaction_date' => 'required|date',
            'duration_minutes' => 'nullable|integer|min:0',
        ]);

        $interaction = Interaction::create([
            'contact_id' => $contactId,
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        $interaction->load('user');
        return response()->json($interaction, 201);
    }

    public function update(Request $request, $contactId, $id)
    {
        $interaction = Interaction::where('contact_id', $contactId)->findOrFail($id);

        if ($interaction->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|required|in:call,email,meeting,note,other',
            'subject' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'interaction_date' => 'sometimes|required|date',
            'duration_minutes' => 'nullable|integer|min:0',
        ]);

        $interaction->update($validated);
        $interaction->load('user');

        return response()->json($interaction);
    }

    public function destroy(Request $request, $contactId, $id)
    {
        $interaction = Interaction::where('contact_id', $contactId)->findOrFail($id);

        if ($interaction->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $interaction->delete();
        return response()->json(['message' => 'Interaction deleted successfully']);
    }
}
