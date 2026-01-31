'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RecurrenceFormSchema, type RecurrenceFormValues } from '@/lib/validation/schemas';
import { createRecurrenceRule } from '@/lib/actions/recurrence-actions';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, MapPin, Repeat } from 'lucide-react';
import { toast } from 'sonner';

interface RecurrenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurrenceFormDialog({ open, onOpenChange }: RecurrenceFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecurrenceFormValues>({
    resolver: zodResolver(RecurrenceFormSchema),
    defaultValues: {
      name: '',
      frequency: 'weekly',
      dayOfWeek: '',
      dayOfMonth: '',
      timeOfDay: '',
      startDate: '',
      endDate: '',
      templateId: '',
      sportType: '',
      venues: [{ name: '', address: '', city: '', state: '', country: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'venues' });

  const onSubmit = async (values: RecurrenceFormValues) => {
    setIsSubmitting(true);
    const result = await createRecurrenceRule({
      name: values.name,
      frequency: values.frequency,
      dayOfWeek: values.dayOfWeek ? parseInt(values.dayOfWeek) : undefined,
      dayOfMonth: values.dayOfMonth ? parseInt(values.dayOfMonth) : undefined,
      timeOfDay: values.timeOfDay,
      startDate: values.startDate,
      endDate: values.endDate,
      templateId: values.templateId || undefined,
      sportType: values.sportType,
      venueConfig: values.venues.filter((v) => v.name),
    });

    if (result.success) {
      toast.success('Recurrence rule created and events generated');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) form.reset(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            Create Recurring Events
          </DialogTitle>
          <DialogDescription>Set up a schedule to auto-generate events</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Rule Name *</FormLabel>
                <FormControl><Input placeholder="e.g., Weekly Basketball" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="sportType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport Type *</FormLabel>
                  <FormControl><Input placeholder="e.g., Basketball" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(form.watch('frequency') === 'weekly' || form.watch('frequency') === 'biweekly') && (
                <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {DAYS.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              {form.watch('frequency') === 'monthly' && (
                <FormField control={form.control} name="dayOfMonth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Month</FormLabel>
                    <FormControl><Input type="number" min={1} max={31} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="timeOfDay" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time *</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Venue Presets
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', address: '', city: '', state: '', country: '' })}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 rounded-md border p-2 bg-muted/20">
                  <FormField control={form.control} name={`venues.${index}.name`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input placeholder="Venue name" className="h-9" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`venues.${index}.city`} render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input placeholder="City" className="h-9" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="gradient-blue-green hover:opacity-90">
                {isSubmitting ? 'Creating...' : 'Create Rule & Generate Events'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
