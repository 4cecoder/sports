'use server';

import { db } from '@/lib/db';
import { events, venues, Event, Venue } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import {
  CreateEventSchema,
  UpdateEventSchema,
  DeleteEventSchema,
  UpdateEventStatusSchema,
  PublishEventSchema,
  type EventStatus,
} from '@/lib/validation/schemas';
import { eq, and, desc, ilike, or, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { generateUniqueSlug } from '@/lib/utils/slugify';

// Types
export type EventWithVenues = Event & { venues: Venue[] };

import { getValidTransitions } from '@/lib/utils/status-transitions';

// ── Create Event ───────────────────────────────────────────────────────────

export const createEvent = createAuthenticatedAction(
  CreateEventSchema,
  async (input, userId) => {
    const { venues: venueData, ...eventData } = input;
    const eventDate = typeof input.date === 'string' ? new Date(input.date) : input.date;
    const regDeadline = input.registrationDeadline
      ? typeof input.registrationDeadline === 'string'
        ? new Date(input.registrationDeadline)
        : input.registrationDeadline
      : undefined;

    const [newEvent] = await db
      .insert(events)
      .values({
        ...eventData,
        date: eventDate,
        userId,
        externalSource: input.externalSource,
        externalId: input.externalId,
        lastSyncedAt: input.externalSource ? new Date() : undefined,
        capacity: input.capacity ?? undefined,
        priceCents: input.priceCents ?? 0,
        currency: input.currency ?? 'USD',
        registrationDeadline: regDeadline,
      })
      .returning();

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

// ── Get Events (authenticated) ─────────────────────────────────────────────

export async function getEvents(input?: {
  search?: string;
  sportType?: string;
  status?: string;
}): Promise<ActionResult<EventWithVenues[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

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

    if (input?.status) {
      conditions.push(eq(events.status, input.status as EventStatus));
    }

    const eventsData = await db.query.events.findMany({
      where: and(...conditions),
      with: { venues: true },
      orderBy: [desc(events.date)],
    });

    return { success: true, data: eventsData as EventWithVenues[] };
  } catch (error) {
    console.error('Get events error:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

// ── Get Event by ID ────────────────────────────────────────────────────────

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
      with: { venues: true },
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

// ── Update Event ───────────────────────────────────────────────────────────

export const updateEvent = createAuthenticatedAction(
  UpdateEventSchema,
  async (input, userId) => {
    const { id, venues: venueData, ...eventData } = input;
    const eventDate = typeof input.date === 'string' ? new Date(input.date) : input.date;
    const regDeadline = input.registrationDeadline
      ? typeof input.registrationDeadline === 'string'
        ? new Date(input.registrationDeadline)
        : input.registrationDeadline
      : null;

    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...eventData,
        date: eventDate,
        capacity: input.capacity ?? null,
        priceCents: input.priceCents ?? existingEvent.priceCents,
        currency: input.currency ?? existingEvent.currency,
        registrationDeadline: regDeadline,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

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

// ── Delete Event ───────────────────────────────────────────────────────────

export const deleteEvent = createAuthenticatedAction(
  DeleteEventSchema,
  async (input, userId) => {
    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, input.id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    await db.delete(events).where(eq(events.id, input.id));

    revalidatePath('/dashboard');

    return { id: input.id };
  }
);

// ── Update Event Status (Phase 1) ─────────────────────────────────────────

export const updateEventStatus = createAuthenticatedAction(
  UpdateEventStatusSchema,
  async (input, userId) => {
    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, input.id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    const currentStatus = existingEvent.status as EventStatus;
    const validNext = getValidTransitions(currentStatus);

    if (!validNext.includes(input.status)) {
      throw new Error(
        `Cannot transition from '${currentStatus}' to '${input.status}'`
      );
    }

    const updates: Record<string, unknown> = {
      status: input.status,
      updatedAt: new Date(),
    };

    // Auto-set isPublic when publishing
    if (input.status === 'published') {
      updates.isPublic = true;
      if (!existingEvent.slug) {
        updates.slug = generateUniqueSlug(existingEvent.name);
      }
    }

    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, input.id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/browse');

    return updated;
  }
);

// ── Publish Event (Phase 3) ───────────────────────────────────────────────

export const publishEvent = createAuthenticatedAction(
  PublishEventSchema,
  async (input, userId) => {
    const existingEvent = await db.query.events.findFirst({
      where: and(eq(events.id, input.id), eq(events.userId, userId)),
    });

    if (!existingEvent) {
      throw new Error('Event not found or unauthorized');
    }

    const [updated] = await db
      .update(events)
      .set({
        status: 'published',
        isPublic: true,
        slug: input.slug,
        updatedAt: new Date(),
      })
      .where(eq(events.id, input.id))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/browse');
    revalidatePath(`/events/${input.slug}`);

    return updated;
  }
);

// ── Public Queries (no auth) ──────────────────────────────────────────────

export async function getPublicEvent(slug: string): Promise<ActionResult<EventWithVenues>> {
  try {
    const event = await db.query.events.findFirst({
      where: and(
        eq(events.slug, slug),
        eq(events.isPublic, true),
        eq(events.status, 'published')
      ),
      with: { venues: true },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    return { success: true, data: event as EventWithVenues };
  } catch (error) {
    console.error('Get public event error:', error);
    return { success: false, error: 'Failed to fetch event' };
  }
}

export async function getPublicEvents(filters?: {
  search?: string;
  sportType?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{ events: EventWithVenues[]; total: number }>> {
  try {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 12;
    const offset = (page - 1) * pageSize;

    const conditions = [
      eq(events.isPublic, true),
      eq(events.status, 'published'),
    ];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(events.name, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.sportType) {
      conditions.push(eq(events.sportType, filters.sportType));
    }

    const whereClause = and(...conditions);

    const [eventsData, totalResult] = await Promise.all([
      db.query.events.findMany({
        where: whereClause,
        with: { venues: true },
        orderBy: [desc(events.date)],
        limit: pageSize,
        offset,
      }),
      db.select({ count: count() }).from(events).where(whereClause!),
    ]);

    return {
      success: true,
      data: {
        events: eventsData as EventWithVenues[],
        total: totalResult[0]?.count ?? 0,
      },
    };
  } catch (error) {
    console.error('Get public events error:', error);
    return { success: false, error: 'Failed to fetch events' };
  }
}

// ── Get Sport Types ────────────────────────────────────────────────────────

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

    return { success: true, data: userEvents.map((e) => e.sportType) };
  } catch (error) {
    console.error('Get sport types error:', error);
    return { success: false, error: 'Failed to fetch sport types' };
  }
}
