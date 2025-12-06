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
            'first_name' => 'required|string|max:255|min:2',
            'last_name' => 'required|string|max:255|min:2',
            'email' => 'required|email:rfc,dns|unique:contacts,email',
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\(\)]+$/',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,lead,customer',
        ], [
            'first_name.required' => 'First name is required.',
            'first_name.min' => 'First name must be at least 2 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.min' => 'Last name must be at least 2 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'phone.regex' => 'Please provide a valid phone number.',
        ]);

        $contact = Contact::create($validated);
        $contact->load(['tags', 'notes', 'interactions']);

        return response()->json([
            'contact' => $contact,
            'message' => 'Contact created successfully!',
        ], 201);
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
            'first_name' => 'sometimes|required|string|max:255|min:2',
            'last_name' => 'sometimes|required|string|max:255|min:2',
            'email' => 'sometimes|required|email:rfc,dns|unique:contacts,email,' . $id,
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\(\)]+$/',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,lead,customer',
        ], [
            'first_name.min' => 'First name must be at least 2 characters.',
            'last_name.min' => 'Last name must be at least 2 characters.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'phone.regex' => 'Please provide a valid phone number.',
        ]);

        $contact->update($validated);
        $contact->load(['tags', 'notes', 'interactions']);

        return response()->json([
            'contact' => $contact,
            'message' => 'Contact updated successfully!',
        ]);
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
        return response()->json([
            'contact' => $contact,
            'message' => 'Tag attached successfully!',
        ]);
    }

    public function detachTag(Request $request, $id, $tagId)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact = Contact::findOrFail($id);
        $contact->tags()->detach($tagId);
        $contact->load('tags');

        return response()->json([
            'contact' => $contact,
            'message' => 'Tag removed successfully!',
        ]);
    }
}
