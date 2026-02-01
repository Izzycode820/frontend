import React from 'react';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

export function ThemeCardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/40">
                <Skeleton className="h-full w-full" />
            </div>

            {/* Content Skeleton */}
            <div className="space-y-2">
                {/* Title */}
                <Skeleton className="h-5 w-3/4" />

                {/* Price / Subtext */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
        </div>
    );
}
