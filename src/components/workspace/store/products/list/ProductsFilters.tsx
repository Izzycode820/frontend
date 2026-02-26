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
import {
  PRODUCT_STATUS_OPTIONS
} from './constants'
import { useTranslations } from 'next-intl'

interface ProductsFiltersProps {
  searchValue?: string
  onSearchChange?: (search: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  categoryFilter?: string
  onCategoryFilterChange?: (category: string) => void
  categories?: { value: string; label: string }[]
}

export function ProductsFilters({
  searchValue = '',
  onSearchChange,
  statusFilter = '',
  onStatusFilterChange,
  categoryFilter = '',
  onCategoryFilterChange,
  categories = [],
}: ProductsFiltersProps) {
  const t = useTranslations('Products');
  // Use props directly, no internal state for values


  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
  }

  const handleStatusChange = (value: string) => {
    onStatusFilterChange?.(value)
  }

  const handleCategoryChange = (value: string) => {
    onCategoryFilterChange?.(value)
  }



  const clearFilters = () => {
    onSearchChange?.('')
    onStatusFilterChange?.('')
    onCategoryFilterChange?.('')
  }

  const hasActiveFilters = searchValue || statusFilter || categoryFilter

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('filters.filters')}
              {hasActiveFilters && (
                <div className="h-2 w-2 rounded-full bg-primary"></div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('filters.status')}</label>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`filters.${option.label.toLowerCase() as any}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('filters.category')}</label>
                <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('filters.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                    {categories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Type filter removed as backend does not support it yet */}

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('filters.clearFilters')}
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('filters.activeFilters')}</span>
          {searchValue && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('filters.search')} "{searchValue}"
            </span>
          )}
          {statusFilter && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('filters.status')}: {t(`filters.${statusFilter.toLowerCase() as any}`)}
            </span>
          )}
          {categoryFilter && (
            <span className="bg-muted px-2 py-1 rounded text-xs">
              {t('filters.category')}: {categories.find(c => c.value === categoryFilter)?.label || categoryFilter}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            {t('filters.clearAll')}
          </Button>
        </div>
      )}
    </div>
  )
}