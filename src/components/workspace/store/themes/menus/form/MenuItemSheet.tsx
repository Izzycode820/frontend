'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/shadcn-ui/sheet';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { useTranslations } from 'next-intl';
import { LinkPicker, LinkResult, LinkType } from './LinkPicker';

export interface MenuItemData {
  id?: string;
  title: string;
  type: LinkType;
  value: string;
  pageId?: string;       // For backend FK
  blogId?: string;       // For backend FK
  articleId?: string;    // For backend FK
  collectionId?: string; // For backend FK
  url?: string;          // Derived or explicit
}

interface MenuItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: MenuItemData | null;
  onSave: (item: MenuItemData) => void;
  workspaceId: string;
}

export function MenuItemSheet({ open, onOpenChange, initialItem, onSave, workspaceId }: MenuItemSheetProps) {
  const t = useTranslations('Themes');
  const [title, setTitle] = useState('');
  const [linkValue, setLinkValue] = useState(''); // Display value for the picker button
  const [currentItem, setCurrentItem] = useState<Partial<MenuItemData>>({
      type: 'HTTP',
      value: ''
  });

  // Reset or load initial data when sheet opens
  useEffect(() => {
     if (open && initialItem) {
         setTitle(initialItem.title);
         setLinkValue(initialItem.value); // Or logic to show "Collection: Summer"
         setCurrentItem(initialItem);
     } else if (open && !initialItem) {
         setTitle('');
         setLinkValue('');
         setCurrentItem({ type: 'HTTP', value: '' });
     }
  }, [open, initialItem]);

  const handleLinkChange = (result: LinkResult) => {
      // Update link display
      setLinkValue(result.title); // e.g. "Summer Collection"
      
      // Update item data
      const newItem: Partial<MenuItemData> = {
          ...currentItem,
          type: result.type,
          value: result.value, // ID or Slug or URL
      };

      // Handle robust linking IDs
      if (result.type === 'PAGE' && result.id) {
          newItem.pageId = result.id;
      }
      if (result.type === 'COLLECTION' && result.id) {
          newItem.collectionId = result.id;
      }
      if (result.type === 'BLOG' && result.id) {
          newItem.blogId = result.id;
      }
      if (result.type === 'ARTICLE' && result.id) {
          newItem.articleId = result.id;
      }

      setCurrentItem(newItem);

      // Auto-fill title if empty
      if (!title) {
          setTitle(result.title);
      }
  };

  const handleSave = () => {
      if (!title) return; // Add validation UI if needed
      
      onSave({
          id: initialItem?.id,
          title,
          type: currentItem.type || 'HTTP',
          value: currentItem.value || '',
          pageId: currentItem.pageId,
          blogId: currentItem.blogId,
          articleId: currentItem.articleId,
          collectionId: currentItem.collectionId
      });
      onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>{initialItem ? t('menus.form.editItem') : t('menus.form.addItemSheet')}</SheetTitle>
          <SheetDescription>
            {t('menus.form.itemDescription')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('menus.form.nameLabel')}</Label>
            <Input 
                id="name" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder={t('menus.form.namePlaceholder')} 
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('menus.form.linkLabel')}</Label>
            <LinkPicker 
                value={linkValue} 
                onChange={handleLinkChange} 
                workspaceId={workspaceId}
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSave}>
              {initialItem ? t('menus.form.saveChanges') : t('menus.form.add')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
