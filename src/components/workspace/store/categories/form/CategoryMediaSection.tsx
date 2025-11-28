'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import { Button } from '@/components/shadcn-ui/button'
import { Upload, X } from 'lucide-react'
import { useState } from 'react'
import { FilesAndMediaModal } from '@/components/workspace/store/shared/files-and-media'
import type { MediaItem, MediaSelection } from '@/components/workspace/store/shared/files-and-media'

interface CategoryMediaSectionProps {
  // Media item from upload-first system
  mediaItem?: MediaItem
  onMediaChange: (item?: MediaItem) => void

  // Existing image from backend (optional - for edit mode)
  existingImage?: { id: string; url: string; width: number; height: number }
  onRemoveExisting?: (uploadId: string) => void
}

export function CategoryMediaSection({
  mediaItem,
  onMediaChange,
  existingImage,
  onRemoveExisting
}: CategoryMediaSectionProps) {
  const [showMediaModal, setShowMediaModal] = useState(false)

  const handleMediaSelect = (selection: MediaSelection) => {
    // Get first selected item
    const selectedItem = selection.newUploads[0] || selection.existingUploads[0]
    if (selectedItem) {
      onMediaChange(selectedItem)
    }
    setShowMediaModal(false)
  }

  const handleImageRemove = () => {
    // Remove from new uploads
    onMediaChange(undefined)
  }

  const handleExistingImageRemove = () => {
    // Remove existing image from backend
    if (onRemoveExisting && existingImage) {
      onRemoveExisting(existingImage.id)
    }
  }

  // Check if we have any image (existing or new)
  const hasImage = existingImage || mediaItem

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Image Preview */}
          {hasImage && (
            <div className="flex justify-center">
              <div className="relative group">
                {existingImage && !mediaItem && (
                  <>
                    <img
                      src={existingImage.url}
                      alt="Category image"
                      className="aspect-square w-64 rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleExistingImageRemove}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}

                {mediaItem && (
                  <>
                    <img
                      src={mediaItem.thumbnailUrl || mediaItem.url}
                      alt="New category image"
                      className="aspect-square w-64 rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground mb-4">
              <p>Click to select or upload a category image</p>
              <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaModal(true)}
            >
              Select image
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Tips for great category images</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use high-quality, well-lit images</li>
              <li>• Choose images that represent the category well</li>
              <li>• Use consistent aspect ratios across categories</li>
              <li>• Consider using brand colors and themes</li>
            </ul>
          </div>
        </div>
      </CardContent>

      {/* Media Modal */}
      <FilesAndMediaModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        maxSelection={1}
      />
    </Card>
  )
}