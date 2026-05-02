'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FieldRowProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    error?: string;
}

export function FieldRow({ label, children, className, error }: FieldRowProps) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">
                {label}
            </label>
            <div className="relative group">
                {children}
            </div>
            {error && <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{error}</p>}
        </div>
    );
}
