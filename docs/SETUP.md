# Quick Setup Guide

This guide will help you get the Fastbreak Event Dashboard running locally in minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- Git

## Step-by-Step Setup

### 1. Clone & Install

```bash
git clone https://github.com/4cecoder/sports.git
cd sports
npm install
```

### 2. Create Supabase Project

1. Go to [database.new](https://database.new)
2. Create a new project (note: it takes ~2 minutes to spin up)
3. Wait for the project to be ready

### 3. Get Your Credentials

**Supabase URL & Publishable Key:**
1. Go to Project Settings (⚙️ icon in sidebar)
2. Click "API"
3. Copy:
   - Project URL
   - `anon` `public` key (publishable key)

**Database URL:**
1. Go to Project Settings > Database
2. Scroll to "Connection string"
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:your-password@db.project.supabase.co:5432/postgres
```

### 5. Set Up Database

1. Open your Supabase Dashboard
2. Go to SQL Editor (left sidebar)
3. Click "New query"
4. Copy and paste the entire contents of `drizzle/0000_init.sql`
5. Click "Run" or press Cmd/Ctrl + Enter

You should see "Success. No rows returned" - that's perfect!

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Create Your First Account

1. Click "Sign Up"
2. Enter email and password (minimum 6 characters)
3. Check your email for confirmation link
4. Click the link to verify
5. You'll be redirected to the dashboard

## Troubleshooting

### "Invalid login credentials" when signing up

- Check your email for the confirmation link
- Supabase requires email confirmation by default
- You can disable this in Supabase Dashboard > Authentication > Providers > Email

### Can't connect to database

- Double-check your DATABASE_URL has the correct password
- Make sure you copied the full connection string
- Verify your Supabase project isn't paused

### TypeScript errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Database migration didn't work

- Make sure you copied the ENTIRE SQL file content
- Check the Supabase SQL Editor for error messages
- Try running each CREATE TABLE statement separately

## Optional: Google OAuth

### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
7. Copy Client ID and Client Secret

### Configure in Supabase

1. Go to Authentication > Providers
2. Find Google provider
3. Enable it
4. Paste Client ID and Secret
5. Save

### Add to .env.local

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Next Steps

- Create your first event
- Explore the search and filter features
- Check out the codebase in `lib/actions` to see type-safe server actions
- Read the main README.md for deployment instructions

## Need Help?

- Check the main [README.md](./README.md)
- Review Supabase docs: https://supabase.com/docs
- Open an issue on GitHub

Happy coding! 🚀
