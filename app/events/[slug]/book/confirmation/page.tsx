import { PublicHeader } from '@/components/public/public-header';
import { BookingConfirmation } from '@/components/booking/booking-confirmation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmed | Fastbreak',
};

export default async function BookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-16">
        <BookingConfirmation
          confirmationCode={code ?? 'UNKNOWN'}
          eventName="Your Event"
          eventSlug={slug}
        />
      </main>
    </div>
  );
}
