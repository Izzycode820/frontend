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
import { LinkPicker, LinkResult, LinkType } from './LinkPicker';

export interface MenuItemData {
  id?: string;
  title: string;
  type: LinkType;
  value: string;
  pageId?: string;       // For backend FK
  collectionId?: string; // For backend FK
  url?: string;          // Derived or explicit
}

interface MenuItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: MenuItemData | null;
  onSave: (item: MenuItemData) => void;
}

export function MenuItemSheet({ open, onOpenChange, initialItem, onSave }: MenuItemSheetProps) {
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
          collectionId: currentItem.collectionId
      });
      onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>{initialItem ? 'Edit menu item' : 'Add menu item'}</SheetTitle>
          <SheetDescription>
            Configure the link and label for this navigation item.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input 
                id="name" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. About Us" 
            />
          </div>

          <div className="grid gap-2">
            <Label>Link</Label>
            <LinkPicker 
                value={linkValue} 
                onChange={handleLinkChange} 
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
              {initialItem ? 'Save changes' : 'Add'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
