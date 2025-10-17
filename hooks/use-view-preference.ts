'use client';

import { useState, useEffect } from 'react';
import { type ViewMode } from '@/components/view-switcher';

const VIEW_PREFERENCE_KEY = 'dashboard-view-preference';

export function useViewPreference(defaultView: ViewMode = 'grid'): [ViewMode, (view: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (stored === 'grid' || stored === 'list') {
        setView(stored);
      }
    } catch (error) {
      console.error('Failed to load view preference:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save preference to localStorage when it changes
  const setViewPreference = (newView: ViewMode) => {
    setView(newView);
    try {
      localStorage.setItem(VIEW_PREFERENCE_KEY, newView);
    } catch (error) {
      console.error('Failed to save view preference:', error);
    }
  };

  // Return default view until initialized to prevent hydration mismatch
  return [isInitialized ? view : defaultView, setViewPreference];
}
