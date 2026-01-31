'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { createBooking } from '@/lib/actions/booking-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Ticket } from 'lucide-react';
import { toast } from 'sonner';

interface BookingFormProps {
  event: EventWithVenues;
}

export function BookingForm({ event }: BookingFormProps) {
  const router = useRouter();
  const [ticketCount, setTicketCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = event.priceCents * ticketCount;
  const priceDisplay = totalPrice === 0 ? 'Free' : `$${(totalPrice / 100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createBooking({
      eventId: event.id,
      ticketCount,
      notes: notes || undefined,
    });

    if (result.success) {
      router.push(`/events/${event.slug}/book/confirmation?code=${result.data.confirmationCode}`);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Book Tickets
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-3 bg-muted/20 text-sm">
            <p className="font-medium">{event.name}</p>
            <p className="text-muted-foreground">{event.sportType}</p>
          </div>

          <div className="space-y-2">
            <Label>Number of Tickets</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                disabled={ticketCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{ticketCount}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                disabled={ticketCount >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
            />
          </div>

          <div className="rounded-md border p-4 bg-primary/5">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">{priceDisplay}</span>
            </div>
            {event.priceCents > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {ticketCount} x ${(event.priceCents / 100).toFixed(2)}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full gradient-blue-green hover:opacity-90">
            {isSubmitting ? 'Booking...' : `Confirm Booking \u2022 ${priceDisplay}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
