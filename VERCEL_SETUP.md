# Vercel Environment Variables Setup Guide

Your app is missing required environment variables in Vercel. Follow these steps to fix the Supabase client error.

## Quick Fix (Using Vercel Dashboard)

1. **Go to your Vercel project:**
   - Visit https://vercel.com/dashboard
   - Select your `sports` project

2. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add the following variables for **Production**, **Preview**, and **Development**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://eyoigxxdcbvncxfihxqd.supabase.co
   ```

   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b2lneHhkY2J2bmN4ZmloeHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODEzMTQsImV4cCI6MjA3NjI1NzMxNH0.RkQJESLNDOSjbwlksI8P-odntPEf-i9O46p2F1f10-4
   ```

   ```
   DATABASE_URL=<your-database-connection-string>
   ```

   **Important for DATABASE_URL:**
   - Use Supabase Connection Pooler for best results
   - Go to Supabase Dashboard → Project Settings → Database → Connection string
   - Select "Connection pooling" mode (Session mode)
   - Use port 6543
   - Example format: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

3. **Redeploy:**
   - Go to **Deployments** tab
   - Click the three dots (**...**) on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger automatic deployment

## Alternative: Using Vercel CLI

### 1. Login to Vercel

```bash
vercel login
```

### 2. Link Your Project

```bash
cd /home/ubuntu/sports
vercel link
```

### 3. Add Environment Variables

```bash
# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# When prompted, enter: https://eyoigxxdcbvncxfihxqd.supabase.co
# Select: Production, Preview, Development

# Add Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# When prompted, enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5b2lneHhkY2J2bmN4ZmloeHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODEzMTQsImV4cCI6MjA3NjI1NzMxNH0.RkQJESLNDOSjbwlksI8P-odntPEf-i9O46p2F1f10-4
# Select: Production, Preview, Development

# Add Database URL
vercel env add DATABASE_URL
# When prompted, enter your Supabase database connection string
# Select: Production, Preview, Development
```

### 4. Pull Environment Variables Locally (Optional)

```bash
vercel env pull .env.local
```

### 5. Redeploy

```bash
vercel --prod
```

## Verifying the Setup

1. After adding environment variables, check the deployment logs
2. Visit your deployed app
3. Try to sign in or access the dashboard
4. The Supabase client error should be resolved

## Common Issues

### Issue: Still getting "API key required" error

**Solution:**
- Make sure you added the variables to ALL environments (Production, Preview, Development)
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Redeploy after adding variables

### Issue: Environment variables not showing up

**Solution:**
- Wait a few seconds after adding variables
- Force a redeploy
- Check that you're viewing the correct project in Vercel dashboard

### Issue: DATABASE_URL connection errors

**Solution:**
- Use the connection pooler URL (port 6543) instead of direct connection
- See `TROUBLESHOOTING.md` for detailed database connection help

## Environment Variables Reference

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

## Next Steps

After setting up environment variables:
1. ✅ Test authentication (login/signup)
2. ✅ Test dashboard access
3. ✅ Test event creation
4. ✅ Test ESPN event import from Discover page

---

**Need help?** Check `TROUBLESHOOTING.md` for more detailed troubleshooting steps.
