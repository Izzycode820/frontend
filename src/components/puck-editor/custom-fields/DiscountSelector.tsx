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
import { DiscountSelectorList } from '@/components/puck-editor/custom-uis/DiscountSelectorList';
import { Ticket, ChevronRight } from 'lucide-react';

interface DiscountSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
}

export function DiscountSelector({ value, onChange }: DiscountSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (code: string) => {
    onChange(code);
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
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs text-muted-foreground font-normal">
                Discount Code
              </span>
              {value ? (
                <span className="text-sm font-bold uppercase">{value}</span>
              ) : (
                <span className="text-sm text-muted-foreground font-normal">
                  Select a discount
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Select Discount</SheetTitle>
          <SheetDescription>
            Choose which discount code to link to this section
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <DiscountSelectorList
            selectedCode={value}
            onSelect={handleSelect}
            isOpen={isOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
