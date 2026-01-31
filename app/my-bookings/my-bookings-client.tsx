'use client';

import { type BookingWithEvent } from '@/lib/actions/booking-actions';
import { PublicHeader } from '@/components/public/public-header';
import { BookingCard } from '@/components/booking/booking-card';
import { Ticket } from 'lucide-react';

interface MyBookingsClientProps {
  bookings: BookingWithEvent[];
}

export function MyBookingsClient({ bookings }: MyBookingsClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Your event reservations and tickets</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground">Browse events and book your first tickets</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
