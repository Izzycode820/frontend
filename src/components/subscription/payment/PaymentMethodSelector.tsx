"use client";

import React from 'react';
import { Smartphone } from 'lucide-react';
import { Label } from '@/components/shadcn-ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn-ui/radio-group';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  value: 'mtn' | 'orange';
  onChange: (value: 'mtn' | 'orange') => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Payment Method Selector Component
 * Clean visual selector for MTN/Orange (Fapshi gateway)
 * Minimal shadcn aesthetic
 */
export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  className
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <Label>Select provider</Label>
      <RadioGroup
        value={value}
        onValueChange={(v: string) => onChange(v as 'mtn' | 'orange')}
        disabled={disabled}
      >
        <div className="grid grid-cols-2 gap-4">
          <Label
            htmlFor="mtn"
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
              value === 'mtn' && "border-primary"
            )}
          >
            <RadioGroupItem value="mtn" id="mtn" className="sr-only" />
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
              <Smartphone className="w-6 h-6 text-black" />
            </div>
            <span className="text-sm font-medium">MTN</span>
          </Label>

          <Label
            htmlFor="orange"
            className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
              value === 'orange' && "border-primary"
            )}
          >
            <RadioGroupItem value="orange" id="orange" className="sr-only" />
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Orange</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
