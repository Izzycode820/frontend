'use client';

import { Skeleton } from "@/components/shadcn-ui/skeleton";

export function WhatsAppInboxSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-screen-xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-11 w-full md:w-80 rounded-xl" />
      </div>

      {/* List Skeleton */}
      <div className="flex flex-col gap-2 rounded-2xl border p-2 bg-card/10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-xl border bg-background/40">
            <div className="flex gap-4">
              <Skeleton className="size-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
