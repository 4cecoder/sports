# Architecture Overview

## System Design

The Fastbreak Event Dashboard follows a modern, type-safe architecture using Next.js 15 App Router with Supabase and Drizzle ORM.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Dashboard UI │  │  Event Forms │  │  Auth Pages  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Server Actions / SSR
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Next.js Server (Edge)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Components                       │   │
│  │  • Dashboard Page (SSR with data)                    │   │
│  │  • Authentication Middleware                         │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Actions                          │   │
│  │  • createEvent (with auth & validation)              │   │
│  │  • updateEvent (with ownership check)                │   │
│  │  • deleteEvent (with ownership check)                │   │
│  │  • getEvents (with filtering)                        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Drizzle ORM Queries
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 Supabase (PostgreSQL)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  • events (id, name, sport_type, date, user_id...)  │   │
│  │  • venues (id, event_id, name, address...)          │   │
│  │                                                      │   │
│  │  RLS Policies:                                       │   │
│  │  • Users see only their own events                  │   │
│  │  • Cascade delete on event removal                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Supabase Auth                           │   │
│  │  • Email/Password                                    │   │
│  │  • Google OAuth                                      │   │
│  │  • Session Management (Cookies)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating an Event

```
User fills form
    ↓
Client validates (Zod)
    ↓
Calls createEvent() server action
    ↓
Server validates input (Zod)
    ↓
Server checks authentication (Supabase)
    ↓
Drizzle ORM inserts to database
    ↓
RLS policies verify user_id
    ↓
Database commits transaction
    ↓
Server returns success/error
    ↓
Client shows toast notification
    ↓
Client revalidates and refreshes
```

### Reading Events

```
User navigates to dashboard
    ↓
Server Component renders
    ↓
Calls getEvents() with filters
    ↓
Server checks authentication
    ↓
Drizzle queries with WHERE userId = auth.uid()
    ↓
RLS policies filter results
    ↓
Returns events with venues (joined)
    ↓
Server Component renders HTML
    ↓
Client hydrates interactive elements
```

## Key Design Decisions

### 1. Server Actions over API Routes

**Why**:
- Type safety from client to server
- Automatic serialization
- Co-located with components
- Simplified error handling

**Implementation**:
```typescript
// Generic helper for consistency
export function createAuthenticatedAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (input: TInput, userId: string) => Promise<TOutput>
)
```

### 2. Drizzle ORM over Prisma

**Why**:
- Lightweight and fast
- SQL-like syntax
- Better TypeScript inference
- Direct PostgreSQL access
- Works great with Supabase

**Example**:
```typescript
const events = await db.query.events.findMany({
  where: and(
    eq(events.userId, user.id),
    ilike(events.name, `%${search}%`)
  ),
  with: { venues: true },
});
```

### 3. Row Level Security (RLS)

**Why**:
- Defense in depth
- Database-level security
- Prevents data leaks
- Works with any client

**Policies**:
```sql
CREATE POLICY "Users can view their own events" ON "events"
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. React Hook Form + Zod

**Why**:
- Type-safe validation
- Great DX
- Minimal re-renders
- Works with Shadcn forms

**Pattern**:
```typescript
const schema = z.object({
  name: z.string().min(1),
});

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
});
```

## Component Architecture

### Server Components (Default)

**Location**: `app/dashboard/page.tsx`

**Purpose**:
- Fetch data server-side
- SEO-friendly
- Reduce client bundle
- Direct database access

**Example**:
```typescript
export default async function DashboardPage() {
  const events = await getEvents(); // Server-side
  return <DashboardClient initialEvents={events} />;
}
```

### Client Components

**Location**: `app/dashboard/dashboard-client.tsx`

**Purpose**:
- Interactive features
- State management
- Event handlers
- Transitions

**Example**:
```typescript
'use client';

export function DashboardClient({ initialEvents }) {
  const [search, setSearch] = useState('');
  // Interactive logic
}
```

## Database Schema Design

### Events Table

```typescript
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**Indexes**:
- `user_id` - Fast user event lookups
- `sport_type` - Fast filtering
- `date` - Sorting and date ranges

### Venues Table

```typescript
export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, {
    onDelete: 'cascade'
  }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Relations**:
- One event has many venues
- Cascade delete when event removed
- Enforced at database level

## Authentication Flow

### Sign Up

```
1. User submits email/password
2. Supabase creates user in auth.users
3. Sends confirmation email
4. User clicks link
5. Session created
6. Cookie stored
7. Redirected to dashboard
```

### Sign In

```
1. User submits credentials
2. Supabase validates
3. Creates session
4. Sets httpOnly cookie
5. Middleware validates on each request
6. User can access protected routes
```

### Session Management

- Cookies stored httpOnly (secure)
- Middleware checks on every request
- Auto-refresh before expiry
- Logout clears session

## Security Layers

### Layer 1: Client Validation
- Zod schemas in forms
- Immediate user feedback
- Not trusted for security

### Layer 2: Server Action Validation
- Zod schemas in actions
- Prevents malformed requests
- Type-safe

### Layer 3: Authentication Check
- Supabase Auth verification
- Rejects unauthenticated requests
- User ID extracted

### Layer 4: Row Level Security
- Database-level policies
- Filters by auth.uid()
- Defense in depth

### Layer 5: Ownership Verification
- Server actions check userId
- Prevents horizontal privilege escalation
- Explicit checks before mutations

## Performance Optimizations

### Database
- Proper indexes on filtered columns
- Use `with` for eager loading relations
- Avoid N+1 queries with joins
- Connection pooling via Supabase

### Frontend
- Server Components by default
- Code splitting automatic
- Image optimization with next/image
- Minimal client JavaScript

### Caching
- Next.js automatic caching
- `revalidatePath` after mutations
- Supabase query caching

## Deployment Architecture

```
GitHub Repository
    ↓
Vercel (Edge Network)
    ↓
Next.js Server (Serverless Functions)
    ↓
Supabase (Managed PostgreSQL)
```

**Benefits**:
- Global CDN (Vercel Edge)
- Auto-scaling
- Zero-config deployments
- Built-in preview environments

## Error Handling

### Client-Side
```typescript
if (!result.success) {
  toast.error(result.error);
  return;
}
```

### Server-Side
```typescript
try {
  // Operation
  return { success: true, data };
} catch (error) {
  console.error('Error:', error);
  return { success: false, error: error.message };
}
```

## Testing Strategy

### Manual Testing
- Create/Read/Update/Delete events
- Search and filter
- Authentication flows
- RLS verification

### Edge Cases
- Empty states
- Long text inputs
- Multiple venues
- Concurrent updates
- Network errors

## Monitoring & Logging

- Server-side console.error for debugging
- Supabase dashboard for query monitoring
- Vercel analytics for performance
- Error boundaries for client errors

---

This architecture provides a solid foundation for building scalable, secure, and maintainable sports event management features.
