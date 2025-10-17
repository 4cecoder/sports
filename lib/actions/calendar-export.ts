'use server';

import { createAuthenticatedAction, ActionResult } from './action-helpers';
import { getEvents } from './event-actions';
import { z } from 'zod';
import { createEvents, EventAttributes } from 'ics';

const ExportCalendarSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sportType: z.string().optional(),
});

/**
 * Export events to iCalendar (.ics) format
 * Users can import this into Google Calendar, Apple Calendar, Outlook, etc.
 */
export const exportToCalendar = createAuthenticatedAction(
  ExportCalendarSchema,
  async (input) => {
    // Fetch user's events
    const eventsResult = await getEvents({
      sportType: input.sportType,
    });

    if (!eventsResult.success) {
      throw new Error('Failed to fetch events');
    }

    let events = eventsResult.data;

    // Filter by date range if provided
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

    // Convert events to iCalendar format
    const icsEvents: EventAttributes[] = events.map((event) => {
      const eventDate = new Date(event.date);

      // Get venue information
      const venueInfo = event.venues.length > 0
        ? event.venues.map((v) => {
            const parts = [v.name];
            if (v.address) parts.push(v.address);
            if (v.city) parts.push(v.city);
            if (v.state) parts.push(v.state);
            if (v.country) parts.push(v.country);
            return parts.join(', ');
          }).join(' | ')
        : 'TBD';

      const location = event.venues.length > 0 && event.venues[0].name
        ? event.venues[0].name +
          (event.venues[0].city ? `, ${event.venues[0].city}` : '') +
          (event.venues[0].state ? `, ${event.venues[0].state}` : '')
        : undefined;

      // Description with all venue details
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
        duration: { hours: 2 }, // Default 2 hour duration
        title: `${event.sportType}: ${event.name}`,
        description,
        location,
        status: 'CONFIRMED' as const,
        busyStatus: 'BUSY' as const,
        organizer: { name: 'Fastbreak Event Dashboard' },
        categories: [event.sportType, 'Sports'],
        uid: event.id,
      };
    });

    // Generate ICS file
    const { error, value } = createEvents(icsEvents);

    if (error) {
      console.error('ICS generation error:', error);
      throw new Error('Failed to generate calendar file');
    }

    if (!value) {
      throw new Error('Failed to generate calendar file');
    }

    return {
      icsContent: value,
      eventCount: events.length,
    };
  }
);

/**
 * Export a single event to iCalendar format
 */
export async function exportSingleEvent(
  eventId: string
): Promise<ActionResult<{ icsContent: string }>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Import getEventById here to avoid circular dependencies
    const { getEventById } = await import('./event-actions');
    const eventResult = await getEventById(eventId);

    if (!eventResult.success) {
      return { success: false, error: 'Event not found' };
    }

    const event = eventResult.data;
    const eventDate = new Date(event.date);

    const venueInfo =
      event.venues.length > 0
        ? event.venues
            .map((v) => {
              const parts = [v.name];
              if (v.address) parts.push(v.address);
              if (v.city) parts.push(v.city);
              if (v.state) parts.push(v.state);
              if (v.country) parts.push(v.country);
              return parts.join(', ');
            })
            .join(' | ')
        : 'TBD';

    const location =
      event.venues.length > 0 && event.venues[0].name
        ? event.venues[0].name +
          (event.venues[0].city ? `, ${event.venues[0].city}` : '') +
          (event.venues[0].state ? `, ${event.venues[0].state}` : '')
        : undefined;

    const description = [
      event.description || '',
      '',
      `Sport: ${event.sportType}`,
      `Venue(s): ${venueInfo}`,
      event.externalSource ? `\nSource: ${event.externalSource}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const icsEvent: EventAttributes = {
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
      location,
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const,
      organizer: { name: 'Fastbreak Event Dashboard' },
      categories: [event.sportType, 'Sports'],
      uid: event.id,
    };

    const { error, value } = createEvents([icsEvent]);

    if (error || !value) {
      return { success: false, error: 'Failed to generate calendar file' };
    }

    return {
      success: true,
      data: { icsContent: value },
    };
  } catch (error) {
    console.error('Export single event error:', error);
    return { success: false, error: 'Failed to export event' };
  }
}
