'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type EventTemplate } from '@/lib/db/schema';
import { TemplateFormSchema, type TemplateFormValues } from '@/lib/validation/schemas';
import { createTemplate, updateTemplate } from '@/lib/actions/template-actions';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  template?: EventTemplate;
}

export function TemplateFormDialog({ open, onOpenChange, mode, template }: TemplateFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venueConfig = (template?.venueConfig ?? []) as Array<{
    name: string; address?: string; city?: string; state?: string; country?: string;
  }>;

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(TemplateFormSchema),
    defaultValues: {
      name: template?.name ?? '',
      sportType: template?.sportType ?? '',
      description: template?.description ?? '',
      durationMins: template?.durationMins?.toString() ?? '',
      venues: venueConfig.length > 0
        ? venueConfig.map((v) => ({
            name: v.name,
            address: v.address ?? '',
            city: v.city ?? '',
            state: v.state ?? '',
            country: v.country ?? '',
          }))
        : [{ name: '', address: '', city: '', state: '', country: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'venues' });

  const onSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);
    const payload = {
      name: values.name,
      sportType: values.sportType,
      description: values.description || undefined,
      durationMins: values.durationMins ? parseInt(values.durationMins) : undefined,
      venueConfig: values.venues.filter((v) => v.name),
    };

    const result = mode === 'create'
      ? await createTemplate(payload)
      : await updateTemplate({ ...payload, id: template!.id });

    if (result.success) {
      toast.success(`Template ${mode === 'create' ? 'created' : 'updated'}`);
      onOpenChange(false);
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) form.reset(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Template' : 'Edit Template'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Save event configuration for reuse' : 'Update template details'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name *</FormLabel>
                <FormControl><Input placeholder="e.g., Weekly Basketball Practice" {...field} /></FormControl>
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
              <FormField control={form.control} name="durationMins" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 90" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Optional description..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Venue Presets
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', address: '', city: '', state: '', country: '' })}>
                <Plus className="mr-1 h-4 w-4" /> Add Venue
              </Button>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 rounded-md border p-3 bg-muted/20">
                  <div className="flex-1 grid gap-2 sm:grid-cols-2">
                    <FormField control={form.control} name={`venues.${index}.name`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Venue name" className="h-9" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`venues.${index}.city`} render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="City" className="h-9" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
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
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
