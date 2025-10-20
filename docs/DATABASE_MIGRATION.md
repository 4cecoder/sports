# Database Migration Required

## Issue
The dashboard is showing an error because the database schema needs to be updated with new columns for ESPN event integration.

## Solution
Run the manual migration to add the required columns to your Supabase database.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the contents of `drizzle/manual-migration.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

4. **Verify Success**
   - You should see a success message
   - The query will return 3 rows showing the new columns:
     - `external_source` (varchar)
     - `external_id` (varchar)
     - `last_synced_at` (timestamp with time zone)

5. **Restart your dev server**
   ```bash
   # Stop the server (Ctrl+C) and restart
   bun run dev
   ```

## What These Columns Do

- **external_source**: Tracks where the event came from (e.g., 'ESPN')
- **external_id**: Stores the original event ID from the external source
- **last_synced_at**: Records when the event was last synced from the external API

These columns enable:
- Importing official sports events from ESPN
- Tracking which events are external vs user-created
- Displaying "ESPN" badges on imported events
- Future sync capabilities

## Alternative: Drizzle Push (if DATABASE_URL is set)

If you have `DATABASE_URL` configured in your `.env.local`:

```bash
bun run db:push
```

This will automatically apply all schema changes.
