'use client'

/**
 * Duplicate Product Modal
 *
 * Allows users to:
 * 1. Provide custom name for duplicated product
 * 2. Or use suggested auto-generated name
 * 3. Backend handles slug generation in both cases
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { useTranslations } from 'next-intl'

interface DuplicateProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  onConfirm: (customName: string | null, copyVariants: boolean, copyInventory: boolean) => void
  isLoading?: boolean
}

export function DuplicateProductModal({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isLoading = false,
}: DuplicateProductModalProps) {
  const t = useTranslations('Products.duplicateModal')
  // Suggested name (user can edit or leave as-is)
  const suggestedName = `${productName} ${t('copySuffix')}`

  const [customName, setCustomName] = useState(suggestedName)
  const [copyVariants, setCopyVariants] = useState(true)
  const [copyInventory, setCopyInventory] = useState(false)

  // Reset form when modal opens with new product
  useEffect(() => {
    if (open) {
      setCustomName(suggestedName)
      setCopyVariants(true)
      setCopyInventory(false)
    }
  }, [open, suggestedName])

  const handleConfirm = () => {
    // Always send the name to satisfy strict backend requirements
    const nameToSend = customName.trim()

    onConfirm(nameToSend, copyVariants, copyInventory)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description', { name: productName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Name Input */}
          <div className="space-y-2">
            <Label htmlFor="product-name">{t('fields.name')}</Label>
            <Input
              id="product-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('fields.namePlaceholder')}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {t('fields.nameHint')}
            </p>
          </div>

          {/* Copy Options */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium">{t('options.title')}</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-variants"
                checked={copyVariants}
                onCheckedChange={(checked) => setCopyVariants(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="copy-variants"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t('options.copyVariants')}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-inventory"
                checked={copyInventory}
                onCheckedChange={(checked) => setCopyInventory(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="copy-inventory"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t('options.copyInventory')}
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !customName.trim()}
          >
            {isLoading ? t('buttons.duplicating') : t('buttons.duplicate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
