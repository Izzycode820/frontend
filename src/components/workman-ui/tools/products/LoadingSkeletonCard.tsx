import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSkeletonCard({ label }: { label?: string }) {
  return (
    <div className="mt-3 w-full max-w-[320px] rounded-2xl bg-[#111111] border border-white/5 overflow-hidden animate-pulse relative">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />

      {/* Header row skeleton */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5 relative z-10">
        <div className="size-9 rounded-xl bg-zinc-800/60 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-zinc-800/60 rounded w-3/4" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-1/2" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="px-4 py-3 space-y-2 relative z-10">
        <div className="flex justify-between">
          <div className="h-2 bg-zinc-800/60 rounded w-1/4" />
          <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
        </div>
        <div className="h-2 bg-zinc-800/60 rounded w-full" />
        <div className="h-2 bg-zinc-800/60 rounded w-5/6" />
      </div>

      {/* Footer label */}
      {label && (
        <div className="flex items-center gap-2 px-4 pb-4 text-indigo-400/70 text-[11px] font-medium relative z-10">
          <RefreshCw className="size-3 animate-spin" />
          {label}
        </div>
      )}
    </div>
  );
}
