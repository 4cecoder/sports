'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEventStatus } from '@/lib/actions/event-actions';
import { getValidTransitions } from '@/lib/utils/status-transitions';
import { type EventStatus } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface StatusTransitionDropdownProps {
  eventId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

export function StatusTransitionDropdown({
  eventId,
  currentStatus,
  onStatusChange,
}: StatusTransitionDropdownProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const validTransitions = getValidTransitions(currentStatus as EventStatus);

  const handleTransition = async (newStatus: EventStatus) => {
    setIsUpdating(true);
    const result = await updateEventStatus({ id: eventId, status: newStatus });

    if (result.success) {
      toast.success(`Event status updated to ${newStatus}`);
      router.refresh();
      onStatusChange?.();
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  if (validTransitions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating} className="gap-1">
          Status
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {validTransitions.map((status) => (
          <DropdownMenuItem key={status} onClick={() => handleTransition(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
