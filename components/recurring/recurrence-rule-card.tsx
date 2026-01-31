'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type RecurrenceRule } from '@/lib/db/schema';
import { deleteRecurrenceRule, regenerateRecurringEvents } from '@/lib/actions/recurrence-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RecurrenceRuleCardProps {
  rule: RecurrenceRule;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RecurrenceRuleCard({ rule }: RecurrenceRuleCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteRecurrenceRule({ id: rule.id });
    if (result.success) {
      toast.success('Recurrence rule deleted');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const result = await regenerateRecurringEvents({ id: rule.id });
    if (result.success) {
      toast.success('Events regenerated');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsRegenerating(false);
  };

  const frequencyLabel = rule.frequency.charAt(0).toUpperCase() + rule.frequency.slice(1);
  const dayLabel = rule.dayOfWeek != null ? DAYS[rule.dayOfWeek] : rule.dayOfMonth ? `Day ${rule.dayOfMonth}` : '';

  return (
    <Card className="glow-hover group overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
          {rule.name}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {rule.sportType}
          </Badge>
          <Badge variant="outline">{frequencyLabel}</Badge>
          {dayLabel && <Badge variant="outline">{dayLabel}</Badge>}
          <Badge variant="outline">{rule.timeOfDay}</Badge>
          {!rule.isActive && <Badge variant="outline" className="bg-red-500/10 text-red-600">Inactive</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(rule.startDate), 'MMM d, yyyy')} - {format(new Date(rule.endDate), 'MMM d, yyyy')}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-border/50 bg-muted/20 pt-4">
        <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}
          className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
