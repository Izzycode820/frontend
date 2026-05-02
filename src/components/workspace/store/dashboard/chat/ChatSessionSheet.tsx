'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shadcn-ui/sheet";
import { Button } from '@/components/shadcn-ui/button';
import { ChevronLeft, MessageSquare, Plus, Trash2, Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';

interface ChatSessionSheetProps {
  sessions: any[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: (title?: string) => void;
  onDelete: (id: string) => void;
  onRefetch?: () => void;
  isLoading: boolean;
}

/**
 * ChatSessionSheet
 * 
 * Provides thread management and session switching.
 * Triggered by the "Neon Handle" on the right side.
 */
export function ChatSessionSheet({
  sessions,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRefetch,
  isLoading
}: ChatSessionSheetProps) {
  return (
    <Sheet onOpenChange={(open) => open && onRefetch?.()}>
      {/* Neon Handle Trigger (The Red Box in image) */}
      <SheetTrigger asChild>
        <button className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group">
          <div className="relative flex items-center h-20 w-8 bg-zinc-900 md:bg-zinc-900 border-l border-y border-white/10 rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:w-10 hover:bg-indigo-600/10 group-active:scale-95">
             <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-xl"></div>
             <ChevronLeft className="size-6 text-zinc-500 group-hover:text-indigo-400 group-hover:-translate-x-1 transition-all mx-auto" />
             {/* Neon Glow Dot */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 size-1.5 bg-indigo-500 rounded-full animate-pulse blur-[1px]"></div>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[320px] bg-zinc-950 border-white/5 p-0">
        <SheetHeader className="p-6 border-b border-white/5 bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <History className="size-4 text-indigo-400" />
               <SheetTitle className="text-zinc-200">History</SheetTitle>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10"
                onClick={() => onCreate()}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] px-2 py-4">
          <div className="space-y-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-3 space-y-2">
                   <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                   <Skeleton className="h-3 w-1/2 bg-zinc-900" />
                </div>
              ))
            ) : sessions.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-40">
                  <MessageSquare className="size-8 mb-3" />
                  <p className="text-xs font-medium">No threads found</p>
                  <Button variant="link" size="sm" onClick={() => onCreate()} className="text-indigo-400">
                     Create your first session
                  </Button>
               </div>
            ) : (
                sessions.map((session) => (
                   <div 
                     key={session.id}
                     className={cn(
                        "group relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border border-transparent mb-1",
                        activeId === session.id 
                           ? "bg-indigo-500/10 border-indigo-500/20 shadow-inner" 
                           : "hover:bg-white/[0.03] hover:border-white/5"
                     )}
                     onClick={() => onSelect(session.id)}
                   >
                      <div className="flex items-center justify-between mb-1">
                         <span className={cn(
                            "text-xs font-semibold truncate flex-1",
                            activeId === session.id ? "text-indigo-300" : "text-zinc-400"
                         )}>
                           {session.title || 'Untitled Session'}
                         </span>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                            onClick={(e) => {
                               e.stopPropagation();
                               onDelete(session.id);
                            }}
                         >
                            <Trash2 className="size-3" />
                         </Button>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-medium uppercase tracking-tighter">
                         <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                         </div>
                         {activeId === session.id && (
                           <span className="text-indigo-500/80 font-bold bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10">Active</span>
                         )}
                      </div>
                   </div>
                ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
