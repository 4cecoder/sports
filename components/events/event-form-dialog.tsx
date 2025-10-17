'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { type EventWithVenues, createEvent, updateEvent } from '@/lib/actions/event-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Calendar, MapPin, Trophy, FileText } from 'lucide-react';
import { toast } from 'sonner';

const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  sportType: z.string().min(1, 'Sport type is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  venues: z.array(venueSchema).min(1, 'At least one venue is required'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  event?: EventWithVenues;
}

export function EventFormDialog({
  open,
  onOpenChange,
  mode,
  event,
}: EventFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || '',
      sportType: event?.sportType || '',
      date: event?.date
        ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm")
        : '',
      description: event?.description || '',
      venues: event?.venues.map((v) => ({
        name: v.name,
        address: v.address || '',
        city: v.city || '',
        state: v.state || '',
        country: v.country || '',
      })) || [{ name: '', address: '', city: '', state: '', country: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'venues',
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);

    const result =
      mode === 'create'
        ? await createEvent(values)
        : await updateEvent({ ...values, id: event!.id });

    if (result.success) {
      toast.success(`Event ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error || `Failed to ${mode} event`);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'create'
              ? 'Fill in the details below to create a new sports event with venue information.'
              : 'Update the event details and venue information below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Event Details
              </div>
              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Event Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-sm font-medium">Event Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Championship Finals 2024"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sport Type */}
                <FormField
                  control={form.control}
                  name="sportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" />
                        Sport Type *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Basketball"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date & Time */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Date & Time *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-sm font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add event description, rules, or additional information..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Venues Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Venue Locations
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: '', address: '', city: '', state: '', country: '' })
                  }
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Add Venue
                </Button>
              </div>
              <Separator />

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Venue Location
                        </p>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`venues.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-sm font-medium">Venue Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Madison Square Garden"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`venues.${index}.address`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-sm">Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 4 Pennsylvania Plaza"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`venues.${index}.city`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., New York"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`venues.${index}.state`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">State / Province</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., NY"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`venues.${index}.country`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-sm">Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., United States"
                                className="h-10"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="sm:mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-blue-green hover:opacity-90"
              >
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating Event...'
                    : 'Updating Event...'
                  : mode === 'create'
                    ? 'Create Event'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
