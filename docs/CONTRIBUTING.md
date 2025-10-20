# Contributing to Fastbreak Event Dashboard

Thank you for your interest in contributing! This document provides guidelines and best practices for this project.

## Code Style & Standards

### TypeScript

- **Strict Mode**: All files use TypeScript strict mode
- **Type Safety**: Avoid `any` types - use proper types or `unknown`
- **Explicit Returns**: Always type function return values
- **Const Assertions**: Use `as const` for literal types where appropriate

### Server Actions

All server actions MUST follow this pattern:

```typescript
import { createAuthenticatedAction } from '@/lib/actions/action-helpers';
import { z } from 'zod';

const MyActionSchema = z.object({
  // ... schema definition
});

export const myAction = createAuthenticatedAction(
  MyActionSchema,
  async (input, userId) => {
    // Implementation
    return result;
  }
);
```

**Benefits:**
- Automatic input validation
- Consistent error handling
- Type safety from client to server
- Built-in authentication checks

### Database Queries

- **Use Drizzle ORM**: No raw SQL in application code
- **Type Safety**: Leverage Drizzle's type inference
- **Transactions**: Use transactions for multi-step operations
- **RLS First**: Rely on Row Level Security for authorization

Example:
```typescript
const events = await db.query.events.findMany({
  where: eq(events.userId, userId),
  with: {
    venues: true,
  },
});
```

### React Components

#### Client Components

```typescript
'use client';

import { useState } from 'react';

interface MyComponentProps {
  // Props here
}

export function MyComponent({ }: MyComponentProps) {
  // Implementation
}
```

#### Server Components

```typescript
// No 'use client' directive

import { getServerData } from './actions';

export default async function MyServerComponent() {
  const data = await getServerData();
  return <div>{/* ... */}</div>;
}
```

### Forms

Always use:
1. `react-hook-form` for form state
2. `zod` for validation
3. Shadcn `Form` components for UI
4. Server actions for submission

Example:
```typescript
const formSchema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
});

const onSubmit = async (values: FormValues) => {
  const result = await myServerAction(values);
  if (result.success) {
    toast.success('Success!');
  } else {
    toast.error(result.error);
  }
};
```

## Project Structure

```
app/
  ├── (auth)/           # Auth-related pages
  ├── dashboard/        # Protected dashboard pages
  └── layout.tsx        # Root layout

components/
  ├── events/           # Feature-specific components
  └── ui/               # Reusable UI components (Shadcn)

lib/
  ├── actions/          # Server actions only
  ├── db/               # Database schema and config
  ├── supabase/         # Supabase client utilities
  └── utils.ts          # Shared utilities
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Server Actions**: `camelCase` (e.g., `createEvent`)
- **Database Tables**: `snake_case`

## Git Workflow

### Commits

Follow conventional commits:

```
feat: add venue search functionality
fix: correct date formatting in event cards
docs: update README with deployment steps
style: format code with prettier
refactor: extract venue form into separate component
test: add tests for event creation
chore: update dependencies
```

### Branches

- `main` - Production-ready code
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/topic` - Documentation updates

### Pull Requests

1. Create a feature branch
2. Make your changes
3. Ensure lint passes: `npm run lint`
4. Update documentation if needed
5. Create PR with clear description
6. Reference any related issues

## Database Migrations

### Creating Migrations

1. Update `lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `drizzle/`
4. Test locally
5. Add RLS policies if needed
6. Update documentation

### Migration Guidelines

- **Never** modify existing migrations
- **Always** add RLS policies for new tables
- **Test** migrations on a dev database first
- **Document** breaking changes

## Testing Guidelines

### Manual Testing Checklist

Before submitting PR:
- [ ] Create event with single venue
- [ ] Create event with multiple venues
- [ ] Edit event
- [ ] Delete event
- [ ] Search functionality works
- [ ] Filter by sport type works
- [ ] Toast notifications appear
- [ ] Authentication flow works
- [ ] RLS prevents access to other users' events

### Edge Cases to Test

- Empty states (no events)
- Long event names/descriptions
- Special characters in inputs
- Multiple venues (2, 5, 10+)
- Past and future event dates
- Different timezones

## Performance

### Best Practices

- Use Server Components by default
- Add `'use client'` only when needed
- Implement proper loading states
- Use `revalidatePath` after mutations
- Optimize images with Next.js Image
- Lazy load heavy components

### Database Performance

- Create indexes for filtered columns
- Use `with` for loading relations
- Avoid N+1 queries
- Limit query results appropriately

## Security

### Critical Rules

- ✅ **DO** use server actions for all mutations
- ✅ **DO** validate all inputs with Zod
- ✅ **DO** rely on RLS for data access control
- ✅ **DO** sanitize user inputs
- ❌ **DON'T** expose sensitive data in client components
- ❌ **DON'T** trust client-side validation alone
- ❌ **DON'T** use raw SQL with user inputs

### Authentication

- All mutations must verify `auth.uid()`
- Use `createAuthenticatedAction` helper
- Check ownership before updates/deletes
- Redirect unauthenticated users

## Adding New Features

### Checklist

1. **Plan**
   - [ ] Define requirements
   - [ ] Design database schema changes
   - [ ] Plan component structure

2. **Database**
   - [ ] Update Drizzle schema
   - [ ] Add RLS policies
   - [ ] Create indexes
   - [ ] Generate migration

3. **Backend**
   - [ ] Create Zod validation schemas
   - [ ] Implement server actions
   - [ ] Add error handling
   - [ ] Test with different inputs

4. **Frontend**
   - [ ] Create UI components
   - [ ] Implement forms
   - [ ] Add loading states
   - [ ] Add error handling
   - [ ] Add success feedback

5. **Documentation**
   - [ ] Update README if needed
   - [ ] Add code comments
   - [ ] Update SETUP.md if applicable

## Getting Help

- Review existing code for patterns
- Check Shadcn/ui docs for components
- Read Drizzle ORM docs for queries
- Ask questions in GitHub issues

## Code Review

### What Reviewers Look For

- TypeScript strict compliance
- Proper error handling
- Security best practices
- Performance considerations
- Code clarity and comments
- Consistent style

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Fastbreak Event Dashboard! 🏀⚽🎾
