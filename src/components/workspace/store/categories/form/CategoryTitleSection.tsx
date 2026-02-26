'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Label } from '@/components/shadcn-ui/label'
import { useTranslations } from 'next-intl'

interface CategoryTitleSectionProps {
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function CategoryTitleSection({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: CategoryTitleSectionProps) {
  const t = useTranslations('Categories.form.titleDescription')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sectionTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">{t('titleLabelRequired')}</Label>
          <Input
            id="category-name"
            placeholder={t('titlePlaceholder')}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">{t('descriptionLabel')}</Label>
          <Textarea
            id="category-description"
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            {t('descriptionHelp')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}