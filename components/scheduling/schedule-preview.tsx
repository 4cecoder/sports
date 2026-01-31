import { format } from 'date-fns';
import { type LeagueScheduleEvent } from '@/lib/actions/scheduling-actions';
import { Badge } from '@/components/ui/badge';
import { EventStatusBadge } from '@/components/events/event-status-badge';

interface SchedulePreviewProps {
  events: LeagueScheduleEvent[];
}

export function SchedulePreview({ events }: SchedulePreviewProps) {
  // Group by date
  const grouped = events.reduce<Record<string, LeagueScheduleEvent[]>>((acc, event) => {
    const key = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey, roundIdx) => (
        <div key={dateKey}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">Round {roundIdx + 1}</Badge>
            <span className="text-sm text-muted-foreground">{format(new Date(dateKey), 'PPP')}</span>
          </div>
          <div className="space-y-2">
            {grouped[dateKey].map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <span className="font-medium flex-1">{event.name}</span>
                <EventStatusBadge status={event.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No schedule generated yet. Click &ldquo;Generate Schedule&rdquo; to create matchups.</p>
      )}
    </div>
  );
}
