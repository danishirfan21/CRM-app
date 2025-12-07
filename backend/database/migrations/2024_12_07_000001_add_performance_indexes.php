<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add index on contacts.status for filtering
        Schema::table('contacts', function (Blueprint $table) {
            $table->index('status');
        });

        // Add index on interactions.interaction_date for sorting
        Schema::table('interactions', function (Blueprint $table) {
            $table->index('interaction_date');
        });

        // Add composite index on notes for common queries
        Schema::table('notes', function (Blueprint $table) {
            $table->index(['contact_id', 'user_id']);
        });

        // Add composite index on interactions for common queries
        Schema::table('interactions', function (Blueprint $table) {
            $table->index(['contact_id', 'user_id']);
        });

        // Add index on password_reset_tokens.created_at for cleanup
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('interactions', function (Blueprint $table) {
            $table->dropIndex(['interaction_date']);
            $table->dropIndex(['contact_id', 'user_id']);
        });

        Schema::table('notes', function (Blueprint $table) {
            $table->dropIndex(['contact_id', 'user_id']);
        });

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};