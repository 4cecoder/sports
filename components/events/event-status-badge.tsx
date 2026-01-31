'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  published: 'bg-green-500/10 text-green-600 border-green-500/20',
  postponed: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export function EventStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', STATUS_STYLES[status] ?? '')}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
