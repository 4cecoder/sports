import { Badge } from '@/components/ui/badge';

interface AvailabilityBadgeProps {
  capacity: number | null;
  priceCents: number;
  available?: number | null;
  isFull?: boolean;
}

export function AvailabilityBadge({ capacity, priceCents, available, isFull }: AvailabilityBadgeProps) {
  if (isFull) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
        Sold Out
      </Badge>
    );
  }

  if (priceCents === 0) {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
        Free
      </Badge>
    );
  }

  if (available != null && capacity) {
    return (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        {available} spot{available !== 1 ? 's' : ''} left
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
      ${(priceCents / 100).toFixed(2)}
    </Badge>
  );
}
