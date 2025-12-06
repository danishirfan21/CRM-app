<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Contact;
use App\Models\Tag;
use App\Models\Note;
use App\Models\Interaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@crm.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $user = User::create([
            'name' => 'John Doe',
            'email' => 'user@crm.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $tags = [
            ['name' => 'VIP', 'color' => '#EF4444', 'description' => 'Very Important Person'],
            ['name' => 'Lead', 'color' => '#3B82F6', 'description' => 'Potential customer'],
            ['name' => 'Partner', 'color' => '#10B981', 'description' => 'Business partner'],
            ['name' => 'Hot Lead', 'color' => '#F59E0B', 'description' => 'High priority lead'],
            ['name' => 'Cold', 'color' => '#6B7280', 'description' => 'Inactive contact'],
        ];

        foreach ($tags as $tagData) {
            Tag::create($tagData);
        }

        $contacts = [
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@techcorp.com',
                'phone' => '+1-555-0101',
                'company' => 'TechCorp Solutions',
                'position' => 'CEO',
                'address' => '123 Tech Street',
                'city' => 'San Francisco',
                'state' => 'CA',
                'zip_code' => '94102',
                'country' => 'USA',
                'status' => 'customer',
            ],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'email' => 'michael.chen@innovate.io',
                'phone' => '+1-555-0102',
                'company' => 'Innovate Labs',
                'position' => 'CTO',
                'address' => '456 Innovation Blvd',
                'city' => 'Austin',
                'state' => 'TX',
                'zip_code' => '73301',
                'country' => 'USA',
                'status' => 'lead',
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Rodriguez',
                'email' => 'emily.r@startup.com',
                'phone' => '+1-555-0103',
                'company' => 'Startup Ventures',
                'position' => 'Marketing Director',
                'address' => '789 Startup Ave',
                'city' => 'New York',
                'state' => 'NY',
                'zip_code' => '10001',
                'country' => 'USA',
                'status' => 'active',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Kim',
                'email' => 'david.kim@enterprise.com',
                'phone' => '+1-555-0104',
                'company' => 'Enterprise Solutions',
                'position' => 'VP of Sales',
                'address' => '321 Business Park',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip_code' => '98101',
                'country' => 'USA',
                'status' => 'customer',
            ],
            [
                'first_name' => 'Lisa',
                'last_name' => 'Anderson',
                'email' => 'lisa.anderson@digital.com',
                'phone' => '+1-555-0105',
                'company' => 'Digital Marketing Co',
                'position' => 'Founder',
                'address' => '555 Digital Way',
                'city' => 'Los Angeles',
                'state' => 'CA',
                'zip_code' => '90001',
                'country' => 'USA',
                'status' => 'lead',
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Williams',
                'email' => 'robert.w@consulting.com',
                'phone' => '+1-555-0106',
                'company' => 'Williams Consulting',
                'position' => 'Senior Consultant',
                'address' => '777 Consulting Plaza',
                'city' => 'Chicago',
                'state' => 'IL',
                'zip_code' => '60601',
                'country' => 'USA',
                'status' => 'active',
            ],
            [
                'first_name' => 'Jennifer',
                'last_name' => 'Martinez',
                'email' => 'jennifer.m@finance.com',
                'phone' => '+1-555-0107',
                'company' => 'Finance Plus',
                'position' => 'CFO',
                'address' => '999 Finance Street',
                'city' => 'Boston',
                'state' => 'MA',
                'zip_code' => '02101',
                'country' => 'USA',
                'status' => 'customer',
            ],
            [
                'first_name' => 'James',
                'last_name' => 'Taylor',
                'email' => 'james.taylor@retail.com',
                'phone' => '+1-555-0108',
                'company' => 'Retail Giants',
                'position' => 'Operations Manager',
                'address' => '111 Retail Blvd',
                'city' => 'Miami',
                'state' => 'FL',
                'zip_code' => '33101',
                'country' => 'USA',
                'status' => 'lead',
            ],
        ];

        foreach ($contacts as $contactData) {
            $contact = Contact::create($contactData);

            $randomTags = Tag::inRandomOrder()->limit(rand(1, 3))->pluck('id');
            $contact->tags()->attach($randomTags);

            Note::create([
                'contact_id' => $contact->id,
                'user_id' => $admin->id,
                'content' => 'Initial contact established. Very interested in our services.',
                'is_private' => false,
            ]);

            Note::create([
                'contact_id' => $contact->id,
                'user_id' => $user->id,
                'content' => 'Follow-up required next week.',
                'is_private' => true,
            ]);

            Interaction::create([
                'contact_id' => $contact->id,
                'user_id' => $admin->id,
                'type' => 'call',
                'subject' => 'Initial consultation call',
                'description' => 'Discussed project requirements and timeline.',
                'interaction_date' => now()->subDays(rand(1, 30)),
                'duration_minutes' => rand(15, 60),
            ]);

            Interaction::create([
                'contact_id' => $contact->id,
                'user_id' => $user->id,
                'type' => 'email',
                'subject' => 'Proposal sent',
                'description' => 'Sent detailed proposal with pricing.',
                'interaction_date' => now()->subDays(rand(1, 15)),
            ]);
        }
    }
}
