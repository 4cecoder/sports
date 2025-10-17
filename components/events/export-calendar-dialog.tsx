'use client';

import { useState, useTransition } from 'react';
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
import { Calendar, Download, Loader2 } from 'lucide-react';
import { exportToCalendar } from '@/lib/actions/calendar-export';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Events to Calendar</DialogTitle>
          <DialogDescription>
            Download an .ics file to import your events into Google Calendar, Apple Calendar, Outlook, or any calendar app.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Date Range */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="All events from..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="All events until..."
              />
            </div>
          </div>

          {/* Sport Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="sportType">Sport Type (optional)</Label>
            <Select value={sportType || "all"} onValueChange={(value) => setSportType(value === "all" ? "" : value)}>
              <SelectTrigger>
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
            <p className="text-xs text-muted-foreground">
              Select a sport to filter exported events
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-medium mb-1">What will be exported:</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Event name and sport type</li>
              <li>• Date and time (2-hour duration)</li>
              <li>• Venue information and location</li>
              <li>• Event description</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleExport}
              disabled={isPending}
              className="flex-1 gap-2"
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
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
