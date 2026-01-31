import { notFound } from 'next/navigation';
import { getPublicEvent } from '@/lib/actions/event-actions';
import { PublicHeader } from '@/components/public/public-header';
import { PublicEventDetail } from '@/components/public/public-event-detail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicEvent(slug);
  if (!result.success) return { title: 'Event Not Found' };
  return {
    title: `${result.data.name} | Fastbreak`,
    description: result.data.description || `${result.data.sportType} event`,
    openGraph: {
      title: result.data.name,
      description: result.data.description || undefined,
    },
  };
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicEvent(slug);

  if (!result.success) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <PublicEventDetail event={result.data} />
      </main>
    </div>
  );
}
