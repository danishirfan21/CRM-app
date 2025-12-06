<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\InteractionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('contacts', ContactController::class);
    Route::post('/contacts/{id}/tags', [ContactController::class, 'attachTag']);
    Route::delete('/contacts/{id}/tags/{tagId}', [ContactController::class, 'detachTag']);

    Route::apiResource('tags', TagController::class);

    Route::get('/contacts/{contactId}/notes', [NoteController::class, 'index']);
    Route::post('/contacts/{contactId}/notes', [NoteController::class, 'store']);
    Route::put('/contacts/{contactId}/notes/{id}', [NoteController::class, 'update']);
    Route::delete('/contacts/{contactId}/notes/{id}', [NoteController::class, 'destroy']);

    Route::get('/contacts/{contactId}/interactions', [InteractionController::class, 'index']);
    Route::post('/contacts/{contactId}/interactions', [InteractionController::class, 'store']);
    Route::put('/contacts/{contactId}/interactions/{id}', [InteractionController::class, 'update']);
    Route::delete('/contacts/{contactId}/interactions/{id}', [InteractionController::class, 'destroy']);
});
