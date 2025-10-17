# Sports API Integration Guide

## Overview
This document outlines how to integrate real sports event data from various APIs into the Fastbreak Event Dashboard, allowing users to discover and import official sporting events.

---

## Available Sports APIs

### 1. ESPN API (Unofficial/Hidden)
ESPN doesn't have an official public API, but there are several undocumented endpoints:

**Base URL:** `https://site.api.espn.com/apis/site/v2/sports/`

**Available Endpoints:**
```
# Football (NFL)
GET /football/nfl/scoreboard
GET /football/nfl/teams
GET /football/nfl/schedule

# Basketball (NBA)
GET /basketball/nba/scoreboard
GET /basketball/nba/teams
GET /basketball/nba/schedule

# Soccer
GET /soccer/eng.1/scoreboard  (Premier League)
GET /soccer/usa.1/scoreboard  (MLS)

# Baseball (MLB)
GET /baseball/mlb/scoreboard

# Hockey (NHL)
GET /hockey/nhl/scoreboard
```

**Example Request:**
```typescript
const response = await fetch(
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'
);
const data = await response.json();
```

**Response Structure:**
```json
{
  "leagues": [...],
  "events": [
    {
      "id": "401584876",
      "name": "Los Angeles Lakers at Boston Celtics",
      "shortName": "LAL @ BOS",
      "date": "2024-01-20T00:00Z",
      "competitions": [{
        "venue": {
          "fullName": "TD Garden",
          "address": {
            "city": "Boston",
            "state": "MA"
          }
        }
      }]
    }
  ]
}
```

**Limitations:**
- No official rate limits published
- No authentication required (for now)
- May change without notice
- Consider caching responses

---

### 2. The Sports DB (Free Tier Available)
**Website:** https://www.thesportsdb.com/api.php

**Features:**
- 100 free API calls per day
- Extensive sports coverage
- Team information, players, events
- Venue details

**Example:**
```typescript
const API_KEY = process.env.SPORTS_DB_API_KEY;
const response = await fetch(
  `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnextleague.php?id=4328`
);
```

**Pricing:**
- Free: 100 calls/day
- Patron: $3/month - 500 calls/day
- Plus: $10/month - Unlimited

---

### 3. API-Football (RapidAPI)
**Website:** https://www.api-football.com/

**Features:**
- Comprehensive football/soccer data
- Live scores, fixtures, standings
- 100 requests/day on free tier

**Example:**
```typescript
const response = await fetch('https://api-football-v1.p.rapidapi.com/v3/fixtures', {
  headers: {
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
});
```

---

### 4. API-Sports Suite
**Website:** https://api-sports.io/

**Available APIs:**
- API-Football (soccer)
- API-Basketball
- API-Baseball
- API-Hockey
- API-Handball
- API-Rugby

**Pricing:** 100 requests/day free, paid plans from $10/month

---

### 5. SportsData.io
**Website:** https://sportsdata.io/

**Features:**
- NFL, NBA, MLB, NHL, Soccer, Golf, NASCAR
- Trial: 1000 calls total (one-time)
- Professional data quality

**Pricing:** Plans start at $19/month

---

## Implementation Plan

### Phase 1: ESPN Integration (Quick Win)
Since ESPN's undocumented API is free and requires no authentication:

**Create Server Action:**
```typescript
// lib/actions/external-events.ts
'use server';

interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: Array<{
    venue: {
      fullName: string;
      address: {
        city: string;
        state: string;
      };
    };
  }>;
}

export async function fetchESPNEvents(sport: 'nba' | 'nfl' | 'mlb' | 'nhl') {
  const sportPaths = {
    nba: 'basketball/nba',
    nfl: 'football/nfl',
    mlb: 'baseball/mlb',
    nhl: 'hockey/nhl'
  };

  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPaths[sport]}/scoreboard`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) throw new Error('Failed to fetch events');

    const data = await response.json();
    return { success: true, data: data.events as ESPNEvent[] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch ESPN events' };
  }
}
```

**Add Import Feature:**
```typescript
export async function importESPNEvent(espnEvent: ESPNEvent, userId: string) {
  const venue = espnEvent.competitions[0]?.venue;

  const eventData = {
    name: espnEvent.name,
    sportType: 'Basketball', // or derive from API
    date: new Date(espnEvent.date),
    description: `Imported from ESPN - ${espnEvent.shortName}`,
    venues: venue ? [{
      name: venue.fullName,
      city: venue.address?.city,
      state: venue.address?.state,
      country: 'United States'
    }] : []
  };

  return await createEvent(eventData);
}
```

---

### Phase 2: Add Discovery UI

**Create Event Discovery Page:**
```typescript
// app/discover/page.tsx
'use client';

