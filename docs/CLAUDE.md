# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fastbreak Event Dashboard - A full-stack Sports Event Management application built with Next.js 15, Supabase, Drizzle ORM, and Shadcn UI. Users can create, view, edit, and delete sports events with multi-venue support, search/filter capabilities, and authentication.

## Tech Stack

- **Framework**: Next.js 15 (App Router with React Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **Authentication**: Supabase Auth (email/password + optional Google OAuth)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Form Handling**: React Hook Form + Zod validation
- **Deployment**: Vercel

## Development Commands

### Local Development
```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build (run this before committing major changes)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Management (Drizzle ORM)
```bash
npm run db:generate  # Generate migrations from schema.ts changes
npm run db:push      # Push schema directly to database (dev only)
npm run db:studio    # Open Drizzle Studio GUI (database browser)
npm run db:migrate   # Run migrations
```

### Testing Changes
```bash
# Always test locally before committing
npm run dev          # Start dev server
npm run build        # Test production build
npm run lint         # Check for linting errors
```

### Git Hooks
```bash
npm run prepare      # Install Husky git hooks (runs automatically on npm install)
# Pre-commit hook automatically runs linting
```

## Architecture Principles

### Server-First Architecture

This application uses **Server Actions exclusively** - there are NO traditional API routes. All data mutations go through type-safe server actions in `lib/actions/`.

**Key Pattern: Type-Safe Server Actions**
```typescript
// All server actions use generic helpers from lib/actions/action-helpers.ts:

// For authenticated operations (CRUD on events)
export const createEvent = createAuthenticatedAction(
  CreateEventSchema,  // Zod schema for validation
  async (input, userId) => {
    // userId is automatically provided and verified
    // input is automatically validated
  }
);

// For unauthenticated operations
export const somePublicAction = createAction(
  SomeSchema,
  async (input) => {
    // No authentication required
  }
);
```

All actions return consistent result types:
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

### Component Architecture

**Server Components (Default)**
- Located in `app/` directory
- Fetch data directly using server actions
- No client-side JavaScript needed
- Example: `app/dashboard/page.tsx` fetches events server-side

**Client Components (`'use client'`)**
- Used ONLY for interactivity (forms, search, filters, modals)
- Receive initial data from Server Components as props
- Example: `app/dashboard/dashboard-client.tsx` handles UI interactions

**Key Pattern:**
```typescript
// Server Component fetches data
export default async function DashboardPage() {
  const eventsResult = await getEvents();
  return <DashboardClient initialEvents={eventsResult.data} />;
}

// Client Component handles interactions
'use client';
export function DashboardClient({ initialEvents }) {
  const [search, setSearch] = useState('');
  // Interactive logic here
}
```

### Database Architecture

**Schema Location**: `lib/db/schema.ts`

**Tables:**
1. **events** - Main events table
   - `id`, `name`, `sportType`, `date`, `description`
   - `userId` (references auth.users)
   - `externalSource`, `externalId`, `lastSyncedAt` (for API integrations)
   - Indexed on: `user_id`, `sport_type`, `date`

2. **venues** - Event venues (one-to-many with events)
   - `id`, `eventId` (FK with cascade delete)
   - `name`, `address`, `city`, `state`, `country`

**Drizzle Relations:**
```typescript
// Defined in schema.ts - use with .with() for joins
const events = await db.query.events.findMany({
  with: { venues: true }  // Eager load venues
});
```

**Row Level Security (RLS):**
- Database policies ensure users only see/modify their own events
- Always enforced at database level (defense in depth)
- Server actions also verify userId for explicit ownership checks

### Authentication Flow

1. **Middleware** (`middleware.ts`) - Runs on every request to refresh Supabase session
2. **Server Actions** - Use `createAuthenticatedAction` to verify user
3. **Supabase Client Types**:
   - `lib/supabase/client.ts` - Client-side (browser)
   - `lib/supabase/server.ts` - Server-side (Server Components, Actions)
   - `lib/supabase/middleware.ts` - Middleware

## File Structure Guide

```
app/
├── auth/                    # Supabase auth pages (sign-up, login, etc.)
├── dashboard/              # Main dashboard
│   ├── page.tsx           # Server Component (fetches data)
│   └── dashboard-client.tsx # Client Component (interactive UI)
├── discover/               # External sports events discovery
└── layout.tsx             # Root layout (providers, theme)

components/
├── events/                 # Event-specific components
│   ├── event-card.tsx     # Display single event
│   ├── event-form-dialog.tsx # Create/edit event form
│   └── delete-event-dialog.tsx # Delete confirmation
└── ui/                     # Shadcn UI components (don't modify manually)

lib/
├── actions/               # Server Actions (ALL data mutations)
│   ├── action-helpers.ts # Generic helpers (createAction, createAuthenticatedAction)
│   ├── event-actions.ts  # Event CRUD operations
│   └── external-events.ts # External API integrations
├── db/
│   ├── index.ts          # Drizzle client instance
│   └── schema.ts         # Database schema + types
└── supabase/             # Supabase client utilities

drizzle/
└── 0000_init.sql         # Initial database migration (run in Supabase SQL Editor)
```

## Common Development Patterns

### Creating New Server Actions

1. Define Zod schema for input validation
2. Use `createAuthenticatedAction` helper
3. Add error handling
4. Call `revalidatePath()` after mutations

```typescript
// lib/actions/event-actions.ts
import { createAuthenticatedAction } from './action-helpers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const UpdateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // ... other fields
});

