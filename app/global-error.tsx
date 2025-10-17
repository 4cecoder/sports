'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Critical Error
              </h1>
              <h2 className="text-2xl font-semibold text-white">
                Application Error
              </h2>
              <p className="text-slate-300 max-w-md mx-auto">
                A critical error occurred. Please refresh the page or contact support if this issue persists.
              </p>
            </div>

            {/* Error Details */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 max-w-xl mx-auto">
                <p className="text-sm font-mono text-left break-all text-slate-400">
                  {error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={reset}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 rounded-lg border border-slate-600 text-white font-semibold hover:bg-slate-800 transition-all"
              >
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <div className="pt-8 border-t border-slate-700">
              <p className="text-sm text-slate-400">
                If this problem persists, please{' '}
                <a
                  href="mailto:devin@bytecats.codes"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
