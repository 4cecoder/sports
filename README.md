# Fastbreak Event Dashboard

A full-stack Sports Event Management application built with Next.js 15, Supabase, Drizzle ORM, and Shadcn UI. Create, view, and manage sports events with comprehensive venue information.

## Features

- **Authentication** - Email/password and Google OAuth with Supabase Auth
- **Event Management** - Full CRUD operations for sports events
- **Multi-Venue Support** - Add multiple venues per event
- **Search & Filter** - Real-time search and sport type filtering
- **Type-Safe Actions** - Server actions with Zod validation and consistent error handling
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Toast Notifications** - User feedback with Sonner
- **Protected Routes** - Automatic authentication redirects
- **Database Migrations** - Drizzle ORM with SQL migrations
- **Git Hooks** - Husky pre-commit linting

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Form Validation**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account
- (Optional) Google OAuth credentials for social login

### 1. Clone the Repository

```bash
git clone https://github.com/4cecoder/sports.git
cd sports
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [database.new](https://database.new)
2. Go to Project Settings > API to find your credentials
3. Go to Project Settings > Database > Connection String to get your DATABASE_URL

### 4. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Database URL for Drizzle ORM
DATABASE_URL=your-supabase-database-url

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. Run Database Migrations

Execute the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase Dashboard > SQL Editor
2. Copy the contents of `drizzle/0000_init.sql`
3. Paste and run the SQL

This will create:
- `events` table for storing sports events
- `venues` table for event locations
- Proper indexes for performance
- Row Level Security (RLS) policies

### 6. (Optional) Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)
6. Add credentials to Supabase:
   - Go to Authentication > Providers > Google
   - Enable and add Client ID and Secret

### 7. Initialize Husky

```bash
npm run prepare
```

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sports/
├── app/                      # Next.js App Router
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main dashboard
│   └── layout.tsx            # Root layout with providers
├── components/               # React components
│   ├── events/               # Event-specific components
│   │   ├── event-card.tsx
│   │   ├── event-form-dialog.tsx
│   │   └── delete-event-dialog.tsx
│   └── ui/                   # Shadcn UI components
├── lib/                      # Utilities and configurations
│   ├── actions/              # Server actions
│   │   ├── action-helpers.ts # Type-safe action utilities
│   │   └── event-actions.ts  # Event CRUD operations
│   ├── db/                   # Database configuration
│   │   ├── index.ts          # Drizzle instance
│   │   └── schema.ts         # Database schema
│   └── supabase/             # Supabase clients
├── drizzle/                  # Database migrations
└── .husky/                   # Git hooks
```

## Key Features Explained

### Type-Safe Server Actions

All server actions use a generic helper that provides:
- Automatic Zod validation
- Consistent error handling
- Type safety end-to-end

```typescript
// Example usage
const result = await createEvent({
  name: "Championship Game",
  sportType: "Basketball",
  // ...
});

if (result.success) {
  // result.data is type-safe
} else {
  // result.error contains the error message
}
```

### Database Schema

**Events Table:**
- `id` - UUID primary key
- `name` - Event name
- `sport_type` - Type of sport
- `date` - Event date and time
- `description` - Optional description
- `user_id` - Owner (references auth.users)
- Timestamps for created/updated

**Venues Table:**
- `id` - UUID primary key
- `event_id` - Foreign key to events (cascade delete)
- `name` - Venue name
- `address`, `city`, `state`, `country` - Location details

### Row Level Security

The database uses RLS policies to ensure:
- Users can only view/edit/delete their own events
- Venues are only accessible through their parent events
- All operations are automatically scoped to the authenticated user

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio

npm run prepare      # Install Husky git hooks
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js
4. Add environment variables in Vercel project settings
5. Deploy

### Environment Variables on Vercel

Add these in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
NEXT_PUBLIC_GOOGLE_CLIENT_ID (optional)
GOOGLE_CLIENT_SECRET (optional)
```

### Post-Deployment

1. Update Google OAuth redirect URIs with your Vercel domain
2. Update Supabase redirect URIs in Authentication settings

## Development Notes

### Actions vs API Routes

This project uses Server Actions exclusively for data mutations, following Next.js best practices:
- ✅ Type-safe with TypeScript
- ✅ Automatic revalidation
- ✅ Better DX with co-location
- ✅ Simplified error handling

### Form Validation

All forms use:
- React Hook Form for form state management
- Zod for runtime validation
- Shadcn Form component for consistent UI

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Session is stored in cookies (works across entire app)
3. Middleware protects routes automatically
4. Server Actions verify authentication before mutations

## Troubleshooting

### "Unauthorized" errors

- Check that your `.env.local` file has correct Supabase credentials
- Ensure you're logged in (check Network tab for auth cookies)
- Verify RLS policies are created in Supabase

### Database connection errors

- Verify DATABASE_URL is correct (should include password)
- Check Supabase project is not paused
- Ensure IP restrictions allow your connection

### Build errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Contributing

This project was built as a coding challenge. Feel free to fork and extend!

## License

MIT

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vercel](https://vercel.com/)

---

Built with ❤️ for Fastbreak Sports Event Management Challenge
