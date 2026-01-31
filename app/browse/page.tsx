import { getPublicEvents } from '@/lib/actions/event-actions';
import { BrowseClient } from './browse-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse Events | Fastbreak',
  description: 'Discover and book sports events near you.',
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sportType?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');

  const result = await getPublicEvents({
    search: params.search,
    sportType: params.sportType,
    page,
    pageSize: 12,
  });

  return (
    <BrowseClient
      events={result.success ? result.data.events : []}
      total={result.success ? result.data.total : 0}
      currentPage={page}
      initialSearch={params.search}
      initialSportType={params.sportType}
    />
  );
}
