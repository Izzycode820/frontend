'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function GenerateTab() {
  const t = useTranslations('Shared.ai');
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-primary/10 rounded-full p-6 mb-6">
        <Sparkles className="h-12 w-12 text-primary" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{t('title')}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        {t('description')}
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-xs font-medium">{t('comingSoon')}</span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-left max-w-md">
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">{t('textToImage')}</p>
          <p className="text-xs text-muted-foreground">
            {t('textToImageDesc')}
          </p>
        </div>
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">{t('bgRemoval')}</p>
          <p className="text-xs text-muted-foreground">
            {t('bgRemovalDesc')}
          </p>
        </div>
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">{t('enhancement')}</p>
          <p className="text-xs text-muted-foreground">
            {t('enhancementDesc')}
          </p>
        </div>
        <div className="border rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium">{t('variations')}</p>
          <p className="text-xs text-muted-foreground">
            {t('variationsDesc')}
          </p>
        </div>
      </div>
    </div>
  )
}
