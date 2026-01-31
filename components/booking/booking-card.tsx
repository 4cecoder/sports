'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { type BookingWithEvent } from '@/lib/actions/booking-actions';
import { cancelBooking } from '@/lib/actions/booking-actions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  waitlisted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

interface BookingCardProps {
  booking: BookingWithEvent;
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    const result = await cancelBooking({ id: booking.id });
    if (result.success) {
      toast.success('Booking cancelled');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsCancelling(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/events/${booking.event.slug}`} className="font-semibold hover:text-primary transition-colors">
              {booking.event.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                {booking.event.sportType}
              </Badge>
              <Badge variant="outline" className={STATUS_STYLES[booking.status] ?? ''}>
                {booking.status}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {booking.confirmationCode}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(booking.event.date), 'PPP p')}
          </span>
          <span className="flex items-center gap-1">
            <Ticket className="h-3.5 w-3.5" />
            {booking.ticketCount} ticket{booking.ticketCount !== 1 ? 's' : ''}
          </span>
        </div>

        {booking.event.venues.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {booking.event.venues[0].name}
          </div>
        )}

        {booking.totalPriceCents > 0 && (
          <p className="text-sm font-medium">
            Total: ${(booking.totalPriceCents / 100).toFixed(2)}
          </p>
        )}
      </CardContent>
      {booking.status === 'confirmed' && (
        <CardFooter className="bg-muted/20 p-3">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isCancelling}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
