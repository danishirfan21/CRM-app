# CRM Pro - Customer Relationship Management System

A complete, production-ready CRM application built with Laravel and React.

## Features

- **Contact Management** - Full CRUD operations for contacts
- **Contact Profiles** - Detailed contact information with timeline view
- **Colored Tags** - Organize contacts with customizable colored tags
- **Private Notes** - Add private and shared notes to contacts
- **Interaction History** - Track calls, emails, meetings, and other interactions
- **Advanced Search** - Search by name, email, phone, or company
- **Smart Filters** - Filter by tags, status, and recently added
- **Role-Based Access Control** - Admin and User roles with permissions
- **Mobile Responsive** - Clean UI that works on all devices

## Tech Stack

**Backend:**
- Laravel 10
- Laravel Sanctum (Authentication)
- MySQL Database

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router DOM
- Axios

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL 5.7+ or MariaDB

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd "D:\CRM app"
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
# Edit .env and set:
# DB_DATABASE=crm_app
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Create the database (using MySQL CLI or phpMyAdmin)
# mysql -u root -p
# CREATE DATABASE crm_app;
# exit;

# Run migrations and seed sample data
php artisan migrate --seed

# Start the Laravel development server
php artisan serve
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Login Credentials

### Admin Account
- **Email:** admin@crm.com
- **Password:** password

### User Account
- **Email:** user@crm.com
- **Password:** password

## Features by Role

### Admin
- Create, edit, and delete contacts
- Create and manage colored tags
- View all notes (private and shared)
- Full access to all features

### User
- View contacts
- Add private and shared notes
- Create interactions
- Cannot manage tags
- Cannot delete contacts

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user

### Contacts
- `GET /api/contacts` - List all contacts (with search & filters)
- `GET /api/contacts/{id}` - Get single contact
- `POST /api/contacts` - Create contact (Admin only)
- `PUT /api/contacts/{id}` - Update contact (Admin only)
- `DELETE /api/contacts/{id}` - Delete contact (Admin only)
- `POST /api/contacts/{id}/tags` - Attach tag (Admin only)
- `DELETE /api/contacts/{id}/tags/{tagId}` - Detach tag (Admin only)

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag (Admin only)
- `PUT /api/tags/{id}` - Update tag (Admin only)
- `DELETE /api/tags/{id}` - Delete tag (Admin only)

### Notes
- `GET /api/contacts/{contactId}/notes` - Get contact notes
- `POST /api/contacts/{contactId}/notes` - Create note
- `PUT /api/contacts/{contactId}/notes/{id}` - Update note
- `DELETE /api/contacts/{contactId}/notes/{id}` - Delete note

### Interactions
- `GET /api/contacts/{contactId}/interactions` - Get contact interactions
- `POST /api/contacts/{contactId}/interactions` - Create interaction
- `PUT /api/contacts/{contactId}/interactions/{id}` - Update interaction
- `DELETE /api/contacts/{contactId}/interactions/{id}` - Delete interaction

## Project Structure

```
CRM app/
├── backend/                    # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API controllers
│   │   │   └── Middleware/    # Custom middleware
│   │   └── Models/            # Eloquent models
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/           # Database seeders
│   ├── routes/
│   │   └── api.php           # API routes
│   └── config/               # Configuration files
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Database Schema

### Users
- id, name, email, password, role (admin/user)

### Contacts
- id, first_name, last_name, email, phone, company, position
- address, city, state, zip_code, country, status

### Tags
- id, name, color, description

### Notes
- id, contact_id, user_id, content, is_private

### Interactions
- id, contact_id, user_id, type, subject, description
- interaction_date, duration_minutes

### Contact_Tag (Pivot)
- contact_id, tag_id

## Sample Data

The seeder creates:
- 2 users (1 admin, 1 regular user)
- 5 colored tags
- 8 sample contacts with various details
- Multiple notes and interactions for each contact

## Development

### Running Tests
```bash
cd backend
php artisan test
```

### Building for Production

**Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

## Troubleshooting

### CORS Issues
- Make sure `SANCTUM_STATEFUL_DOMAINS` in `.env` includes `localhost:5173`
- Check `config/cors.php` has correct allowed origins

### Database Connection
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
- Backend: Change port with `php artisan serve --port=8001`
- Frontend: Change port in `vite.config.js`

## License

This project is open-source and available for demonstration and adaptation purposes.

## Support

For issues or questions, please refer to the documentation or contact your development team.
