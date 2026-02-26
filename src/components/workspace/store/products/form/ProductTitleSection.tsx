'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Label } from '@/components/shadcn-ui/label'
import { useTranslations } from 'next-intl'

interface ProductTitleSectionProps {
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function ProductTitleSection({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: ProductTitleSectionProps) {
  const t = useTranslations('Products.form.info');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">{t('nameWithAsterisk')}</Label>
          <Input
            id="product-name"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">{t('description')}</Label>
          <Textarea
            id="product-description"
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={6}
          />
          <p className="text-sm text-muted-foreground">
            {t('descriptionHint')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}