<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request, $contactId)
    {
        $notes = Note::where('contact_id', $contactId)
            ->visible($request->user())
            ->latest()
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request, $contactId)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'is_private' => 'boolean',
        ]);

        $note = Note::create([
            'contact_id' => $contactId,
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'is_private' => $validated['is_private'] ?? true,
        ]);

        $note->load('user');
        return response()->json($note, 201);
    }

    public function update(Request $request, $contactId, $id)
    {
        $note = Note::where('contact_id', $contactId)->findOrFail($id);

        if ($note->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'sometimes|required|string',
            'is_private' => 'sometimes|boolean',
        ]);

        $note->update($validated);
        $note->load('user');

        return response()->json($note);
    }

    public function destroy(Request $request, $contactId, $id)
    {
        $note = Note::where('contact_id', $contactId)->findOrFail($id);

        if ($note->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();
        return response()->json(['message' => 'Note deleted successfully']);
    }
}
