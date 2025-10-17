'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { EventFormDialog } from './event-form-dialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventCalendarProps {
  events: EventWithVenues[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventWithVenues | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Auto-switch to agenda view on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && view === 'week') {
        setView('agenda');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [view]);

  // Transform events for the calendar
  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.name,
        start: new Date(event.date),
        end: new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), // 2 hours default
        resource: event,
      })),
    [events]
  );

  const handleSelectEvent = useCallback((event: { resource: EventWithVenues }) => {
    setSelectedEvent(event.resource);
    setIsEditOpen(true);
  }, []);

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  // Custom event styling
  const eventStyleGetter = useCallback(() => {
    return {
      style: {
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid hsl(var(--primary))',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
      },
    };
  }, []);

  return (
    <>
      <div className="calendar-container rounded-lg border border-border/50 bg-card p-2 md:p-4 shadow-sm">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: isMobile ? 600 : 700 }}
          onSelectEvent={handleSelectEvent}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          view={view}
          date={date}
          eventPropGetter={eventStyleGetter}
          popup
          className="custom-calendar"
          views={isMobile ? ['month', 'agenda'] : ['month', 'week', 'day', 'agenda']}
        />
      </div>

      {selectedEvent && (
        <EventFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          mode="edit"
          event={selectedEvent}
        />
      )}

      <style jsx global>{`
        .custom-calendar {
          font-family: var(--font-inter), sans-serif;
        }

        .custom-calendar .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          background: hsl(var(--muted) / 0.3);
          border-color: hsl(var(--border));
        }

        .custom-calendar .rbc-today {
          background-color: hsl(var(--primary) / 0.08);
        }

        .custom-calendar .rbc-off-range-bg {
          background-color: hsl(var(--muted) / 0.2);
        }

        .custom-calendar .rbc-date-cell {
          padding: 8px;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }

        .custom-calendar .rbc-date-cell.rbc-now {
          font-weight: 700;
          color: hsl(var(--primary));
        }

        .custom-calendar .rbc-month-view,
        .custom-calendar .rbc-time-view,
        .custom-calendar .rbc-agenda-view {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
          border-radius: 8px;
        }

        .custom-calendar .rbc-month-row,
        .custom-calendar .rbc-day-bg,
        .custom-calendar .rbc-time-content,
        .custom-calendar .rbc-time-header-content {
          border-color: hsl(var(--border) / 0.5);
        }

        .custom-calendar .rbc-event {
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
          border: none;
          padding: 4px 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .custom-calendar .rbc-event:hover {
          opacity: 1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
        }

        .custom-calendar .rbc-event-label {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .custom-calendar .rbc-event-content {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .custom-calendar .rbc-toolbar {
          padding: 16px;
          margin-bottom: 16px;
          background: hsl(var(--muted) / 0.2);
          border-radius: 8px;
          border: 1px solid hsl(var(--border) / 0.5);
        }

        .custom-calendar .rbc-toolbar button {
          padding: 8px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          background: hsl(var(--card));
          border-radius: 6px;
          transition: all 0.2s;
        }

        .custom-calendar .rbc-toolbar button:hover {
          background: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
        }

        .custom-calendar .rbc-toolbar button.rbc-active {
          background: hsl(var(--primary));
          color: white;
          border-color: hsl(var(--primary));
        }

        .custom-calendar .rbc-toolbar button:focus {
          outline: 2px solid hsl(var(--primary) / 0.5);
          outline-offset: 2px;
        }

        .custom-calendar .rbc-toolbar-label {
          font-weight: 600;
          font-size: 1.125rem;
          color: hsl(var(--foreground));
        }

        .custom-calendar .rbc-agenda-view table.rbc-agenda-table {
          border-color: hsl(var(--border));
          border-collapse: separate;
          border-spacing: 0;
        }

        .custom-calendar .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          background: hsl(var(--muted) / 0.5);
          padding: 16px;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: hsl(var(--foreground));
          border-bottom: 2px solid hsl(var(--border));
        }

        .custom-calendar .rbc-agenda-view table.rbc-agenda-table tbody > tr {
          transition: all 0.2s;
        }

        .custom-calendar .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover {
          background: hsl(var(--muted) / 0.3);
        }

        .custom-calendar .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          padding: 20px 16px;
          border-bottom: 1px solid hsl(var(--border) / 0.3);
          color: hsl(var(--foreground));
          vertical-align: middle;
        }

        .custom-calendar .rbc-agenda-date-cell {
          font-weight: 600;
          font-size: 0.9rem;
          color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.08);
          border-right: 3px solid hsl(var(--primary));
          min-width: 120px;
        }

        .custom-calendar .rbc-agenda-time-cell {
          font-weight: 600;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          min-width: 140px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          background: hsl(var(--muted) / 0.2);
        }

        .custom-calendar .rbc-agenda-event-cell {
          font-size: 0.95rem;
          font-weight: 500;
          color: hsl(var(--foreground));
          padding-left: 24px !important;
        }

        .custom-calendar .rbc-agenda-event-cell a {
          color: hsl(var(--foreground));
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.12));
          border-radius: 8px;
          border-left: 4px solid hsl(var(--primary));
          transition: all 0.2s;
          width: 100%;
        }

        .custom-calendar .rbc-agenda-event-cell a:hover {
          background: linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.2));
          transform: translateX(4px);
          border-left-color: hsl(var(--accent));
        }

        .custom-calendar .rbc-time-slot {
          border-color: hsl(var(--border) / 0.3);
        }

        .custom-calendar .rbc-current-time-indicator {
          background-color: hsl(var(--primary));
          height: 2px;
        }

        .custom-calendar .rbc-time-header-gutter,
        .custom-calendar .rbc-time-gutter {
          background: hsl(var(--muted) / 0.2);
          color: hsl(var(--muted-foreground));
          font-size: 0.75rem;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .custom-calendar .rbc-toolbar {
            flex-direction: column;
            gap: 12px;
            padding: 12px;
          }

          .custom-calendar .rbc-toolbar-label {
            font-size: 1rem;
            text-align: center;
            width: 100%;
          }

          .custom-calendar .rbc-toolbar button {
            padding: 6px 12px;
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-header {
            padding: 8px 4px;
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-date-cell {
            padding: 4px;
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-event {
            padding: 2px 4px;
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-event-content {
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
            padding: 12px 8px;
            font-size: 0.75rem;
          }

          .custom-calendar .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            padding: 16px 12px;
            font-size: 0.875rem;
          }

          .custom-calendar .rbc-agenda-date-cell {
            font-size: 0.85rem;
            min-width: 100px;
          }

          .custom-calendar .rbc-agenda-time-cell {
            font-size: 0.8rem;
            min-width: 120px;
          }

          .custom-calendar .rbc-agenda-event-cell {
            font-size: 0.875rem;
            padding-left: 12px !important;
          }

          .custom-calendar .rbc-agenda-event-cell a {
            padding: 6px 12px;
            font-size: 0.875rem;
          }
        }

        /* Extra small devices */
        @media (max-width: 480px) {
          .custom-calendar .rbc-toolbar button {
            padding: 4px 8px;
            font-size: 0.7rem;
          }

          .custom-calendar .rbc-header span {
            font-size: 0.7rem;
          }

          .custom-calendar .rbc-event {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
}
