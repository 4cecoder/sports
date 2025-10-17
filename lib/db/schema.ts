import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Events Table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sportType: varchar('sport_type', { length: 100 }).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(), // References auth.users
  externalSource: varchar('external_source', { length: 50 }), // e.g., 'ESPN', 'TheSportsDB'
  externalId: varchar('external_id', { length: 255 }), // API-specific event ID
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }), // Last time external data was synced
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Venues Table
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

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  venues: many(venues),
}));

export const venuesRelations = relations(venues, ({ one }) => ({
  event: one(events, {
    fields: [venues.eventId],
    references: [events.id],
  }),
}));

// Type exports
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;
