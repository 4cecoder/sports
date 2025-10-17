import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6">
          {/* 404 Text */}
          <div className="relative">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              404
            </h1>
            <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary to-primary/60" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved or doesn&apos;t exist.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="pt-12">
            <p className="text-sm text-muted-foreground">
              Looking for something specific?{' '}
              <Link href="/dashboard" className="text-primary hover:underline">
                Try the dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
