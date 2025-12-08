# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`

## Deployment Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Create a new project or link existing
```bash
cd backend
railway init
# or if you have an existing project:
# railway link
```

### 4. Set Environment Variables
In Railway dashboard, add these variables:
- `APP_KEY` - Run `php artisan key:generate --show` locally to get a key
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` - Your Railway app URL (e.g., https://your-app.up.railway.app)
- `DB_CONNECTION=mysql`
- `DB_HOST` - Your Railway MySQL host
- `DB_PORT` - Your Railway MySQL port
- `DB_DATABASE` - Your database name
- `DB_USERNAME` - Your database username
- `DB_PASSWORD` - Your database password
- `SANCTUM_STATEFUL_DOMAINS` - Your frontend domain (e.g., your-app.vercel.app)
- `SESSION_DOMAIN` - .railway.app
- `SPA_URL` - Your frontend URL (e.g., https://your-app.vercel.app)

### 5. Deploy
```bash
railway up
```

### 6. Run Migrations
```bash
railway run php artisan migrate --force
```

### 7. Get Your Deployment URL
```bash
railway domain
```

## Important Notes
- The `railway.json` file configures automatic migrations on deploy
- The `nixpacks.toml` optimizes the build for PHP 8.1
- The app will automatically restart on failure (up to 10 retries)
- Logs are available via `railway logs` or the Railway dashboard

## Frontend Configuration
After deployment, update your frontend's API base URL to point to your Railway URL:
- In `frontend/src/config/api.js` or similar
- Update `VITE_API_URL` to `https://your-app.up.railway.app`

## Troubleshooting
- Check logs: `railway logs`
- Restart service: `railway restart`
- SSH into container: `railway shell`
