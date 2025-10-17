import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DiscoverClient from './discover-client';

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
