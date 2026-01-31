import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ESPNBracketImport } from '@/components/scheduling/espn-bracket-import';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Import ESPN Bracket | Fastbreak',
};

export default async function ImportBracketPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <ESPNBracketImport />
      </div>
    </div>
  );
}
