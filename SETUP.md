# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ PHP 8.1+ installed (`php -v`)
- ✅ Composer installed (`composer -V`)
- ✅ Node.js 16+ installed (`node -v`)
- ✅ MySQL running

## Quick Start (5 minutes)

### Step 1: Backend Setup
```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

### Step 2: Configure Database
Edit `backend/.env`:
```env
DB_DATABASE=crm_app
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create database:
```bash
# MySQL CLI
mysql -u root -p
CREATE DATABASE crm_app;
exit;
```

### Step 3: Run Migrations
```bash
php artisan migrate --seed
```

### Step 4: Start Backend
```bash
php artisan serve
```
Backend runs at: http://localhost:8000

### Step 5: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## Login Credentials

**Admin:**
- Email: admin@crm.com
- Password: password

**User:**
- Email: user@crm.com
- Password: password

## Verify Installation

1. Open http://localhost:5173
2. Login with admin credentials
3. You should see 8 sample contacts

## Common Issues

### "Access denied for user"
- Check MySQL credentials in `.env`
- Ensure MySQL is running

### "CORS error"
- Verify backend is running on port 8000
- Verify frontend is running on port 5173

### Port already in use
Backend:
```bash
php artisan serve --port=8001
```

Frontend (edit `vite.config.js`):
```js
server: { port: 5174 }
```

## Next Steps

- Explore contact management features
- Try adding tags (admin only)
- Create notes and interactions
- Test search and filter functionality

## Need Help?

Refer to the main README.md for detailed documentation.
