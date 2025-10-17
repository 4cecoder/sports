'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
import { EventFormDialog } from './event-form-dialog';
import { DeleteEventDialog } from './delete-event-dialog';

interface EventListItemProps {
  event: EventWithVenues;
}

export function EventListItem({ event }: EventListItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="glow-hover group flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-lg border border-border/50 bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-primary/50">
        {/* Left Section - Main Content */}
        <div className="flex-1 space-y-3">
          {/* Title and Badges */}
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
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
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {format(new Date(event.date), 'PPP')}
            </span>
            <span className="text-muted-foreground">
              at {format(new Date(event.date), 'p')}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Venues */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Venues ({event.venues.length})
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {event.venues.slice(0, 3).map((venue) => (
                <div key={venue.id} className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span className="text-foreground">
                    {venue.name}
                    {venue.city && <span className="text-muted-foreground"> • {venue.city}</span>}
                  </span>
                </div>
              ))}
              {event.venues.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{event.venues.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex sm:flex-col gap-2 sm:w-24 sm:justify-center">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="h-4 w-4 sm:mr-0 mr-2" />
            <span className="sm:hidden">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>

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
