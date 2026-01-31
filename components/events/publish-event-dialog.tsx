'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues, publishEvent } from '@/lib/actions/event-actions';
import { slugify } from '@/lib/utils/slugify';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

interface PublishEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventWithVenues;
}

export function PublishEventDialog({ open, onOpenChange, event }: PublishEventDialogProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(event.slug || slugify(event.name));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async () => {
    if (!slug) {
      toast.error('Slug is required');
      return;
    }
    setIsSubmitting(true);
    const result = await publishEvent({ id: event.id, slug });

    if (result.success) {
      toast.success('Event published!');
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Publish Event
          </DialogTitle>
          <DialogDescription>
            Make this event visible to the public. Choose a URL slug for the event page.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/events/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="my-event"
              />
            </div>
          </div>
          <div className="rounded-md border p-3 bg-muted/20 text-sm">
            <p className="font-medium">{event.name}</p>
            <p className="text-muted-foreground mt-1">
              This event will be publicly accessible and appear in browse results.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePublish} disabled={isSubmitting || !slug} className="gradient-blue-green hover:opacity-90">
            {isSubmitting ? 'Publishing...' : 'Publish Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
