import { Skeleton } from '@/components/shadcn-ui/skeleton';

export function MobileProductCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {/* Thumbnail Skeleton */}
            <Skeleton className="flex-shrink-0 w-12 h-12 rounded-lg" />

            {/* Product Info Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
                    <Skeleton className="h-3 w-20" /> {/* Category */}
                </div>
            </div>

            {/* Right Side Skeleton */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-16" /> {/* Price */}
                <Skeleton className="h-3 w-20" /> {/* Stock */}
            </div>
        </div>
    );
}
