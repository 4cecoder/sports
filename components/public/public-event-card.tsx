import Link from 'next/link';
import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { AvailabilityBadge } from '@/components/booking/availability-badge';

interface PublicEventCardProps {
  event: EventWithVenues;
}

export function PublicEventCard({ event }: PublicEventCardProps) {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="glow-hover group flex flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {event.sportType}
            </Badge>
            <AvailabilityBadge capacity={event.capacity} priceCents={event.priceCents} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">{format(new Date(event.date), 'PPP')}</span>
            <span className="text-muted-foreground">at {format(new Date(event.date), 'p')}</span>
          </div>
          {event.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          )}
          {event.venues.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.venues[0].name}{event.venues[0].city ? ` \u2022 ${event.venues[0].city}` : ''}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
