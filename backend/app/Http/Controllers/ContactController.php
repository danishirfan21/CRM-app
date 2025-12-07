<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ContactController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        // Check if user can view contacts
        $this->authorize('viewAny', Contact::class);

        // Validate all query parameters
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'integer|exists:tags,id',
            'status' => 'nullable|in:active,inactive,lead,customer',
            'sort' => 'nullable|in:first_name,last_name,email,company,created_at',
            'direction' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Contact::with(['tags']);

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
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->latest();
        }

        $perPage = min($request->get('per_page', 15), 100);
        $contacts = $query->paginate($perPage);

        return response()->json($contacts);
    }

    public function store(Request $request)
    {
        // Check if user can create contacts (uses policy)
        $this->authorize('create', Contact::class);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255|min:2',
            'last_name' => 'required|string|max:255|min:2',
            'email' => 'required|email:rfc|unique:contacts,email',
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\(\)\+]+$/',
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
        $contact->load(['tags']);

        return response()->json([
            'contact' => $contact,
            'message' => 'Contact created successfully!',
        ], 201);
    }

    public function show($id)
    {
        // Load only necessary relationships with limited data
        $contact = Contact::with([
            'tags',
            'notes' => function ($query) {
                $query->with('user:id,name')
                    ->latest()
                    ->limit(50); // Limit to recent notes
            },
            'interactions' => function ($query) {
                $query->with('user:id,name')
                    ->latest('interaction_date')
                    ->limit(50); // Limit to recent interactions
            }
        ])->findOrFail($id);

        // Check if user can view this contact
        $this->authorize('view', $contact);
        
        return response()->json($contact);
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        // Check if user can update this contact (uses policy)
        $this->authorize('update', $contact);

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255|min:2',
            'last_name' => 'sometimes|required|string|max:255|min:2',
            'email' => 'sometimes|required|email:rfc|unique:contacts,email,' . $id,
            'phone' => 'nullable|string|max:20|regex:/^[\d\s\-\(\)\+]+$/',
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
        $contact->load(['tags']);

        return response()->json([
            'contact' => $contact,
            'message' => 'Contact updated successfully!',
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        // Check if user can delete this contact (uses policy)
        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json(['message' => 'Contact deleted successfully']);
    }

    public function attachTag(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        // Check if user can manage tags for this contact (uses policy)
        $this->authorize('manageTags', $contact);

        $validated = $request->validate([
            'tag_id' => 'required|exists:tags,id',
        ]);

        // Use syncWithoutDetaching to avoid duplicate check and extra query
        $contact->tags()->syncWithoutDetaching([$validated['tag_id']]);

        $contact->load('tags');
        return response()->json([
            'contact' => $contact,
            'message' => 'Tag attached successfully!',
        ]);
    }

    public function detachTag(Request $request, $id, $tagId)
    {
        $contact = Contact::findOrFail($id);

        // Check if user can manage tags for this contact (uses policy)
        $this->authorize('manageTags', $contact);

        $contact->tags()->detach($tagId);
        $contact->load('tags');

        return response()->json([
            'contact' => $contact,
            'message' => 'Tag removed successfully!',
        ]);
    }
}