'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
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
      <Card className="glow-hover group flex flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-1 text-lg font-semibold group-hover:text-primary transition-colors">
                {event.name}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  {event.sportType}
                </Badge>
                {event.externalSource && (
                  <Badge
                    variant="outline"
                    className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {event.externalSource}
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {format(new Date(event.date), 'PPP')}
            </span>
            <span className="text-muted-foreground">
              at {format(new Date(event.date), 'p')}
            </span>
          </div>

          {event.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="space-y-2 rounded-md border border-border/50 bg-card/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Venues ({event.venues.length})
            </p>
            {event.venues.slice(0, 2).map((venue) => (
              <div key={venue.id} className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                <span className="line-clamp-1 text-foreground">
                  {venue.name}
                  {venue.city && <span className="text-muted-foreground"> • {venue.city}</span>}
                </span>
              </div>
            ))}
            {event.venues.length > 2 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{event.venues.length - 2} more venue{event.venues.length - 2 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 border-t border-border/50 bg-muted/20 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
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
