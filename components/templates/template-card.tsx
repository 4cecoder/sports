'use client';

import { useState } from 'react';
import { type EventTemplate } from '@/lib/db/schema';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Play, Edit, Trash2 } from 'lucide-react';
import { deleteTemplate } from '@/lib/actions/template-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { TemplateFormDialog } from './template-form-dialog';
import { UseTemplateDialog } from './use-template-dialog';

interface TemplateCardProps {
  template: EventTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUseOpen, setIsUseOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const venueConfig = (template.venueConfig ?? []) as Array<{ name: string }>;

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTemplate({ id: template.id });
    if (result.success) {
      toast.success('Template deleted');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <Card className="glow-hover group flex flex-col overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="line-clamp-1 text-lg font-semibold group-hover:text-primary transition-colors">
            {template.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {template.sportType}
            </Badge>
            {template.durationMins && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {template.durationMins} min
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          {template.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{template.description}</p>
          )}
          {venueConfig.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {venueConfig.length} venue{venueConfig.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 border-t border-border/50 bg-muted/20 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            onClick={() => setIsUseOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Use
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <TemplateFormDialog open={isEditOpen} onOpenChange={setIsEditOpen} mode="edit" template={template} />
      <UseTemplateDialog open={isUseOpen} onOpenChange={setIsUseOpen} template={template} />
    </>
  );
}
