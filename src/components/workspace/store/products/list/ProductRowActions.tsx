'use client'

import { useState } from 'react'
import { Button } from '@/components/shadcn-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/shadcn-ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn-ui/popover'
import { Check, ChevronsUpDown, FolderPlus, FolderMinus, MoreHorizontal, Edit, Copy, Trash2, Eye } from 'lucide-react'
import { useMutation, useQuery } from '@apollo/client/react'
import { AddProductsToCategoryDocument } from '@/services/graphql/admin-store/mutations/categories/__generated__/addProductsToCategory.generated'
import { RemoveProductsFromCategoryDocument } from '@/services/graphql/admin-store/mutations/categories/__generated__/removeProductsFromCategory.generated'
import { CategoriesDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/categories.generated'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Product {
  id: string
  name: string
  status: 'published' | 'archived'
}

interface ProductRowActionsProps {
  product: Product
  onEdit?: (productId: string) => void
  onDuplicate?: (productId: string) => void
  onDelete?: (productId: string) => void
  onView?: (productId: string) => void
  onCategoryUpdate?: () => void
}

export function ProductRowActions({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onCategoryUpdate,
}: ProductRowActionsProps) {
  const t = useTranslations('Products.table')
  const tm = useTranslations('Products.messages')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [showRemoveCategoryDialog, setShowRemoveCategoryDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // GraphQL mutations
  const [addProductsToCategory] = useMutation(AddProductsToCategoryDocument)
  const [removeProductsFromCategory] = useMutation(RemoveProductsFromCategoryDocument)

  // Fetch categories
  const { data: categoriesData } = useQuery(CategoriesDocument, {
    variables: { first: 100, isVisible: true }
  })

  const categories = categoriesData?.categories?.edges?.map(edge => edge?.node).filter(Boolean) || []

  const handleEdit = () => {
    onEdit?.(product.id)
  }

  const handleDuplicate = () => {
    onDuplicate?.(product.id)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handleView = () => {
    onView?.(product.id)
  }

  const confirmDelete = () => {
    onDelete?.(product.id)
    setShowDeleteDialog(false)
  }

  const handleAddToCategory = () => {
    setShowAddCategoryDialog(true)
  }

  const handleRemoveFromCategory = () => {
    setShowRemoveCategoryDialog(true)
  }

  const confirmAddToCategory = async () => {
    if (!selectedCategory) {
      toast.error(tm('selectCategory'))
      return
    }

    try {
      const { data } = await addProductsToCategory({
        variables: {
          categoryId: selectedCategory,
          productIds: [product.id]
        }
      })

      if (data?.addProductsToCategory?.success) {
        toast.success(tm('addedToCategory', { count: 1 }))
        setShowAddCategoryDialog(false)
        setSelectedCategory('')
        onCategoryUpdate?.()
      } else {
        toast.error(data?.addProductsToCategory?.error || tm('addCategoryFailed'))
      }
    } catch (err: any) {
      toast.error(err.message || tm('addCategoryFailed'))
      console.error('Add to category error:', err)
    }
  }

  const confirmRemoveFromCategory = async () => {
    if (!selectedCategory) {
      toast.error(tm('selectCategory'))
      return
    }

    try {
      const { data } = await removeProductsFromCategory({
        variables: {
          categoryId: selectedCategory,
          productIds: [product.id]
        }
      })

      if (data?.removeProductsFromCategory?.success) {
        toast.success(tm('removedFromCategory', { count: 1 }))
        setShowRemoveCategoryDialog(false)
        setSelectedCategory('')
        onCategoryUpdate?.()
      } else {
        toast.error(data?.removeProductsFromCategory?.error || tm('removeCategoryFailed'))
      }
    } catch (err: any) {
      toast.error(err.message || tm('removeCategoryFailed'))
      console.error('Remove from category error:', err)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t('actions.openMenu')}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            {t('actions.view')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {t('actions.edit')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            {t('actions.duplicate')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddToCategory}>
            <FolderPlus className="mr-2 h-4 w-4" />
            {t('actions.addToCategory')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemoveFromCategory}>
            <FolderMinus className="mr-2 h-4 w-4" />
            {t('actions.removeFromCategory')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('actions.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.deleteDescription', { name: product.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add to Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.addCategoryTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.addCategoryDescription', { name: product.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedCategory
                    ? categories.find((category) => category?.id === selectedCategory)?.name
                    : t('dialogs.selectCategoryPlaceholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t('dialogs.searchCategoriesPlaceholder')} />
                  <CommandList>
                    <CommandEmpty>{t('dialogs.noCategoryFound')}</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category?.id}
                          value={category?.id || ''}
                          onSelect={() => setSelectedCategory(category?.id || '')}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory === category?.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category?.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddCategoryDialog(false)}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={confirmAddToCategory}>
              {t('dialogs.addToCategory')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove from Category Dialog */}
      <Dialog open={showRemoveCategoryDialog} onOpenChange={setShowRemoveCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialogs.removeCategoryTitle')}</DialogTitle>
            <DialogDescription>
              {t('dialogs.removeCategoryDescription', { name: product.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedCategory
                    ? categories.find((category) => category?.id === selectedCategory)?.name
                    : t('dialogs.selectCategoryPlaceholder')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder={t('dialogs.searchCategoriesPlaceholder')} />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category?.id}
                          value={category?.id || ''}
                          onSelect={() => setSelectedCategory(category?.id || '')}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory === category?.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category?.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveCategoryDialog(false)}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={confirmRemoveFromCategory}>
              {t('dialogs.removeFromCategory')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}