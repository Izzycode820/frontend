'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'
import { Button } from '@/components/shadcn-ui/button'
import { useMediaSelection } from './hooks/useMediaSelection'
import { MediaLibrary } from './MediaLibrary'
import { UrlTab } from './tabs/UrlTab'
import { GenerateTab } from './tabs/GenerateTab'
import { SearchAndFilters } from './SearchAndFilters'
import { ViewModeToggle } from './ViewModeToggle'
import type { MediaModalProps, MediaItem } from './types'
import { Link, Sparkles } from 'lucide-react'

export function FilesAndMediaModal({
  open,
  onClose,
  onSelect,
  allowedTypes = ['image', 'video', '3d_model'],
  maxSelection,
  selectedItems = [],
}: MediaModalProps) {
  const [activeTab, setActiveTab] = useState('library')
  const {
    selectedIds,
    toggleSelect,
    clearSelection,
    selectedCount,
  } = useMediaSelection(maxSelection)

  // Search and filter state
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Track newly uploaded items
  const [newlyUploaded, setNewlyUploaded] = useState<MediaItem[]>([])

  // Track items selected from library
  const [librarySelected, setLibrarySelected] = useState<MediaItem[]>([])

  // Store clearUploads function from MediaLibrary (Shopify pattern)
  const clearUploadsRef = useRef<(() => void) | null>(null)
  const handleClearUploads = (clearFn: () => void) => {
    clearUploadsRef.current = clearFn
  }

  // Auto-select newly uploaded items
  const handleUploadsComplete = (items: MediaItem[]) => {
    setNewlyUploaded((prev) => [...prev, ...items])
    items.forEach((item) => {
      if (!selectedIds.has(item.uploadId)) {
        toggleSelect(item.uploadId)
      }
    })
  }

  // Handle URL upload complete
  const handleUrlUploadComplete = (item: MediaItem) => {
    handleUploadsComplete([item])
  }

  // Handle selection from library
  const handleLibrarySelect = (uploadId: string, item: MediaItem) => {
    toggleSelect(uploadId)

    // Add or remove from librarySelected
    setLibrarySelected((prev) => {
      const exists = prev.some((i) => i.uploadId === uploadId)
      if (exists) {
        return prev.filter((i) => i.uploadId !== uploadId)
      } else {
        return [...prev, item]
      }
    })
  }

  // Handle selection confirmation
  const handleConfirm = () => {
    // Get selected items: newly uploaded + items from library
    const selectedNewUploads = newlyUploaded.filter((item) =>
      selectedIds.has(item.uploadId)
    )
    const selectedLibraryItems = librarySelected.filter((item) =>
      selectedIds.has(item.uploadId)
    )

    onSelect({
      newUploads: selectedNewUploads,
      existingUploads: selectedLibraryItems,
    })

    // Reset state
    clearSelection()
    setNewlyUploaded([])
    setLibrarySelected([])
    setSearch('')
    onClose()
  }

  // Handle cancel - Clear optimistic uploads (Shopify pattern)
  const handleCancel = () => {
    clearSelection()
    setNewlyUploaded([])
    setLibrarySelected([])
    setSearch('')

    // Clear optimistic uploads on modal close
    if (clearUploadsRef.current) {
      clearUploadsRef.current()
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-[95vw] w-[1000px] h-[85vh] max-h-[900px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select files</DialogTitle>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left Side: Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Bar: View Mode (left) and Tabs (center) */}
            <div className="flex items-center justify-between mb-4">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="library">Media Library</TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="generate" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Generate
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="w-[140px]" /> {/* Spacer for balance */}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} className="h-full flex flex-col">
                <TabsContent value="library" className="flex-1 mt-0 overflow-hidden">
                  <MediaLibrary
                    selectedIds={selectedIds}
                    onToggleSelect={handleLibrarySelect}
                    allowedTypes={allowedTypes}
                    maxSelection={maxSelection}
                    search={search}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    viewMode={viewMode}
                    onUploadsComplete={handleUploadsComplete}
                    onClearUploads={handleClearUploads}
                  />
                </TabsContent>

                <TabsContent value="url" className="flex-1 mt-0 overflow-auto">
                  <UrlTab onUploadComplete={handleUrlUploadComplete} />
                </TabsContent>

                <TabsContent value="generate" className="flex-1 mt-0 overflow-auto">
                  <GenerateTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar: Search & Filters */}
          <div className="w-64 flex-shrink-0 border-l pl-6">
            <SearchAndFilters
              search={search}
              onSearchChange={setSearch}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row justify-between items-center border-t pt-4 mt-4">
          <div className="text-sm text-muted-foreground">
            {selectedCount > 0 && (
              <span>
                {selectedCount} selected
                {maxSelection && ` (max ${maxSelection})`}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedCount === 0}>
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
