import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Fastbreak" width={32} height={32} />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Fastbreak
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/browse">
            <Button variant="ghost" size="sm">Browse Events</Button>
          </Link>
          <ThemeSwitcher />
          <Link href="/auth/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
