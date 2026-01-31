'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { recordMatchResult } from '@/lib/actions/scheduling-actions';
import { type LeagueScheduleEvent } from '@/lib/actions/scheduling-actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RecordResultDialogProps {
  event: LeagueScheduleEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordResultDialog({ event, open, onOpenChange }: RecordResultDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const handleSubmit = () => {
    if (!event) return;

    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      toast.error('Please enter valid scores (0 or higher)');
      return;
    }

    startTransition(async () => {
      const result = await recordMatchResult({
        eventId: event.id,
        homeScore: home,
        awayScore: away,
      });

      if (result.success) {
        toast.success('Match result recorded');
        onOpenChange(false);
        setHomeScore('');
        setAwayScore('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to record result');
      }
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Match Result</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-right">
              <Label className="text-sm font-semibold">
                {event.homeTeam?.name ?? 'Home'}
              </Label>
            </div>
            <Input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-bold"
            />
            <div className="text-sm text-muted-foreground">Home</div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-right">
              <Label className="text-sm font-semibold">
                {event.awayTeam?.name ?? 'Away'}
              </Label>
            </div>
            <Input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              className="text-center text-lg font-bold"
            />
            <div className="text-sm text-muted-foreground">Away</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
