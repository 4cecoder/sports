'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LeagueFormSchema, type LeagueFormValues } from '@/lib/validation/schemas';
import { createLeague } from '@/lib/actions/scheduling-actions';
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
import { Plus, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface LeagueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeagueFormDialog({ open, onOpenChange }: LeagueFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeagueFormValues>({
    resolver: zodResolver(LeagueFormSchema),
    defaultValues: {
      name: '',
      sportType: '',
      seasonStart: '',
      seasonEnd: '',
      scheduleType: 'round_robin',
      teamNames: ['', ''],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teamNames' as never,
  });

  const teamNames = form.watch('teamNames');

  const onSubmit = async (values: LeagueFormValues) => {
    const filteredTeams = values.teamNames.filter((n) => n.trim());
    if (filteredTeams.length < 2) {
      toast.error('At least 2 teams are required');
      return;
    }
    setIsSubmitting(true);
    const result = await createLeague({
      ...values,
      teamNames: filteredTeams,
    });

    if (result.success) {
      toast.success('League created');
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
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Create League
          </DialogTitle>
          <DialogDescription>Set up a league with teams and schedule type</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>League Name *</FormLabel>
                <FormControl><Input placeholder="e.g., Summer Basketball League" {...field} /></FormControl>
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
              <FormField control={form.control} name="scheduleType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="single_elimination">Single Elimination</SelectItem>
                      <SelectItem value="double_elimination">Double Elimination</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="seasonStart" render={({ field }) => (
                <FormItem>
                  <FormLabel>Season Start *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="seasonEnd" render={({ field }) => (
                <FormItem>
                  <FormLabel>Season End *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Teams ({teamNames.length})</span>
              <Button type="button" variant="outline" size="sm" onClick={() => append('' as never)}>
                <Plus className="mr-1 h-4 w-4" /> Add Team
              </Button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input
                    placeholder={`Team ${index + 1}`}
                    className="h-9"
                    {...form.register(`teamNames.${index}`)}
                  />
                  {fields.length > 2 && (
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
                {isSubmitting ? 'Creating...' : 'Create League'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
