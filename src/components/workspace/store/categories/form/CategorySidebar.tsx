'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Switch } from '@/components/shadcn-ui/switch'

interface CategorySidebarProps {
  isVisible: boolean
  isFeatured: boolean
  sortOrder: number
  onIsVisibleChange: (isVisible: boolean) => void
  onIsFeaturedChange: (isFeatured: boolean) => void
  onSortOrderChange: (sortOrder: number) => void
}

export function CategorySidebar({
  isVisible,
  isFeatured,
  sortOrder,
  onIsVisibleChange,
  onIsFeaturedChange,
  onSortOrderChange,
}: CategorySidebarProps) {
  return (
    <div className="space-y-6">
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-visible">Visible</Label>
              <p className="text-sm text-muted-foreground">
                Show on store
              </p>
            </div>
            <Switch
              id="sidebar-visible"
              checked={isVisible}
              onCheckedChange={onIsVisibleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-featured">Featured</Label>
              <p className="text-sm text-muted-foreground">
                Show on homepage
              </p>
            </div>
            <Switch
              id="sidebar-featured"
              checked={isFeatured}
              onCheckedChange={onIsFeaturedChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta title</Label>
            <Input
              id="meta-title"
              placeholder="Page title for search engines"
            />
            <p className="text-xs text-muted-foreground">
              0 of 60 characters used
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta description</Label>
            <textarea
              id="meta-description"
              placeholder="Page description for search engines"
              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              0 of 160 characters used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sidebar-sort-order">Sort Order</Label>
            <Input
              id="sidebar-sort-order"
              type="number"
              placeholder="0"
              value={sortOrder}
              onChange={(e) => onSortOrderChange(Number(e.target.value))}
              min="0"
              max="999"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-sm">Category Preview</div>
              <div className="text-xs">Will appear here</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}