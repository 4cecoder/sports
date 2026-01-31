'use server';

import { db } from '@/lib/db';
import { bookings, events, Booking, Event, Venue } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import { CreateBookingSchema, CancelBookingSchema } from '@/lib/validation/schemas';
import { eq, and, count, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { generateConfirmationCode } from '@/lib/utils/confirmation-code';

export type BookingWithEvent = Booking & {
  event: Event & { venues: Venue[] };
};

// ── Create Booking ─────────────────────────────────────────────────────────

export const createBooking = createAuthenticatedAction(
  CreateBookingSchema,
  async (input, userId) => {
    const event = await db.query.events.findFirst({
      where: and(
        eq(events.id, input.eventId),
        eq(events.status, 'published'),
        eq(events.isPublic, true)
      ),
    });

    if (!event) throw new Error('Event not found or not available for booking');

    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      throw new Error('Registration deadline has passed');
    }

    // Check capacity
    const [{ count: booked }] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.eventId, input.eventId),
        eq(bookings.status, 'confirmed')
      ));

    const status = event.capacity && (booked + input.ticketCount > event.capacity)
      ? 'waitlisted' as const
      : 'confirmed' as const;

    const totalPriceCents = event.priceCents * input.ticketCount;

    const [booking] = await db
      .insert(bookings)
      .values({
        eventId: input.eventId,
        userId,
        status,
        ticketCount: input.ticketCount,
        totalPriceCents,
        confirmationCode: generateConfirmationCode(),
        notes: input.notes,
      })
      .returning();

    revalidatePath(`/events/${event.slug}`);
    revalidatePath('/my-bookings');

    return booking;
  }
);

// ── Cancel Booking ─────────────────────────────────────────────────────────

export const cancelBooking = createAuthenticatedAction(
  CancelBookingSchema,
  async (input, userId) => {
    const booking = await db.query.bookings.findFirst({
      where: and(eq(bookings.id, input.id), eq(bookings.userId, userId)),
    });

    if (!booking) throw new Error('Booking not found or unauthorized');

    const [cancelled] = await db
      .update(bookings)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(bookings.id, input.id))
      .returning();

    // Promote next waitlisted booking
    const nextWaitlisted = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.eventId, booking.eventId),
        eq(bookings.status, 'waitlisted')
      ),
      orderBy: [asc(bookings.createdAt)],
    });

    if (nextWaitlisted) {
      await db
        .update(bookings)
        .set({ status: 'confirmed', updatedAt: new Date() })
        .where(eq(bookings.id, nextWaitlisted.id));
    }

    revalidatePath('/my-bookings');

    return cancelled;
  }
);

// ── Get My Bookings ────────────────────────────────────────────────────────

export async function getMyBookings(): Promise<ActionResult<BookingWithEvent[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await db.query.bookings.findMany({
      where: eq(bookings.userId, user.id),
      with: {
        event: {
          with: { venues: true },
        },
      },
      orderBy: [asc(bookings.createdAt)],
    });

    return { success: true, data: result as BookingWithEvent[] };
  } catch (error) {
    console.error('Get my bookings error:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

// ── Get Event Bookings (planner view) ──────────────────────────────────────

export async function getEventBookings(
  eventId: string
): Promise<ActionResult<Booking[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify event ownership
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.userId, user.id)),
    });

    if (!event) {
      return { success: false, error: 'Event not found or unauthorized' };
    }

    const result = await db.query.bookings.findMany({
      where: eq(bookings.eventId, eventId),
      orderBy: [asc(bookings.createdAt)],
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Get event bookings error:', error);
    return { success: false, error: 'Failed to fetch bookings' };
  }
}

// ── Get Event Availability (no auth) ───────────────────────────────────────

export async function getEventAvailability(
  eventId: string
): Promise<ActionResult<{ capacity: number | null; booked: number; available: number | null; isFull: boolean }>> {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const [{ count: booked }] = await db
      .select({ count: count() })
      .from(bookings)
      .where(and(
        eq(bookings.eventId, eventId),
        eq(bookings.status, 'confirmed')
      ));

    const available = event.capacity ? event.capacity - booked : null;
    const isFull = event.capacity ? booked >= event.capacity : false;

    return {
      success: true,
      data: { capacity: event.capacity, booked, available, isFull },
    };
  } catch (error) {
    console.error('Get availability error:', error);
    return { success: false, error: 'Failed to fetch availability' };
  }
}
