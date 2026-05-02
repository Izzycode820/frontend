'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PositionPickerProps {
    value: string;
    onChange: (value: string) => void;
    name: string;
}

const POSITIONS = [
    { id: 'top-left', label: 'Top Left' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'middle-left', label: 'Middle Left' },
    { id: 'middle-center', label: 'Middle Center' },
    { id: 'middle-right', label: 'Middle Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'bottom-right', label: 'Bottom Right' },
];

export function PositionPicker({ value, onChange }: PositionPickerProps) {
    const currentValue = value || 'bottom-center';

    return (
        <div className="grid grid-cols-3 gap-1 w-full aspect-square max-w-[150px] border border-border p-1 bg-muted/20 rounded-lg">
            {POSITIONS.map((pos) => (
                <button
                    key={pos.id}
                    type="button"
                    title={pos.label}
                    onClick={() => onChange(pos.id)}
                    className={cn(
                        "w-full h-full border border-border transition-all flex items-center justify-center",
                        currentValue === pos.id 
                            ? "bg-primary border-primary shadow-sm scale-105 z-10" 
                            : "bg-background hover:bg-muted"
                    )}
                >
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        currentValue === pos.id ? "bg-primary-foreground" : "bg-muted-foreground/30"
                    )} />
                </button>
            ))}
        </div>
    );
}