export default function DiscoverPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Discover Sports Events</h1>

      {/* Sport selector */}
      <div className="grid grid-cols-4 gap-4">
        <SportCard sport="NBA" icon={Basketball} />
        <SportCard sport="NFL" icon={Football} />
        <SportCard sport="MLB" icon={Baseball} />
        <SportCard sport="NHL" icon={Hockey} />
      </div>

      {/* Event list with import buttons */}
      <EventList events={espnEvents} onImport={handleImport} />
    </div>
  );
}
```

---

### Phase 3: Advanced Features

1. **Event Feed Dashboard Widget**
   - Show upcoming events from multiple sources
   - Allow one-click import
   - Filter by favorite teams/sports

2. **Automatic Sync**
   - Background job to fetch events
   - Update user's imported events
   - Notify of schedule changes

3. **Team Following**
   - Let users follow specific teams
   - Auto-import team events
   - Get notifications for games

4. **Multi-Source Aggregation**
   - Combine ESPN + The Sports DB
   - Deduplicate events
   - Show best available data

---

## Database Schema Updates

### Add Source Tracking:
```sql
ALTER TABLE events ADD COLUMN external_source VARCHAR(50);
ALTER TABLE events ADD COLUMN external_id VARCHAR(255);
ALTER TABLE events ADD COLUMN last_synced_at TIMESTAMP;

CREATE INDEX idx_events_external ON events(external_source, external_id);
```

### Update Drizzle Schema:
```typescript
export const events = pgTable('events', {
  // ... existing fields
  externalSource: varchar('external_source', { length: 50 }),
  externalId: varchar('external_id', { length: 255 }),
  lastSyncedAt: timestamp('last_synced_at'),
});
```

---

## Implementation Checklist

### Immediate (Week 1)
- [ ] Create `lib/actions/external-events.ts` with ESPN integration
- [ ] Add `/discover` page with sport selection
- [ ] Implement one-click import functionality
- [ ] Add "Imported from ESPN" badge to event cards

### Short-term (Week 2-3)
- [ ] Add caching with Next.js revalidation
- [ ] Implement error handling and retry logic
- [ ] Add sport-specific filtering
- [ ] Create event comparison (show similar events)

### Long-term (Month 2+)
- [ ] Integrate The Sports DB for more comprehensive data
- [ ] Add automatic sync background jobs
- [ ] Implement team following feature
- [ ] Add webhook support for live updates

---

## Best Practices

### 1. Rate Limiting
```typescript
// lib/utils/rate-limiter.ts
const cache = new Map<string, number>();

export function checkRateLimit(key: string, limit: number = 100) {
  const count = cache.get(key) || 0;
  if (count >= limit) {
    throw new Error('Rate limit exceeded');
  }
  cache.set(key, count + 1);
  setTimeout(() => cache.delete(key), 24 * 60 * 60 * 1000); // 24 hours
}
```

### 2. Caching Strategy
- Cache ESPN responses for 1 hour
- Use Next.js `revalidate` for automatic updates
- Store frequently accessed data in database

### 3. Error Handling
- Graceful degradation if APIs fail
- Show cached data as fallback
- User-friendly error messages

### 4. Data Validation
- Validate all external data with Zod
- Sanitize venue addresses
- Handle missing/null fields

---

## Security Considerations

1. **API Keys**
   - Store in environment variables
   - Never expose in client code
   - Use Server Actions only

2. **Rate Limit Protection**
   - Implement server-side rate limiting
   - Cache aggressively
   - Consider API usage monitoring

3. **Data Validation**
   - Never trust external data
   - Validate before database insertion
   - Sanitize user-facing content

---

## Example User Flow

1. User clicks "Discover Events" in navigation
2. Selects "NBA" from sport grid
3. Sees list of upcoming NBA games
4. Clicks "Import" on Lakers vs Celtics game
5. Event is added to their dashboard
6. Can edit/customize the imported event
7. Receives notifications for game time

---

## Resources

- ESPN API Documentation (unofficial): https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b
- The Sports DB: https://www.thesportsdb.com/api.php
- API-Sports: https://api-sports.io/documentation
- RapidAPI Sports: https://rapidapi.com/collection/sports-apis

---

Last Updated: 2025-01-17
