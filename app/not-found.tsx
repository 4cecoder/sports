import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { BasketballGame } from '@/components/basketball-game';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* 404 Text */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                404
              </h1>
              <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-primary to-accent" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                Looks like you missed the shot! 🏀
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                While you&apos;re here, why not practice your basketball skills? Try to score some points while we help you find your way back!
              </p>
            </div>
          </div>

          {/* Basketball Game */}
          <div className="flex justify-center">
            <BasketballGame />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="gap-2 gradient-blue-green">
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
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Looking for something specific?{' '}
              <Link href="/dashboard" className="text-primary hover:underline font-semibold">
                Try the dashboard
              </Link>
              {' '}or{' '}
              <Link href="/discover" className="text-accent hover:underline font-semibold">
                discover events
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
