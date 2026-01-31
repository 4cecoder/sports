'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Edit, Trash2, ExternalLink, Download, MoreVertical, Globe, Save, Repeat } from 'lucide-react';
import { EventFormDialog } from './event-form-dialog';
import { DeleteEventDialog } from './delete-event-dialog';
import { PublishEventDialog } from './publish-event-dialog';
import { EventStatusBadge } from './event-status-badge';
import { StatusTransitionDropdown } from './status-transition-dropdown';
import { exportSingleEvent } from '@/lib/actions/calendar-export';
import { saveEventAsTemplate } from '@/lib/actions/template-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventCardProps {
  event: EventWithVenues;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSingle = async () => {
    setIsExporting(true);
    try {
      const result = await exportSingleEvent(event.id);

      if (result.success) {
        const blob = new Blob([result.data.icsContent], {
          type: 'text/calendar;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.name.toLowerCase().replace(/\s+/g, '-')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Event exported to calendar');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export event');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    const result = await saveEventAsTemplate({
      eventId: event.id,
      templateName: `${event.name} Template`,
    });
    if (result.success) {
      toast.success('Saved as template');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      <Card className="glow-hover group flex flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-1 text-lg font-semibold group-hover:text-primary transition-colors">
                {event.name}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  {event.sportType}
                </Badge>
                <EventStatusBadge status={event.status} />
                {event.externalSource && (
                  <Badge
                    variant="outline"
                    className="bg-accent/10 text-accent border-accent/20 flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {event.externalSource}
                  </Badge>
                )}
                {event.recurrenceRuleId && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    Series
                  </Badge>
                )}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {event.status === 'draft' && (
                  <DropdownMenuItem onClick={() => setIsPublishOpen(true)}>
                    <Globe className="mr-2 h-4 w-4" /> Publish
                  </DropdownMenuItem>
                )}
                {event.status === 'published' && event.slug && (
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.slug}`}>
                      <Globe className="mr-2 h-4 w-4" /> View Public Page
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSaveAsTemplate}>
                  <Save className="mr-2 h-4 w-4" /> Save as Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSingle} disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4" /> Export to Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  {venue.city && <span className="text-muted-foreground"> &bull; {venue.city}</span>}
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
          <StatusTransitionDropdown eventId={event.id} currentStatus={event.status} />
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
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
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

      <PublishEventDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        event={event}
      />
    </>
  );
}