export const updateEvent = createAuthenticatedAction(
  UpdateEventSchema,
  async (input, userId) => {
    // Check ownership
    const existing = await db.query.events.findFirst({
      where: and(eq(events.id, input.id), eq(events.userId, userId))
    });

    if (!existing) {
      throw new Error('Event not found or unauthorized');
    }

    // Update
    await db.update(events)
      .set(input)
      .where(eq(events.id, input.id));

    // Revalidate to refresh UI
    revalidatePath('/dashboard');

    return { id: input.id };
  }
);
```

### Adding New Database Fields

1. Update `lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration via Supabase SQL Editor or `npm run db:push`
4. Update TypeScript types automatically inferred from schema

### Working with Forms

All forms use React Hook Form + Zod + Shadcn Form components:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '' }
});

async function onSubmit(data) {
  const result = await createEvent(data);
  if (result.success) {
    toast.success('Event created');
  } else {
    toast.error(result.error);
  }
}
```

## Environment Setup

Required environment variables (see `.env.example`):

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

**Important**: For database connection issues (IPv6 EHOSTUNREACH errors), use Supabase connection pooler or add `?sslmode=require` to DATABASE_URL. See `TROUBLESHOOTING.md` for details.

## Deployment

### Vercel Deployment
1. Push to GitHub
2. Import to Vercel (auto-detects Next.js)
3. Add environment variables in Vercel dashboard
4. Deploy

**Post-deployment:**
- Update Google OAuth redirect URIs with production URL
- Update Supabase authentication redirect URLs
- Run database migrations in Supabase SQL Editor if not already done

### Vercel Environment Variables Helper
Run `./setup-vercel-env.sh` to automatically set environment variables (requires Vercel CLI).

## Database Migrations

**Initial Setup:**
1. Copy contents of `drizzle/0000_init.sql`
2. Run in Supabase Dashboard > SQL Editor
3. Creates tables, indexes, and RLS policies

**Schema Changes:**
1. Modify `lib/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Review generated SQL in `drizzle/` directory
4. Run in Supabase SQL Editor or use `npm run db:push` (dev only)

## Important Gotchas

### Authentication
- Always use `createClient()` from `lib/supabase/server.ts` in Server Components/Actions
- Never import Supabase client directly in client components for authenticated operations
- Session is managed via cookies (automatic)

### Database Queries
- Use Drizzle's relational query API: `db.query.events.findMany({ with: { venues: true } })`
- Don't mix Drizzle's query builder with relational API in same query
- Always filter by `userId` in authenticated queries (even with RLS)

### Form Validation
- Validate on both client (React Hook Form) and server (Zod in actions)
- Server validation is the source of truth

### Revalidation
- Call `revalidatePath('/dashboard')` after any mutation to refresh Server Component data
- Required for Server Component caching to update

### Type Safety
- Types are inferred from Drizzle schema: `type Event = typeof events.$inferSelect`
- Don't manually define types that duplicate schema
- Use `z.infer<typeof schema>` for Zod types

## External API Integration

The app includes a "Discover" feature that fetches events from external sports APIs (ESPN, TheSportsDB). Events can be imported into user's dashboard.

**Implementation**: `lib/actions/external-events.ts`

When adding new API integrations:
1. Add fields to events table: `externalSource`, `externalId`, `lastSyncedAt`
2. Deduplicate using `externalSource` + `externalId`
3. Store raw API data if needed for future sync

## Documentation Files

- `README.md` - Complete project documentation
- `ARCHITECTURE.md` - Detailed system design and data flow
- `SETUP.md` - Quick setup guide (5-10 minutes)
- `DEPLOYMENT.md` - Deployment checklist
- `TROUBLESHOOTING.md` - Common issues (especially database connections)
- `CONTRIBUTING.md` - Code standards and patterns
- `PROJECT_SUMMARY.md` - High-level overview
