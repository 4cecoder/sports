import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPublicEvent } from '@/lib/actions/event-actions';
import { PublicHeader } from '@/components/public/public-header';
import { BookingForm } from '@/components/booking/booking-form';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Book Tickets | Fastbreak',
};

export default async function BookEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { slug } = await params;
    redirect(`/auth/login?redirectTo=/events/${slug}/book`);
  }

  const { slug } = await params;
  const result = await getPublicEvent(slug);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <BookingForm event={result.data} />
      </main>
    </div>
  );
}
