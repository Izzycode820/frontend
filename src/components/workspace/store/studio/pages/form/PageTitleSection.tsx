'use client';

import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { RichTextEditor } from '@/components/workspace/store/shared/RichTextEditor';
import { useTranslations } from 'next-intl';

interface PageTitleSectionProps {
  title: string;
  onTitleChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  errors?: Record<string, string>;
}

export function PageTitleSection({
  title,
  onTitleChange,
  body,
  onBodyChange,
  errors = {},
}: PageTitleSectionProps) {
  const t = useTranslations('Studio');
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('pages.form.title')}</Label>
          <Input
            id="title"
            placeholder={t('pages.form.titlePlaceholder')}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t('pages.form.content')}</Label>
          <div className={errors.body ? 'border rounded-md border-destructive' : ''}>
             <RichTextEditor
                value={body}
                onChange={onBodyChange}
                placeholder={t('pages.form.contentPlaceholder')}
             />
          </div>
           {errors.body && (
            <p className="text-sm text-destructive">{errors.body}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
