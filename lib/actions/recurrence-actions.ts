'use server';

import { db } from '@/lib/db';
import { recurrenceRules, events, venues, RecurrenceRule } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import {
  CreateRecurrenceRuleSchema,
  UpdateRecurrenceRuleSchema,
  DeleteRecurrenceRuleSchema,
} from '@/lib/validation/schemas';
import { eq, and, desc, gte } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { addDays, addWeeks, addMonths } from 'date-fns';

// ── Generate recurring event dates ─────────────────────────────────────────

function computeOccurrences(rule: {
  frequency: string;
  startDate: Date;
  endDate: Date;
  timeOfDay: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
}): Date[] {
  const dates: Date[] = [];
  const [hours, minutes] = rule.timeOfDay.split(':').map(Number);
  let current = new Date(rule.startDate);
  const end = new Date(rule.endDate);

  // Set initial time
  current.setHours(hours, minutes, 0, 0);

  // Align to the right starting point based on frequency
  if (rule.frequency === 'weekly' || rule.frequency === 'biweekly') {
    if (rule.dayOfWeek != null) {
      const diff = (rule.dayOfWeek - current.getDay() + 7) % 7;
      current = addDays(current, diff);
    }
  } else if (rule.frequency === 'monthly' && rule.dayOfMonth != null) {
    current.setDate(rule.dayOfMonth);
    if (current < rule.startDate) current = addMonths(current, 1);
  }

  while (current <= end && dates.length < 365) {
    dates.push(new Date(current));

    switch (rule.frequency) {
      case 'daily':
        current = addDays(current, 1);
        break;
      case 'weekly':
        current = addWeeks(current, 1);
        break;
      case 'biweekly':
        current = addWeeks(current, 2);
        break;
      case 'monthly':
        current = addMonths(current, 1);
        if (rule.dayOfMonth != null) {
          current.setDate(Math.min(rule.dayOfMonth, new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()));
        }
        break;
    }
  }

  return dates;
}

// ── Create Recurrence Rule ─────────────────────────────────────────────────

export const createRecurrenceRule = createAuthenticatedAction(
  CreateRecurrenceRuleSchema,
  async (input, userId) => {
    const startDate = typeof input.startDate === 'string' ? new Date(input.startDate) : input.startDate;
    const endDate = typeof input.endDate === 'string' ? new Date(input.endDate) : input.endDate;

    const [rule] = await db
      .insert(recurrenceRules)
      .values({
        name: input.name,
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        dayOfMonth: input.dayOfMonth,
        timeOfDay: input.timeOfDay,
        startDate,
        endDate,
        templateId: input.templateId,
        sportType: input.sportType,
        venueConfig: input.venueConfig ?? [],
        userId,
      })
      .returning();

    // Generate events
    await generateRecurringEvents(rule.id, userId);

    revalidatePath('/dashboard');
    return rule;
  }
);

// ── Generate Recurring Events ──────────────────────────────────────────────

async function generateRecurringEvents(ruleId: string, userId: string) {
  const rule = await db.query.recurrenceRules.findFirst({
    where: eq(recurrenceRules.id, ruleId),
  });

  if (!rule) throw new Error('Recurrence rule not found');

  const dates = computeOccurrences({
    frequency: rule.frequency,
    startDate: rule.startDate,
    endDate: rule.endDate,
    timeOfDay: rule.timeOfDay,
    dayOfWeek: rule.dayOfWeek,
    dayOfMonth: rule.dayOfMonth,
  });

  const venueConfig = (rule.venueConfig ?? []) as Array<{
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }>;

  for (let i = 0; i < dates.length; i++) {
    const [newEvent] = await db
      .insert(events)
      .values({
        name: `${rule.name} #${i + 1}`,
        sportType: rule.sportType,
        date: dates[i],
        userId,
        recurrenceRuleId: ruleId,
        seriesIndex: i,
        status: 'draft',
      })
      .returning();

    if (venueConfig.length > 0) {
      await db.insert(venues).values(
        venueConfig.map((v) => ({
          name: v.name,
          address: v.address,
          city: v.city,
          state: v.state,
          country: v.country,
          eventId: newEvent.id,
        }))
      );
    }
  }
}

