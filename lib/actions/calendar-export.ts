'use server';

import { createAuthenticatedAction } from './action-helpers';
import { getEvents, getEventById } from './event-actions';
import { ExportCalendarSchema } from '@/lib/validation/schemas';
import { createEvents, EventAttributes } from 'ics';
import { type Venue } from '@/lib/db/schema';
import { z } from 'zod';

type VenueLike = Pick<Venue, 'name' | 'address' | 'city' | 'state' | 'country'>;

function formatVenueInfo(venues: VenueLike[]): string {
  if (venues.length === 0) return 'TBD';
  return venues
    .map((v) => {
      const parts = [v.name];
      if (v.address) parts.push(v.address);
      if (v.city) parts.push(v.city);
      if (v.state) parts.push(v.state);
      if (v.country) parts.push(v.country);
      return parts.join(', ');
    })
    .join(' | ');
}

function formatVenueLocation(venues: VenueLike[]): string | undefined {
  if (venues.length === 0 || !venues[0].name) return undefined;
  const v = venues[0];
  return v.name + (v.city ? `, ${v.city}` : '') + (v.state ? `, ${v.state}` : '');
}

function eventToIcsAttributes(event: {
  id: string;
  name: string;
  date: Date;
  sportType: string;
  description: string | null;
  externalSource: string | null;
  venues: VenueLike[];
}): EventAttributes {
  const eventDate = new Date(event.date);
  const venueInfo = formatVenueInfo(event.venues);

  const description = [
    event.description || '',
    '',
    `Sport: ${event.sportType}`,
    `Venue(s): ${venueInfo}`,
    event.externalSource ? `\nSource: ${event.externalSource}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    start: [
      eventDate.getFullYear(),
      eventDate.getMonth() + 1,
      eventDate.getDate(),
      eventDate.getHours(),
      eventDate.getMinutes(),
    ] as [number, number, number, number, number],
    duration: { hours: 2 },
    title: `${event.sportType}: ${event.name}`,
    description,
    location: formatVenueLocation(event.venues),
    status: 'CONFIRMED' as const,
    busyStatus: 'BUSY' as const,
    organizer: { name: 'Fastbreak Event Dashboard' },
    categories: [event.sportType, 'Sports'],
    uid: event.id,
  };
}

function generateIcs(icsEvents: EventAttributes[]): string {
  const { error, value } = createEvents(icsEvents);
  if (error || !value) {
    throw new Error('Failed to generate calendar file');
  }
  return value;
}

/**
 * Export events to iCalendar (.ics) format
 */
export const exportToCalendar = createAuthenticatedAction(
  ExportCalendarSchema,
  async (input) => {
    const eventsResult = await getEvents({ sportType: input.sportType });

    if (!eventsResult.success) {
      throw new Error('Failed to fetch events');
    }

    let events = eventsResult.data;

    if (input.startDate || input.endDate) {
      const startDate = input.startDate ? new Date(input.startDate) : null;
      const endDate = input.endDate ? new Date(input.endDate) : null;

      events = events.filter((event) => {
        const eventDate = new Date(event.date);
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
      });
    }

    if (events.length === 0) {
      throw new Error('No events found in the selected date range');
    }

    const icsContent = generateIcs(events.map(eventToIcsAttributes));

    return { icsContent, eventCount: events.length };
  }
);

const ExportSingleEventSchema = z.object({
  eventId: z.string().uuid(),
});

/**
 * Export a single event to iCalendar format
 */
export const exportSingleEvent = createAuthenticatedAction(
  ExportSingleEventSchema,
  async (input) => {
    const eventResult = await getEventById(input.eventId);

    if (!eventResult.success) {
      throw new Error('Event not found');
    }

    const icsContent = generateIcs([eventToIcsAttributes(eventResult.data)]);

    return { icsContent };
  }
);
