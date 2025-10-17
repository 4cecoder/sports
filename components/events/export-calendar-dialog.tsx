'use client';

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportToCalendar } from '@/lib/actions/calendar-export';
import { toast } from 'sonner';
import { format, addMonths } from 'date-fns';

interface ExportCalendarDialogProps {
  trigger?: React.ReactNode;
  availableSportTypes?: string[];
}

export function ExportCalendarDialog({ trigger, availableSportTypes = [] }: ExportCalendarDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sportType, setSportType] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
      setStartDate(today);
      setEndDate(nextMonth);
      setSportType('');
    }
  }, [open]);

  const handleExport = () => {
    startTransition(async () => {
      try {
        const result = await exportToCalendar({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sportType: sportType || undefined,
        });

        if (result.success) {
          // Create a blob and download the file
          const blob = new Blob([result.data.icsContent], {
            type: 'text/calendar;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;

          // Generate filename with date range
          let filename = 'fastbreak-events';
          if (startDate && endDate) {
            filename += `-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}`;
          } else if (startDate) {
            filename += `-from-${format(new Date(startDate), 'yyyy-MM-dd')}`;
          } else if (endDate) {
            filename += `-until-${format(new Date(endDate), 'yyyy-MM-dd')}`;
          }
          if (sportType) {
            filename += `-${sportType.toLowerCase().replace(/\s+/g, '-')}`;
          }
          filename += '.ics';

          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success(`Exported ${result.data.eventCount} event(s) to calendar`);
          setOpen(false);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export calendar');
      }
    });
  };

  const handleQuickPreset = (preset: 'week' | 'month' | 'quarter' | 'all') => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    switch (preset) {
      case 'week':
        setStartDate(todayStr);
        setEndDate(format(addMonths(today, 0.25), 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(todayStr);
        setEndDate(format(addMonths(today, 1), 'yyyy-MM-dd'));
        break;
      case 'quarter':
        setStartDate(todayStr);
        setEndDate(format(addMonths(today, 3), 'yyyy-MM-dd'));
        break;
      case 'all':
        setStartDate('');
        setEndDate('');
        break;
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSportType('');
  };

  const hasFilters = startDate || endDate || sportType;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Export to Calendar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Export Events</DialogTitle>
              <DialogDescription className="mt-1">
                Download your events as .ics file for Google Calendar, Apple Calendar, Outlook, and more
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Quick Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Quick Select</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPreset('week')}
                className="justify-start hover:bg-primary/10 hover:border-primary"
              >
                <Calendar className="h-3 w-3 mr-2" />
                Next 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPreset('month')}
                className="justify-start hover:bg-primary/10 hover:border-primary"
              >
                <Calendar className="h-3 w-3 mr-2" />
                Next Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPreset('quarter')}
                className="justify-start hover:bg-primary/10 hover:border-primary"
              >
                <Calendar className="h-3 w-3 mr-2" />
                Next 3 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickPreset('all')}
                className="justify-start hover:bg-primary/10 hover:border-primary"
              >
                <Calendar className="h-3 w-3 mr-2" />
                All Events
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Custom Date Range</Label>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                  From
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                  To
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Sport Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="sportType" className="text-sm font-semibold">
              Filter by Sport
            </Label>
            <Select value={sportType || "all"} onValueChange={(value) => setSportType(value === "all" ? "" : value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sports</SelectItem>
                {availableSportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Preview */}
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">Ready to Export</p>
                <p className="text-xs text-muted-foreground">
                  {startDate && endDate
                    ? `Events from ${format(new Date(startDate), 'MMM d, yyyy')} to ${format(new Date(endDate), 'MMM d, yyyy')}`
                    : startDate
                    ? `Events from ${format(new Date(startDate), 'MMM d, yyyy')} onwards`
                    : endDate
                    ? `Events until ${format(new Date(endDate), 'MMM d, yyyy')}`
                    : 'All events'}
                  {sportType && ` • ${sportType} only`}
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">What&apos;s included</p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-0.5">
                  <li>• Event name and sport type</li>
                  <li>• Date and time (2-hour duration)</li>
                  <li>• Venue location and details</li>
                  <li>• Event description</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleExport}
              disabled={isPending}
              className="flex-1 h-11 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Calendar File
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-11"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
