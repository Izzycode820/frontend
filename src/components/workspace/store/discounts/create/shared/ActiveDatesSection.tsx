'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Label } from '@/components/shadcn-ui/label';
import { Input } from '@/components/shadcn-ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ActiveDatesSectionProps {
  startsAt: string;
  endsAt?: string;
  onStartsAtChange: (date: string) => void;
  onEndsAtChange: (date: string | undefined) => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function ActiveDatesSection({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
}: ActiveDatesSectionProps) {
  const t = useTranslations('Discounts');

  // Helper to parse/format dates safely
  const getDateParts = (isoString?: string) => {
    if (!isoString) return { date: '', time: '00:00' };
    const dateObj = new Date(isoString);
    // Use local time for inputs
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  };

  const { date: startDate, time: startTime } = getDateParts(startsAt);
  const { date: endDate, time: endTime } = getDateParts(endsAt);

  const handleUpdate = (type: 'start' | 'end', part: 'date' | 'time', value: string) => {
    const currentIso = type === 'start' ? startsAt : (endsAt || new Date().toISOString());
    const currentObj = new Date(currentIso);

    if (part === 'date') {
      const [year, month, day] = value.split('-').map(Number);
      currentObj.setFullYear(year, month - 1, day);
    } else {
      const [hours, minutes] = value.split(':').map(Number);
      currentObj.setHours(hours, minutes);
    }

    const newIso = currentObj.toISOString();

    if (type === 'start') {
      onStartsAtChange(newIso);
    } else {
      onEndsAtChange(newIso);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.activeDates.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Start Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">{t('form.activeDates.startDate')}</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => handleUpdate('start', 'date', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time">{t('form.activeDates.startTime')}</Label>
            <Select
              value={startTime}
              onValueChange={(val) => handleUpdate('start', 'time', val)}
            >
              <SelectTrigger id="start-time" className="w-full">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder={t('form.activeDates.selectTime')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* End Date Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="end-date">{t('form.activeDates.endDate')}</Label>
          </div>

          {!endsAt ? (
            <button
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => onEndsAtChange(new Date().toISOString())}
            >
              {t('form.activeDates.setEndDate')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleUpdate('end', 'date', e.target.value)}
                />
              </div>
              <div className="space-y-2 relative">
                <Select
                  value={endTime}
                  onValueChange={(val) => handleUpdate('end', 'time', val)}
                >
                  <SelectTrigger id="end-time">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={t('form.activeDates.selectTime')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => onEndsAtChange(undefined)}
                  className="absolute -top-6 right-0 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  {t('form.activeDates.removeEndDate')}
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
