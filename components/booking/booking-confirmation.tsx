import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy } from 'lucide-react';
import Link from 'next/link';

interface BookingConfirmationProps {
  confirmationCode: string;
  eventName: string;
  eventSlug: string;
}

export function BookingConfirmation({ confirmationCode, eventName, eventSlug }: BookingConfirmationProps) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-muted-foreground mt-2">Your tickets for {eventName} have been reserved.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Confirmation Code</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="text-2xl font-mono px-4 py-2 tracking-wider">
            {confirmationCode}
          </Badge>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/events/${eventSlug}`}>
          <Button variant="outline">Back to Event</Button>
        </Link>
        <Link href="/my-bookings">
          <Button className="gradient-blue-green hover:opacity-90">View My Bookings</Button>
        </Link>
      </div>
    </div>
  );
}
