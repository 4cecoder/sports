'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 px-4">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-orange-500/20 blur-3xl rounded-full" />
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-destructive to-orange-500 flex items-center justify-center shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-6xl font-display font-bold bg-gradient-to-r from-destructive to-orange-500 bg-clip-text text-transparent">
            Oops!
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working on fixing it.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 max-w-xl mx-auto">
            <p className="text-sm font-mono text-left break-all text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="gradient-blue-green hover:opacity-90 transition-opacity gap-2"
          >
            <RefreshCcw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-border/50 hover:bg-muted"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <a
              href="mailto:devin@bytecats.codes"
              className="text-primary hover:text-primary/80 font-medium transition-colors underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
