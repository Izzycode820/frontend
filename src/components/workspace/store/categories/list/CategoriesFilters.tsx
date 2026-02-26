'use client'

import { useState } from 'react'
import { Input } from '@/components/shadcn-ui/input'
import { Button } from '@/components/shadcn-ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import { Search, Filter, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CategoriesFiltersProps {
  searchValue?: string
  onSearchChange?: (search: string) => void
  visibilityFilter?: string
  onVisibilityFilterChange?: (visibility: string) => void
  featuredFilter?: string
  onFeaturedFilterChange?: (featured: string) => void
}

export function CategoriesFilters({
  searchValue,
  onSearchChange,
  visibilityFilter,
  onVisibilityFilterChange,
  featuredFilter,
  onFeaturedFilterChange,
}: CategoriesFiltersProps) {
  const t = useTranslations('Categories.filters');
  const [search, setSearch] = useState(searchValue || '')
  const [visibilityFilterLocal, setVisibilityFilterLocal] = useState(visibilityFilter || '')
  const [featuredFilterLocal, setFeaturedFilterLocal] = useState(featuredFilter || '')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange?.(value)
  }

  const handleVisibilityChange = (value: string) => {
    setVisibilityFilterLocal(value)
    onVisibilityFilterChange?.(value)
  }

  const handleFeaturedChange = (value: string) => {
    setFeaturedFilterLocal(value)
    onFeaturedFilterChange?.(value)
  }

  const clearFilters = () => {
    setSearch('')
    setVisibilityFilterLocal('')
    setFeaturedFilterLocal('')
    onSearchChange?.('')
    onVisibilityFilterChange?.('')
    onFeaturedFilterChange?.('')
  }

  const hasActiveFilters = search || visibilityFilterLocal || featuredFilterLocal

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('filters')}
              {hasActiveFilters && (
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('visibility')}</label>
              <Select
                value={visibilityFilterLocal || 'all'}
                onValueChange={(val) => handleVisibilityChange(val === 'all' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allVisibility')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allVisibility')}</SelectItem>
                  <SelectItem value="visible">{t('visible')}</SelectItem>
                  <SelectItem value="hidden">{t('hidden')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('featured')}</label>
              <Select
                value={featuredFilterLocal || 'all'}
                onValueChange={(val) => handleFeaturedChange(val === 'all' ? '' : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  <SelectItem value="featured">{t('featuredOnly')}</SelectItem>
                  <SelectItem value="not-featured">{t('notFeatured')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('clearFilters')}
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('activeFilters')}</span>
          {search && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('search')} "{search}"
            </span>
          )}
          {visibilityFilterLocal && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('visibilityLabel')} {t(visibilityFilterLocal as any)}
            </span>
          )}
          {featuredFilterLocal && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('featuredLabel')} {t(featuredFilterLocal === 'featured' ? 'featuredOnly' : 'notFeatured')}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            {t('clearAll')}
          </Button>
        </div>
      )}
    </div>
  )
}