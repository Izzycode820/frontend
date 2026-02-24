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
import { LinkSelectorList, LinkResult } from '@/components/puck-editor/custom-uis/LinkSelectorList';
import { Link2, ChevronRight } from 'lucide-react';

interface LinkSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
}

export function LinkSelector({ value, onChange }: LinkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (result: LinkResult) => {
    // We store the URL value in Puck data
    onChange(result.value);
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
              <Link2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-start gap-0.5 max-w-[180px]">
              <span className="text-xs text-muted-foreground font-normal">
                Link URL
              </span>
              {value ? (
                <span className="text-sm font-medium truncate w-full">{value}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-normal">
                  Select or paste link
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Link</SheetTitle>
          <SheetDescription>
            Choose a page, collection, product, or enter a custom URL
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <LinkSelectorList
            selectedLink={value}
            onSelect={handleSelect}
            isOpen={isOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
