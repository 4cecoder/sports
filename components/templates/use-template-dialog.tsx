'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { type EventTemplate } from '@/lib/db/schema';
import { createEventFromTemplate } from '@/lib/actions/template-actions';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EventTemplate;
}

export function UseTemplateDialog({ open, onOpenChange, template }: UseTemplateDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { name: '', date: '' },
  });

  const onSubmit = async (values: { name: string; date: string }) => {
    if (!values.name || !values.date) {
      toast.error('Name and date are required');
      return;
    }
    setIsSubmitting(true);
    const result = await createEventFromTemplate({
      templateId: template.id,
      name: values.name,
      date: values.date,
    });

    if (result.success) {
      toast.success('Event created from template');
      onOpenChange(false);
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Event from Template</DialogTitle>
          <DialogDescription>
            Using template: <Badge variant="secondary" className="ml-1">{template.name}</Badge>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name *</Label>
            <Input id="event-name" placeholder="e.g., Weekly Practice - Jan 15" {...register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-date">Date & Time *</Label>
            <Input id="event-date" type="datetime-local" {...register('date')} />
          </div>
          <div className="rounded-md border p-3 bg-muted/20 text-sm space-y-1">
            <p><span className="font-medium">Sport:</span> {template.sportType}</p>
            {template.description && <p><span className="font-medium">Description:</span> {template.description}</p>}
            {template.durationMins && <p><span className="font-medium">Duration:</span> {template.durationMins} min</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-blue-green hover:opacity-90">
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
