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
import { ProductSelectorList } from '@/components/puck-editor/custom-uis/ProductSelectorList';
import { Package, ChevronRight } from 'lucide-react';

interface ProductSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
}

export function ProductSelector({ value, onChange }: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (slug: string) => {
    onChange(slug);
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
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs text-muted-foreground font-normal">
                Product
              </span>
              {value ? (
                <span className="text-sm font-medium">{value}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-normal">
                  Select a product
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Product</SheetTitle>
          <SheetDescription>
            Choose a product to link to this video item
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <ProductSelectorList
            selectedSlug={value}
            onSelect={handleSelect}
            isOpen={isOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
