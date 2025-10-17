import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DiscoverClient from './discover-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Discover Events',
  description: 'Discover and import sports events from ESPN. Browse NBA, NFL, MLB, and NHL games and add them to your schedule.',
};

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <DiscoverClient />;
}
