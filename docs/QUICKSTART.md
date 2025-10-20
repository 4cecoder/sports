# Quick Start - You're Almost There! 🚀

Your Supabase credentials are already configured in `.env.local`!

## Next Steps (5 minutes)

### 1. Install Dependencies

```bash
cd /Users/fource/bytecats/sports
npm install
```

### 2. Set Up Database Tables

You need to run the SQL migration in Supabase:

1. Go to https://supabase.com/dashboard/project/eyoigxxdcbvncxfihxqd
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the ENTIRE contents of `drizzle/0000_init.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - that's perfect! ✅

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Go to http://localhost:3000

### 5. Create Your Account

1. Click "Sign Up"
2. Enter your email and a password (min 6 characters)
3. Check your email for the confirmation link
4. Click the link to verify
5. You'll be redirected to the dashboard

### 6. Create Your First Event

1. Click the "Create Event" button
2. Fill in:
   - Event Name: "Championship Game"
   - Sport Type: "Basketball"
   - Date & Time: Pick a future date
   - Description: "Season finals"
   - Venue 1 Name: "Madison Square Garden"
   - City: "New York"
3. Click "Add Venue" to add more venues if desired
4. Click "Create Event"

🎉 Your event is created!

## Test Features

Try these features:
- ✅ Search for events by name
- ✅ Filter by sport type
- ✅ Edit an event
- ✅ Delete an event
- ✅ Toggle dark/light mode
- ✅ Add multiple venues to one event

## Deploy to Vercel (Optional)

When you're ready to deploy:

```bash
# Commit your changes (but NOT .env.local)
git add .
git commit -m "Initial commit: Fastbreak Event Dashboard"
git push -u origin main

# Deploy to Vercel
npm i -g vercel
vercel
```

Then add these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

(They're already in your `.env.local` - just copy them over)

## Troubleshooting

### "npm install" fails
Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Can't sign up
- Make sure you ran the SQL migration
- Check your email for the confirmation link
- You can disable email confirmation in Supabase: Authentication > Providers > Email

### Database connection errors
- Verify the SQL migration ran successfully
- Check Supabase project isn't paused

## Documentation

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup guide
- **ARCHITECTURE.md** - How everything works
- **DEPLOYMENT.md** - Deploy to production

## Support

Need help? Check the docs or the main README.md

---

You're all set! Happy coding! 🎉
