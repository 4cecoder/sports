import { z } from 'zod';

export const VenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export const CreateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
  externalSource: z.string().optional(),
  externalId: z.string().optional(),
});

export const UpdateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().or(z.date()),
  description: z.string().optional(),
  venues: z.array(VenueSchema).min(1, 'At least one venue is required'),
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
