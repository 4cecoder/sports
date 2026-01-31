import { z } from 'zod';

// ── Shared ─────────────────────────────────────────────────────────────────

export const VenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

// ── Phase 1: Event Status ──────────────────────────────────────────────────

export const EventStatusEnum = z.enum([
  'draft', 'published', 'postponed', 'cancelled', 'completed',
]);

export type EventStatus = z.infer<typeof EventStatusEnum>;

export const UpdateEventStatusSchema = z.object({
  id: z.string().uuid(),
  status: EventStatusEnum,
});

// ── Events ─────────────────────────────────────────────────────────────────

export const CreateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
  externalSource: z.string().optional(),
  externalId: z.string().optional(),
  // Phase 3 fields (optional at creation)
  capacity: z.number().int().positive().nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  registrationDeadline: z.string().or(z.date()).nullable().optional(),
});

export const UpdateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
  capacity: z.number().int().positive().nullable().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  registrationDeadline: z.string().or(z.date()).nullable().optional(),
});

export const DeleteEventSchema = z.object({
  id: z.string().uuid(),
});

export const EventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
  capacity: z.string().optional(),
  priceCents: z.string().optional(),
  currency: z.string().optional(),
  registrationDeadline: z.string().optional(),
});

export type VenueFormValues = z.infer<typeof VenueSchema>;
export type EventFormValues = z.infer<typeof EventFormSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

export const ExportCalendarSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sportType: z.string().optional(),
});

// ── Phase 2: Templates ─────────────────────────────────────────────────────

export const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  description: z.string().optional(),
  durationMins: z.number().int().positive().optional(),
  venueConfig: z.array(VenueSchema).optional(),
});

export const UpdateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  description: z.string().optional(),
  durationMins: z.number().int().positive().optional(),
  venueConfig: z.array(VenueSchema).optional(),
});

export const DeleteTemplateSchema = z.object({
  id: z.string().uuid(),
});

export const CreateEventFromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().min(1, 'Event name is required'),
  date: z.string().or(z.date()),
});

export const SaveEventAsTemplateSchema = z.object({
  eventId: z.string().uuid(),
  templateName: z.string().min(1, 'Template name is required'),
});

export const TemplateFormSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  description: z.string().optional(),
  durationMins: z.string().optional(),
  venues: z.array(VenueSchema),
});

export type TemplateFormValues = z.infer<typeof TemplateFormSchema>;

// ── Phase 3: Publish Event ─────────────────────────────────────────────────

export const PublishEventSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1).max(255).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must be lowercase alphanumeric with hyphens'
  ),
});

export const PublicEventsFilterSchema = z.object({
  search: z.string().optional(),
  sportType: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(50).optional(),
});

// ── Phase 4: Bookings ──────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  eventId: z.string().uuid(),
  ticketCount: z.number().int().positive().max(10),
  notes: z.string().optional(),
});

export const CancelBookingSchema = z.object({
  id: z.string().uuid(),
});

// ── Phase 5: Recurrence ────────────────────────────────────────────────────

export const RecurrenceFrequencyEnum = z.enum([
  'daily', 'weekly', 'biweekly', 'monthly',
]);

export const CreateRecurrenceRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  frequency: RecurrenceFrequencyEnum,
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  templateId: z.string().uuid().optional(),
  sportType: z.string().min(1, 'Sport type is required'),
  venueConfig: z.array(VenueSchema).optional(),
});

export const UpdateRecurrenceRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  frequency: RecurrenceFrequencyEnum.optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  dayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
  timeOfDay: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  templateId: z.string().uuid().nullable().optional(),
  sportType: z.string().min(1).optional(),
  venueConfig: z.array(VenueSchema).optional(),
  isActive: z.boolean().optional(),
});

export const DeleteRecurrenceRuleSchema = z.object({
  id: z.string().uuid(),
});

export const RecurrenceFormSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  frequency: RecurrenceFrequencyEnum,
  dayOfWeek: z.string().optional(),
  dayOfMonth: z.string().optional(),
  timeOfDay: z.string().min(1, 'Time is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  templateId: z.string().optional(),
  sportType: z.string().min(1, 'Sport type is required'),
  venues: z.array(VenueSchema),
});

export type RecurrenceFormValues = z.infer<typeof RecurrenceFormSchema>;

// ── Phase 6: Leagues / Scheduling ──────────────────────────────────────────

export const ScheduleTypeEnum = z.enum([
  'round_robin', 'single_elimination', 'double_elimination',
]);

export const CreateLeagueSchema = z.object({
  name: z.string().min(1, 'League name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  seasonStart: z.string().or(z.date()),
  seasonEnd: z.string().or(z.date()),
  scheduleType: ScheduleTypeEnum,
  teamNames: z.array(z.string().min(1)).min(2, 'At least 2 teams required'),
});

export const UpdateLeagueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  sportType: z.string().min(1).optional(),
  seasonStart: z.string().or(z.date()).optional(),
  seasonEnd: z.string().or(z.date()).optional(),
});

export const DeleteLeagueSchema = z.object({
  id: z.string().uuid(),
});

export const AddTeamSchema = z.object({
  leagueId: z.string().uuid(),
  name: z.string().min(1, 'Team name is required'),
});

export const RemoveTeamSchema = z.object({
  id: z.string().uuid(),
});

export const GenerateScheduleSchema = z.object({
  leagueId: z.string().uuid(),
});

export const LeagueFormSchema = z.object({
  name: z.string().min(1, 'League name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  seasonStart: z.string().min(1, 'Start date is required'),
  seasonEnd: z.string().min(1, 'End date is required'),
  scheduleType: ScheduleTypeEnum,
  teamNames: z.array(z.string()).min(2, 'At least 2 teams required'),
});

export type LeagueFormValues = z.infer<typeof LeagueFormSchema>;

// ── Phase 7: Bracket Management + ESPN Import ──────────────────────────────

export const RecordMatchResultSchema = z.object({
  eventId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  winnerId: z.string().uuid().optional(),
});

export const ImportESPNBracketSchema = z.object({
  sport: z.string().min(1),
  leagueName: z.string().min(1),
  games: z.array(z.object({
    externalId: z.string(),
    name: z.string(),
    date: z.string(),
    homeTeam: z.object({
      externalId: z.string(),
      name: z.string(),
      score: z.number().optional(),
      winner: z.boolean().optional(),
    }),
    awayTeam: z.object({
      externalId: z.string(),
      name: z.string(),
      score: z.number().optional(),
      winner: z.boolean().optional(),
    }),
    round: z.number().int().min(1),
    matchIndex: z.number().int().min(0),
    status: z.enum(['scheduled', 'in_progress', 'completed']),
  })),
});

export const SimulateBracketPickSchema = z.object({
  eventId: z.string().uuid(),
  predictedWinnerId: z.string().uuid(),
});

export const SyncESPNResultsSchema = z.object({
  leagueId: z.string().uuid(),
});
