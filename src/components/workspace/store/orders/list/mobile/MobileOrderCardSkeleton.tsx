import { Skeleton } from '@/components/shadcn-ui/skeleton';

export function MobileOrderCardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-4">
            {/* Top Row: Order # and Status */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Middle Row: Customer Info */}
            <div className="flex items-center gap-3 py-2 border-t border-b border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Bottom Row: Total and Date */}
            <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}
