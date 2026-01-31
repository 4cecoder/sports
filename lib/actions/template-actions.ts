'use server';

import { db } from '@/lib/db';
import { eventTemplates, events, venues, EventTemplate } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
  DeleteTemplateSchema,
  CreateEventFromTemplateSchema,
  SaveEventAsTemplateSchema,
} from '@/lib/validation/schemas';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// ── Create Template ────────────────────────────────────────────────────────

export const createTemplate = createAuthenticatedAction(
  CreateTemplateSchema,
  async (input, userId) => {
    const [template] = await db
      .insert(eventTemplates)
      .values({
        name: input.name,
        sportType: input.sportType,
        description: input.description,
        durationMins: input.durationMins,
        venueConfig: input.venueConfig ?? [],
        userId,
      })
      .returning();

    revalidatePath('/dashboard');
    return template;
  }
);

// ── Update Template ────────────────────────────────────────────────────────

export const updateTemplate = createAuthenticatedAction(
  UpdateTemplateSchema,
  async (input, userId) => {
    const existing = await db.query.eventTemplates.findFirst({
      where: and(eq(eventTemplates.id, input.id), eq(eventTemplates.userId, userId)),
    });

    if (!existing) throw new Error('Template not found or unauthorized');

    const [updated] = await db
      .update(eventTemplates)
      .set({
        name: input.name,
        sportType: input.sportType,
        description: input.description,
        durationMins: input.durationMins,
        venueConfig: input.venueConfig,
        updatedAt: new Date(),
      })
      .where(eq(eventTemplates.id, input.id))
      .returning();

    revalidatePath('/dashboard');
    return updated;
  }
);

// ── Delete Template ────────────────────────────────────────────────────────

export const deleteTemplate = createAuthenticatedAction(
  DeleteTemplateSchema,
  async (input, userId) => {
    const existing = await db.query.eventTemplates.findFirst({
      where: and(eq(eventTemplates.id, input.id), eq(eventTemplates.userId, userId)),
    });

    if (!existing) throw new Error('Template not found or unauthorized');

    await db.delete(eventTemplates).where(eq(eventTemplates.id, input.id));

    revalidatePath('/dashboard');
    return { id: input.id };
  }
);

// ── Get Templates ──────────────────────────────────────────────────────────

export async function getTemplates(): Promise<ActionResult<EventTemplate[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const templates = await db.query.eventTemplates.findMany({
      where: eq(eventTemplates.userId, user.id),
      orderBy: [desc(eventTemplates.updatedAt)],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error('Get templates error:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

// ── Create Event from Template ─────────────────────────────────────────────

export const createEventFromTemplate = createAuthenticatedAction(
  CreateEventFromTemplateSchema,
  async (input, userId) => {
    const template = await db.query.eventTemplates.findFirst({
      where: and(
        eq(eventTemplates.id, input.templateId),
        eq(eventTemplates.userId, userId)
      ),
    });

    if (!template) throw new Error('Template not found or unauthorized');

    const eventDate = typeof input.date === 'string' ? new Date(input.date) : input.date;

    const [newEvent] = await db
      .insert(events)
      .values({
        name: input.name,
        sportType: template.sportType,
        date: eventDate,
        description: template.description,
        userId,
      })
      .returning();

    const venueConfig = (template.venueConfig ?? []) as Array<{
      name: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }>;

    let newVenues: typeof venues.$inferSelect[] = [];
    if (venueConfig.length > 0) {
      newVenues = await db
        .insert(venues)
        .values(
          venueConfig.map((v) => ({
            name: v.name,
            address: v.address,
            city: v.city,
            state: v.state,
            country: v.country,
            eventId: newEvent.id,
          }))
        )
        .returning();
    }

    revalidatePath('/dashboard');
    return { ...newEvent, venues: newVenues };
  }
);

// ── Save Event as Template ─────────────────────────────────────────────────

export const saveEventAsTemplate = createAuthenticatedAction(
  SaveEventAsTemplateSchema,
  async (input, userId) => {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, input.eventId), eq(events.userId, userId)),
      with: { venues: true },
    });

    if (!event) throw new Error('Event not found or unauthorized');

    const venueConfig = event.venues.map((v) => ({
      name: v.name,
      address: v.address ?? undefined,
      city: v.city ?? undefined,
      state: v.state ?? undefined,
      country: v.country ?? undefined,
    }));

    const [template] = await db
      .insert(eventTemplates)
      .values({
        name: input.templateName,
        sportType: event.sportType,
        description: event.description,
        venueConfig,
        userId,
      })
      .returning();

    revalidatePath('/dashboard');
    return template;
  }
);
