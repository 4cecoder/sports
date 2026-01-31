'use client';

import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { AvailabilityBadge } from '@/components/booking/availability-badge';
import Link from 'next/link';

interface PublicEventDetailProps {
  event: EventWithVenues;
}

export function PublicEventDetail({ event }: PublicEventDetailProps) {
  const priceDisplay = event.priceCents === 0
    ? 'Free'
    : `$${(event.priceCents / 100).toFixed(2)}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm">
              {event.sportType}
            </Badge>
            <AvailabilityBadge capacity={event.capacity} priceCents={event.priceCents} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
        </div>

        {/* Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">{format(new Date(event.date), 'PPP')}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'p')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">{priceDisplay}</p>
            </div>
          </div>
          {event.capacity && (
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">{event.capacity} spots</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* Venues */}
        {event.venues.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Venue{event.venues.length > 1 ? 's' : ''}</h2>
            {event.venues.map((venue) => (
              <div key={venue.id} className="flex items-start gap-3 rounded-lg border p-4">
                <MapPin className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">{venue.name}</p>
                  {(venue.address || venue.city || venue.state) && (
                    <p className="text-sm text-muted-foreground">
                      {[venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registration deadline */}
        {event.registrationDeadline && (
          <p className="text-sm text-muted-foreground">
            Registration closes: {format(new Date(event.registrationDeadline), 'PPP p')}
          </p>
        )}

        {/* Book Button */}
        <div className="flex gap-3 pt-4">
          <Link href={`/events/${event.slug}/book`} className="flex-1 sm:flex-none">
            <Button size="lg" className="w-full sm:w-auto gradient-blue-green hover:opacity-90">
              Book Tickets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