// ── Regenerate Recurring Events ────────────────────────────────────────────

export const regenerateRecurringEvents = createAuthenticatedAction(
  DeleteRecurrenceRuleSchema, // reuse schema with just { id }
  async (input, userId) => {
    const rule = await db.query.recurrenceRules.findFirst({
      where: and(eq(recurrenceRules.id, input.id), eq(recurrenceRules.userId, userId)),
    });

    if (!rule) throw new Error('Recurrence rule not found or unauthorized');

    // Delete future draft events for this rule
    const now = new Date();
    const existingEvents = await db.query.events.findMany({
      where: and(
        eq(events.recurrenceRuleId, input.id),
        eq(events.status, 'draft'),
        gte(events.date, now)
      ),
    });

    for (const event of existingEvents) {
      await db.delete(events).where(eq(events.id, event.id));
    }

    // Regenerate
    await generateRecurringEvents(input.id, userId);

    revalidatePath('/dashboard');
    return { id: input.id };
  }
);

// ── Get Recurrence Rules ───────────────────────────────────────────────────

export async function getRecurrenceRules(): Promise<ActionResult<RecurrenceRule[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const rules = await db.query.recurrenceRules.findMany({
      where: eq(recurrenceRules.userId, user.id),
      orderBy: [desc(recurrenceRules.createdAt)],
    });

    return { success: true, data: rules };
  } catch (error) {
    console.error('Get recurrence rules error:', error);
    return { success: false, error: 'Failed to fetch recurrence rules' };
  }
}

// ── Update Recurrence Rule ─────────────────────────────────────────────────

export const updateRecurrenceRule = createAuthenticatedAction(
  UpdateRecurrenceRuleSchema,
  async (input, userId) => {
    const existing = await db.query.recurrenceRules.findFirst({
      where: and(eq(recurrenceRules.id, input.id), eq(recurrenceRules.userId, userId)),
    });

    if (!existing) throw new Error('Recurrence rule not found or unauthorized');

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.frequency !== undefined) updates.frequency = input.frequency;
    if (input.dayOfWeek !== undefined) updates.dayOfWeek = input.dayOfWeek;
    if (input.dayOfMonth !== undefined) updates.dayOfMonth = input.dayOfMonth;
    if (input.timeOfDay !== undefined) updates.timeOfDay = input.timeOfDay;
    if (input.startDate !== undefined) {
      updates.startDate = typeof input.startDate === 'string' ? new Date(input.startDate) : input.startDate;
    }
    if (input.endDate !== undefined) {
      updates.endDate = typeof input.endDate === 'string' ? new Date(input.endDate) : input.endDate;
    }
    if (input.templateId !== undefined) updates.templateId = input.templateId;
    if (input.sportType !== undefined) updates.sportType = input.sportType;
    if (input.venueConfig !== undefined) updates.venueConfig = input.venueConfig;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    const [updated] = await db
      .update(recurrenceRules)
      .set(updates)
      .where(eq(recurrenceRules.id, input.id))
      .returning();

    revalidatePath('/dashboard');
    return updated;
  }
);

// ── Delete Recurrence Rule ─────────────────────────────────────────────────

export const deleteRecurrenceRule = createAuthenticatedAction(
  DeleteRecurrenceRuleSchema,
  async (input, userId) => {
    const existing = await db.query.recurrenceRules.findFirst({
      where: and(eq(recurrenceRules.id, input.id), eq(recurrenceRules.userId, userId)),
    });

    if (!existing) throw new Error('Recurrence rule not found or unauthorized');

    await db.delete(recurrenceRules).where(eq(recurrenceRules.id, input.id));

    revalidatePath('/dashboard');
    return { id: input.id };
  }
);
