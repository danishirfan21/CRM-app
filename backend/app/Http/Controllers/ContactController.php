<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::with(['tags', 'notes', 'interactions']);

        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('tags') && is_array($request->tags)) {
            $query->byTags($request->tags);
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('sort')) {
            $sortField = $request->sort;
            $sortDirection = $request->get('direction', 'asc');

            if (in_array($sortField, ['first_name', 'last_name', 'email', 'company', 'created_at'])) {
                $query->orderBy($sortField, $sortDirection);
            }
        } else {
            $query->latest();
        }

        $perPage = $request->get('per_page', 15);
        $contacts = $query->paginate($perPage);

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:contacts,email',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,lead,customer',
        ]);

        $contact = Contact::create($validated);
        $contact->load(['tags', 'notes', 'interactions']);

        return response()->json($contact, 201);
    }

    public function show($id)
    {
        $contact = Contact::with(['tags', 'notes.user', 'interactions.user'])->findOrFail($id);
        return response()->json($contact);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:contacts,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,lead,customer',
        ]);

        $contact->update($validated);
        $contact->load(['tags', 'notes', 'interactions']);

        return response()->json($contact);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }

    public function attachTag(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);

        if (!$contact->tags()->where('tag_id', $validated['tag_id'])->exists()) {
            $contact->tags()->attach($validated['tag_id']);
        }

        $contact->load('tags');
        return response()->json($contact);
    }

    public function detachTag(Request $request, $id, $tagId)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact = Contact::findOrFail($id);
        $contact->tags()->detach($tagId);
        $contact->load('tags');

        return response()->json($contact);
    }
}
