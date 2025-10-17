'use server';

import { createClient } from '@/lib/supabase/server';
import { createEvent } from './event-actions';

interface ESPNVenue {
  fullName: string;
  address?: {
    city?: string;
    state?: string;
  };
}

interface ESPNCompetition {
  venue?: ESPNVenue;
}

interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions?: ESPNCompetition[];
}

interface ESPNResponse {
  events: ESPNEvent[];
}

export type SportType = 'nba' | 'nfl' | 'mlb' | 'nhl' | 'mls' | 'tennis' | 'golf';

const sportPaths: Record<SportType, string> = {
  nba: 'basketball/nba',
  nfl: 'football/nfl',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  mls: 'soccer/usa.1',
  tennis: 'tennis/atp',
  golf: 'golf/pga',
};

const sportDisplayNames: Record<SportType, string> = {
  nba: 'Basketball',
  nfl: 'Football',
  mlb: 'Baseball',
  nhl: 'Hockey',
  mls: 'Soccer',
  tennis: 'Tennis',
  golf: 'Golf',
};

export async function fetchESPNEvents(sport: SportType) {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPaths[sport]}/scoreboard`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`);
    }

    const data = (await response.json()) as ESPNResponse;
    return { success: true, data: data.events };
  } catch (error) {
    console.error('ESPN API Error:', error);
    return { success: false, error: 'Failed to fetch ESPN events' };
  }
}

export async function importESPNEvent(espnEvent: ESPNEvent, sport: SportType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const venue = espnEvent.competitions?.[0]?.venue;

  const eventData = {
    name: espnEvent.name,
    sportType: sportDisplayNames[sport],
    date: new Date(espnEvent.date),
    description: `Imported from ESPN - ${espnEvent.shortName}`,
    externalSource: 'ESPN',
    externalId: espnEvent.id,
    venues: venue
      ? [
          {
            name: venue.fullName,
            city: venue.address?.city || '',
            state: venue.address?.state || '',
            country: 'United States',
            address: '',
          },
        ]
      : [
          {
            name: 'TBD',
            city: '',
            state: '',
            country: '',
            address: '',
          },
        ],
  };

  return await createEvent(eventData);
}
