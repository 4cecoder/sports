'use server';

import { db } from '@/lib/db';
import { events, venues, Event, Venue } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import { z } from 'zod';
import { eq, and, desc, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Validation Schemas
const VenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

const CreateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
  externalSource: z.string().optional(),
  externalId: z.string().optional(),
});

const UpdateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
});

const DeleteEventSchema = z.object({
  id: z.string().uuid(),
});

// Types
export type EventWithVenues = Event & { venues: Venue[] };

/**
 * Create a new event with venues
 */
export const createEvent = createAuthenticatedAction(
  CreateEventSchema,
  async (input, userId) => {
    const { venues: venueData, ...eventData } = input;

    // Convert date to Date object if it's a string
    const eventDate = typeof input.date === 'string' ? new Date(input.date) : input.date;

    // Create event
    const [newEvent] = await db
      .insert(events)
      .values({
        ...eventData,
        date: eventDate,
        userId,
        externalSource: input.externalSource,
        externalId: input.externalId,
        lastSyncedAt: input.externalSource ? new Date() : undefined,
      })
      .returning();

    // Create venues
    const newVenues = await db
      .insert(venues)
      .values(
        venueData.map((venue) => ({
          ...venue,
          eventId: newEvent.id,
        }))
      )
      .returning();

    revalidatePath('/dashboard');

    return { ...newEvent, venues: newVenues };
  }
);

/**
 * Get all events for the authenticated user with optional filtering
 */
export async function getEvents(input?: {
  search?: string;
  sportType?: string;
}): Promise<ActionResult<EventWithVenues[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Build query conditions
    const conditions = [eq(events.userId, user.id)];

    if (input?.search) {
      conditions.push(
        or(
          ilike(events.name, `%${input.search}%`),
          ilike(events.description, `%${input.search}%`)
        )!
      );
    }

    if (input?.sportType) {
      conditions.push(eq(events.sportType, input.sportType));
    }

    // Fetch events with venues
    const eventsData = await db.query.events.findMany({
      where: and(...conditions),
      with: {
        venues: true,
      },
      orderBy: [desc(events.date)],
    });

    return { success: true, data: eventsData as EventWithVenues[] };
  } catch (error) {
    console.error('Get events error:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

/**
 * Get a single event by ID
 */
export async function getEventById(id: string): Promise<ActionResult<EventWithVenues>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const event = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.userId, user.id)),
      with: {
        venues: true,
      },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    return { success: true, data: event as EventWithVenues };
  } catch (error) {
    console.error('Get event error:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

/**
 * Update an existing event
 */
export const updateEvent = createAuthenticatedAction(
  UpdateEventSchema,
  async (input, userId) => {
    const { id, venues: venueData, ...eventData } = input;

    // Convert date to Date object if it's a string
    const eventDate = typeof input.date === 'string' ? new Date(input.date) : input.date;

    // Verify ownership
    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    // Update event
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...eventData,
        date: eventDate,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    // Delete existing venues and create new ones
    await db.delete(venues).where(eq(venues.eventId, id));

    const newVenues = await db
      .insert(venues)
      .values(
        venueData.map((venue) => ({
          ...venue,
          eventId: id,
        }))
      )
      .returning();

    revalidatePath('/dashboard');
    revalidatePath(`/events/${id}`);

    return { ...updatedEvent, venues: newVenues };
  }
);

/**
 * Delete an event
 */
export const deleteEvent = createAuthenticatedAction(
  DeleteEventSchema,
  async (input, userId) => {
    // Verify ownership
    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, input.id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    // Delete event (venues will be cascade deleted)
    await db.delete(events).where(eq(events.id, input.id));

    revalidatePath('/dashboard');

    return { id: input.id };
  }
);

/**
 * Get unique sport types for the authenticated user (for filter dropdown)
 */
export async function getSportTypes(): Promise<ActionResult<string[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userEvents = await db
      .select({ sportType: events.sportType })
      .from(events)
      .where(eq(events.userId, user.id))
      .groupBy(events.sportType);

    const sportTypes = userEvents.map((e) => e.sportType);

    return { success: true, data: sportTypes };
  } catch (error) {
    console.error('Get sport types error:', error);
    return { success: false, error: 'Failed to fetch sport types' };
  }
}
