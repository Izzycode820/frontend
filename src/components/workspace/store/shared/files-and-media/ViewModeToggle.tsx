'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useTranslations } from 'next-intl'

interface ViewModeToggleProps {
  /** Current view mode */
  viewMode: 'grid' | 'list'

  /** View mode change handler */
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const t = useTranslations('Shared.media')

  return (
    <div className="inline-flex items-center border rounded-md">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="rounded-r-none border-r"
        title={t('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t('grid')}</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-l-none"
        title={t('list')}
      >
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t('list')}</span>
      </Button>
    </div>
  )
}
