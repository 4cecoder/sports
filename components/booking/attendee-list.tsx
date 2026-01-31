import { type Booking } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  waitlisted: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

interface AttendeeListProps {
  bookings: Booking[];
}

export function AttendeeList({ bookings }: AttendeeListProps) {
  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const waitlisted = bookings.filter((b) => b.status === 'waitlisted');
  const totalTickets = confirmed.reduce((sum, b) => sum + b.ticketCount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">{confirmed.length} confirmed</span>
        <span className="text-muted-foreground">{totalTickets} total tickets</span>
        {waitlisted.length > 0 && (
          <span className="text-yellow-600">{waitlisted.length} waitlisted</span>
        )}
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b bg-muted/50">
          <span>Code</span>
          <span>Status</span>
          <span>Tickets</span>
          <span>Total</span>
          <span>Date</span>
        </div>
        {bookings.map((booking) => (
          <div key={booking.id} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm border-b last:border-0">
            <span className="font-mono">{booking.confirmationCode}</span>
            <span>
              <Badge variant="outline" className={STATUS_STYLES[booking.status] ?? ''}>
                {booking.status}
              </Badge>
            </span>
            <span>{booking.ticketCount}</span>
            <span>{booking.totalPriceCents === 0 ? 'Free' : `$${(booking.totalPriceCents / 100).toFixed(2)}`}</span>
            <span className="text-muted-foreground">{format(new Date(booking.createdAt), 'MMM d, yyyy')}</span>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No bookings yet</div>
        )}
      </div>
    </div>
  );
}
