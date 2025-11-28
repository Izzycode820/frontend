'use client'

import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'
import { Search } from 'lucide-react'

interface SearchAndFiltersProps {
  /** Search query */
  search: string

  /** Search change handler */
  onSearchChange: (value: string) => void

  /** Sort by */
  sortBy: 'date' | 'name' | 'size'

  /** Sort by change handler */
  onSortByChange: (value: 'date' | 'name' | 'size') => void

  /** Sort order */
  sortOrder: 'asc' | 'desc'

  /** Sort order change handler */
  onSortOrderChange: (value: 'asc' | 'desc') => void
}

export function SearchAndFilters({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: SearchAndFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="media-search">Search files</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="media-search"
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date uploaded</SelectItem>
            <SelectItem value="name">File name</SelectItem>
            <SelectItem value="size">File size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label>Order</Label>
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">
              {sortBy === 'date' ? 'Newest first' : 'Largest first'}
            </SelectItem>
            <SelectItem value="asc">
              {sortBy === 'date' ? 'Oldest first' : 'Smallest first'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
