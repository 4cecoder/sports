'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { type EventWithVenues, createEvent, updateEvent } from '@/lib/actions/event-actions';
import { EventFormSchema, type EventFormValues } from '@/lib/validation/schemas';
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
import {
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Trophy,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  event?: EventWithVenues;
}

const STEPS = [
  { id: 1, name: 'Event Details', icon: Trophy },
  { id: 2, name: 'Venue Info', icon: MapPin },
  { id: 3, name: 'Review', icon: Check },
];

export function EventFormDialog({
  open,
  onOpenChange,
  mode,
  event,
}: EventFormDialogProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: event?.name || '',
      sportType: event?.sportType || '',
      date: event?.date
        ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm")
        : '',
      description: event?.description || '',
      capacity: event?.capacity?.toString() || '',
      priceCents: event?.priceCents ? (event.priceCents / 100).toString() : '',
      currency: event?.currency || 'USD',
      registrationDeadline: event?.registrationDeadline
        ? format(new Date(event.registrationDeadline), "yyyy-MM-dd'T'HH:mm")
        : '',
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

    const payload = {
      ...values,
      capacity: values.capacity ? parseInt(values.capacity) : null,
      priceCents: values.priceCents ? Math.round(parseFloat(values.priceCents) * 100) : 0,
      currency: values.currency || 'USD',
      registrationDeadline: values.registrationDeadline || null,
    };

    const result =
      mode === 'create'
        ? await createEvent(payload)
        : await updateEvent({ ...payload, id: event!.id });

    if (result.success) {
      toast.success(`Event ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onOpenChange(false);
      form.reset();
      setCurrentStep(1);
      router.refresh();
    } else {
      toast.error(result.error || `Failed to ${mode} event`);
    }

    setIsSubmitting(false);
  };

  const validateStep = async (step: number) => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger(['name', 'sportType', 'date', 'description', 'capacity', 'priceCents', 'registrationDeadline']);
    } else if (step === 2) {
      isValid = await form.trigger('venues');
    }

    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'create'
              ? 'Follow the steps below to create your sports event'
              : 'Update your event details'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                      isCompleted &&
                        'border-primary bg-primary text-primary-foreground',
                      isCurrent &&
                        'border-primary bg-primary/10 text-primary scale-110',
                      !isCompleted &&
                        !isCurrent &&
                        'border-muted-foreground/30 bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium transition-colors',
                      isCurrent && 'text-primary',
                      !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-[2px] flex-1 transition-colors mx-2',
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  Event Information
                </div>
                <Separator />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Event Name *
                      </FormLabel>
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

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Description (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add event description, rules, or additional information..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Ticketing (Optional)
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Capacity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Unlimited"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceCents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Price ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00 (Free)"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Reg. Deadline</FormLabel>
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
                </div>
              </div>
            )}

            {/* Step 2: Venue Information */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
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

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                            Venue {index + 1}
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

                      <FormField
                        control={form.control}
                        name={`venues.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Venue Name *
                            </FormLabel>
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
                          <FormItem>
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

                      <div className="grid gap-4 sm:grid-cols-2">
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
                      </div>

                      <FormField
                        control={form.control}
                        name={`venues.${index}.country`}
                        render={({ field }) => (
                          <FormItem>
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
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Review Your Event
                </div>
                <Separator />

                <div className="space-y-6 rounded-lg border border-border/50 bg-muted/20 p-6">
                  {/* Event Details Summary */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold text-foreground">
                      <Trophy className="h-4 w-4 text-primary" />
                      Event Details
                    </h3>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-start justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-right">{form.watch('name')}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-muted-foreground">Sport:</span>
                        <span className="font-medium">{form.watch('sportType')}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {form.watch('date') &&
                            format(new Date(form.watch('date')), 'PPP p')}
                        </span>
                      </div>
                      {form.watch('description') && (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground">Description:</span>
                          <span className="font-medium text-sm">
                            {form.watch('description')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Venues Summary */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Venues ({form.watch('venues').length})
                    </h3>
                    <div className="space-y-3">
                      {form.watch('venues').map((venue, index) => (
                        <div
                          key={index}
                          className="rounded-md border border-border/50 bg-background p-3 text-sm"
                        >
                          <div className="font-medium">{venue.name}</div>
                          {(venue.address || venue.city || venue.state || venue.country) && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {[venue.address, venue.city, venue.state, venue.country]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Please review all details before submitting. You can always edit your
                    event later.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
              <div className="flex w-full gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={currentStep === 1 ? 'flex-1' : ''}
                >
                  Cancel
                </Button>
                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 gradient-blue-green hover:opacity-90"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gradient-blue-green hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <>
                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {mode === 'create' ? 'Create Event' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
