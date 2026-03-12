'use client';

import React, { useState } from 'react';
import { Button } from '@/components/shadcn-ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/shadcn-ui/sheet';
import { MenuSelectorList } from '@/components/puck-editor/custom-uis/MenuSelectorList';
import { Menu, ChevronRight } from 'lucide-react';

interface MenuSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
}

export function MenuSelector({ value, onChange }: MenuSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (handle: string) => {
    onChange(handle);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto py-3 px-4"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Menu className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs text-muted-foreground font-normal">
                Navigation Menu
              </span>
              {value ? (
                <span className="text-sm font-medium">{value}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-normal">
                  Select a menu
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Menu</SheetTitle>
          <SheetDescription>
            Choose a navigation menu from your dashboard to display as this column
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <MenuSelectorList
            selectedHandle={value}
            onSelect={handleSelect}
            isOpen={isOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
