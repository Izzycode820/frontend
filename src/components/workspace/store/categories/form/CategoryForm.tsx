'use client'

import { useState } from 'react'
import { Button } from '@/components/shadcn-ui/button'
import { Card } from '@/components/shadcn-ui/card'
import { CategoryTitleSection } from './CategoryTitleSection'
import { CategoryMediaSection } from './CategoryMediaSection'
import { CategoryVisibilitySection } from './CategoryVisibilitySection'
import { CategorySidebar } from './CategorySidebar'
import { Save, Eye } from 'lucide-react'
import type { MediaItem } from '@/components/workspace/store/shared/files-and-media'

// Form data based on CreateCategory mutation variables
// name, description, featuredMediaId, isVisible, isFeatured, sortOrder
export interface CategoryFormData {
  name: string
  description?: string
  mediaItem?: MediaItem  // UI-only: manages category image
  featuredMediaId?: string  // Backend: upload ID for featured image
  isVisible: boolean
  isFeatured: boolean
  sortOrder?: number
}

export interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>
  onSubmit?: (data: CategoryFormData) => void
  onSaveDraft?: (data: CategoryFormData) => void
  onPreview?: () => void
  isEditing?: boolean
  isLoading?: boolean
  existingImage?: { id: string; url: string; width: number; height: number }
  onRemoveExistingImage?: (uploadId: string) => void
}

export function CategoryForm({
  initialData,
  onSubmit,
  onSaveDraft,
  onPreview,
  isEditing = false,
  isLoading = false,
  existingImage,
  onRemoveExistingImage,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    mediaItem: undefined,
    featuredMediaId: undefined,
    isVisible: true,
    isFeatured: false,
    sortOrder: 0,
    ...initialData,
  })

  const updateFormData = (updates: Partial<CategoryFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSubmit = () => {
    // Extract featuredMediaId from mediaItem for backend
    const submitData: CategoryFormData = {
      ...formData,
      featuredMediaId: formData.mediaItem?.uploadId,
    }

    onSubmit?.(submitData)
  }

  const handleSaveDraft = () => {
    onSaveDraft?.(formData)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Form Column */}
      <div className="flex-1 space-y-6">
        <CategoryTitleSection
          name={formData.name}
          description={formData.description || ''}
          onNameChange={(name) => updateFormData({ name })}
          onDescriptionChange={(description) => updateFormData({ description })}
        />

        <CategoryMediaSection
          mediaItem={formData.mediaItem}
          onMediaChange={(mediaItem) => updateFormData({ mediaItem })}
          existingImage={existingImage}
          onRemoveExisting={onRemoveExistingImage}
        />

        <CategoryVisibilitySection
          isVisible={formData.isVisible}
          isFeatured={formData.isFeatured}
          sortOrder={formData.sortOrder || 0}
          onIsVisibleChange={(isVisible) => updateFormData({ isVisible })}
          onIsFeaturedChange={(isFeatured) => updateFormData({ isFeatured })}
          onSortOrderChange={(sortOrder) => updateFormData({ sortOrder })}
        />
      </div>

      {/* Sidebar Column */}
      <div className="lg:w-80 space-y-6">
        <CategorySidebar
          isVisible={formData.isVisible}
          isFeatured={formData.isFeatured}
          sortOrder={formData.sortOrder || 0}
          onIsVisibleChange={(isVisible) => updateFormData({ isVisible })}
          onIsFeaturedChange={(isFeatured) => updateFormData({ isFeatured })}
          onSortOrderChange={(sortOrder) => updateFormData({ sortOrder })}
        />

        {/* Action Buttons */}
        <Card className="p-4 space-y-3 sticky top-6">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save draft
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update category' : 'Publish category')}
            </Button>
          </div>

          <Button
            onClick={onPreview}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </Card>
      </div>
    </div>
  )
}