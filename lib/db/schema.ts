import { pgTable, pgEnum, text, timestamp, uuid, varchar, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────

export const eventStatusEnum = pgEnum('event_status', [
  'draft', 'published', 'postponed', 'cancelled', 'completed',
]);

export const bookingStatusEnum = pgEnum('booking_status', [
  'confirmed', 'cancelled', 'waitlisted',
]);

export const recurrenceFrequencyEnum = pgEnum('recurrence_frequency', [
  'daily', 'weekly', 'biweekly', 'monthly',
]);

export const scheduleTypeEnum = pgEnum('schedule_type', [
  'round_robin', 'single_elimination', 'double_elimination',
]);

// ── Events Table ───────────────────────────────────────────────────────────

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
  externalSource: varchar('external_source', { length: 50 }),
  externalId: varchar('external_id', { length: 255 }),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  // Phase 1: Status
  status: eventStatusEnum('status').default('draft').notNull(),
  // Phase 3: Public event fields
  slug: varchar('slug', { length: 255 }).unique(),
  coverImageUrl: text('cover_image_url'),
  isPublic: boolean('is_public').default(false).notNull(),
  capacity: integer('capacity'),
  priceCents: integer('price_cents').default(0).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  // Phase 5: Recurring
  recurrenceRuleId: uuid('recurrence_rule_id').references(() => recurrenceRules.id),
  seriesIndex: integer('series_index'),
  // Phase 6: League
  leagueId: uuid('league_id').references(() => leagues.id),
  homeTeamId: uuid('home_team_id').references(() => teams.id),
  awayTeamId: uuid('away_team_id').references(() => teams.id),
  // Bracket fields
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  winnerId: uuid('winner_id').references(() => teams.id),
  roundNumber: integer('round_number'),
  matchIndex: integer('match_index'),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Venues Table ───────────────────────────────────────────────────────────

export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Event Templates Table (Phase 2) ───────────────────────────────────────

export const eventTemplates = pgTable('event_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  description: text('description'),
  durationMins: integer('duration_mins'),
  venueConfig: jsonb('venue_config').$type<VenueConfigJson[]>(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Bookings Table (Phase 4) ──────────────────────────────────────────────

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  status: bookingStatusEnum('status').default('confirmed').notNull(),
  ticketCount: integer('ticket_count').default(1).notNull(),
  totalPriceCents: integer('total_price_cents').default(0).notNull(),
  confirmationCode: varchar('confirmation_code', { length: 20 }).unique().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Recurrence Rules Table (Phase 5) ──────────────────────────────────────

export const recurrenceRules = pgTable('recurrence_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  frequency: recurrenceFrequencyEnum('frequency').notNull(),
  dayOfWeek: integer('day_of_week'), // 0-6
  dayOfMonth: integer('day_of_month'), // 1-31
  timeOfDay: varchar('time_of_day', { length: 5 }).notNull(), // "HH:MM"
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  templateId: uuid('template_id').references(() => eventTemplates.id),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  venueConfig: jsonb('venue_config').$type<VenueConfigJson[]>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Leagues Table (Phase 6) ───────────────────────────────────────────────

export const leagues = pgTable('leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  userId: uuid('user_id').notNull(),
  seasonStart: timestamp('season_start', { withTimezone: true }).notNull(),
  seasonEnd: timestamp('season_end', { withTimezone: true }).notNull(),
  scheduleType: scheduleTypeEnum('schedule_type').notNull(),
  externalSource: varchar('external_source', { length: 50 }),
  externalId: varchar('external_id', { length: 255 }),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  predictions: jsonb('predictions').$type<Record<string, string>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Teams Table (Phase 6) ─────────────────────────────────────────────────

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  leagueId: uuid('league_id')
    .notNull()
    .references(() => leagues.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  externalId: varchar('external_id', { length: 255 }),
  externalSource: varchar('external_source', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ many, one }) => ({
  venues: many(venues),
  bookings: many(bookings),
  recurrenceRule: one(recurrenceRules, {
    fields: [events.recurrenceRuleId],
    references: [recurrenceRules.id],
  }),
  league: one(leagues, {
    fields: [events.leagueId],
    references: [leagues.id],
  }),
  homeTeam: one(teams, {
    fields: [events.homeTeamId],
    references: [teams.id],
    relationName: 'homeTeam',
  }),
  awayTeam: one(teams, {
    fields: [events.awayTeamId],
    references: [teams.id],
    relationName: 'awayTeam',
  }),
  winner: one(teams, {
    fields: [events.winnerId],
    references: [teams.id],
    relationName: 'winner',
  }),
}));

export const venuesRelations = relations(venues, ({ one }) => ({
  event: one(events, {
    fields: [venues.eventId],
    references: [events.id],
  }),
}));

export const eventTemplatesRelations = relations(eventTemplates, ({ many }) => ({
  recurrenceRules: many(recurrenceRules),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
}));

export const recurrenceRulesRelations = relations(recurrenceRules, ({ one, many }) => ({
  template: one(eventTemplates, {
    fields: [recurrenceRules.templateId],
    references: [eventTemplates.id],
  }),
  events: many(events),
}));

export const leaguesRelations = relations(leagues, ({ many }) => ({
  teams: many(teams),
  events: many(events),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  league: one(leagues, {
    fields: [teams.leagueId],
    references: [leagues.id],
  }),
}));

// ── JSON types ─────────────────────────────────────────────────────────────

export interface VenueConfigJson {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// ── Type exports ───────────────────────────────────────────────────────────

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
export type EventTemplate = typeof eventTemplates.$inferSelect;
export type NewEventTemplate = typeof eventTemplates.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type RecurrenceRule = typeof recurrenceRules.$inferSelect;
export type NewRecurrenceRule = typeof recurrenceRules.$inferInsert;
export type League = typeof leagues.$inferSelect;
export type NewLeague = typeof leagues.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
