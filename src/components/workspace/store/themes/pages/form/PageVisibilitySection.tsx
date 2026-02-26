'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shadcn-ui/button';
import { Calendar } from '@/components/shadcn-ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn-ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { useTranslations } from 'next-intl';

interface PageVisibilitySectionProps {
  isPublished: boolean;
  publishedAt: string | null;
  onVisibilityChange: (isPublished: boolean) => void;
  onDateChange: (date: string | null) => void;
}

export function PageVisibilitySection({
  isPublished,
  publishedAt,
  onVisibilityChange,
  onDateChange,
}: PageVisibilitySectionProps) {
  const t = useTranslations('Themes');
  
  const dateValue = publishedAt ? new Date(publishedAt) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages.form.visibility')}</CardTitle>
        <CardDescription>
          {t('pages.form.visibilityDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={isPublished ? 'visible' : 'hidden'}
          onValueChange={(value) => onVisibilityChange(value === 'visible')}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="visible" id="vis-visible" />
            <Label htmlFor="vis-visible" className="cursor-pointer">{t('pages.table.published')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hidden" id="vis-hidden" />
            <Label htmlFor="vis-hidden" className="cursor-pointer">{t('pages.table.hidden')}</Label>
          </div>
        </RadioGroup>

        <div className="pt-2 border-t">
            <Label className="text-sm text-muted-foreground mb-2 block">{t('pages.form.publishDate')}</Label>
            <Popover>
            <PopoverTrigger asChild>
                <Button
                variant={"outline"}
                className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateValue && "text-muted-foreground"
                )}
                >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateValue ? format(dateValue, "PPP") : <span>{t('pages.form.pickDate')}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => onDateChange(date ? date.toISOString() : null)}
                initialFocus
                className="rounded-md border shadow-sm"
                />
            </PopoverContent>
            </Popover>
             <p className="text-xs text-muted-foreground mt-1">
                {isPublished ? t('pages.form.isLive') : t('pages.form.isHidden')} {dateValue && `${t('pages.form.scheduledFor')} ${format(dateValue, "PPP")}`}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
