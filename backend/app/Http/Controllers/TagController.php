<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::withCount('contacts')->orderBy('name')->get();
        return response()->json($tags);
    }

    public function store(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'color' => 'required|string|max:7|regex:/^#[0-9A-F]{6}$/i',
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'Tag name is required.',
            'name.unique' => 'A tag with this name already exists.',
            'color.required' => 'Tag color is required.',
            'color.regex' => 'Please provide a valid hex color code.',
            'description.max' => 'Description cannot exceed 500 characters.',
        ]);

        $tag = Tag::create($validated);
        return response()->json([
            'tag' => $tag,
            'message' => 'Tag created successfully!',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:tags,name,' . $id,
            'color' => 'sometimes|required|string|max:7|regex:/^#[0-9A-F]{6}$/i',
            'description' => 'nullable|string|max:500',
        ], [
            'name.unique' => 'A tag with this name already exists.',
            'color.regex' => 'Please provide a valid hex color code.',
            'description.max' => 'Description cannot exceed 500 characters.',
        ]);

        $tag->update($validated);
        return response()->json([
            'tag' => $tag,
            'message' => 'Tag updated successfully!',
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }
}
