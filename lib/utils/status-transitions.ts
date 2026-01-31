import { type EventStatus } from '@/lib/validation/schemas';

const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['published'],
  published: ['postponed', 'cancelled', 'completed'],
  postponed: ['published', 'cancelled'],
  cancelled: [],
  completed: [],
};

export function getValidTransitions(current: EventStatus): EventStatus[] {
  return STATUS_TRANSITIONS[current] || [];
}
