'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { EventFormDialog } from './event-form-dialog';
import { DeleteEventDialog } from './delete-event-dialog';

interface EventCardProps {
  event: EventWithVenues;
}

export function EventCard({ event }: EventCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="line-clamp-1">{event.name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="secondary">{event.sportType}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}
            </div>

            {event.description && (
              <p className="line-clamp-2 text-sm">{event.description}</p>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium">
                Venues ({event.venues.length})
              </p>
              {event.venues.slice(0, 2).map((venue) => (
                <div key={venue.id} className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="mr-2 mt-0.5 h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {venue.name}
                    {venue.city && `, ${venue.city}`}
                  </span>
                </div>
              ))}
              {event.venues.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{event.venues.length - 2} more venue{event.venues.length - 2 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <EventFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        event={event}
      />

      <DeleteEventDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        event={event}
      />
    </>
  );
}
