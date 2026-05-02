"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/shadcn-ui/button"
import { Sparkles, ShoppingBag, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn-ui/tooltip"

interface ThreadToolsSidebarProps {
  activeTab: 'strategy' | 'catalog'
  onTabChange: (tab: 'strategy' | 'catalog') => void
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function ThreadToolsSidebar({
  activeTab,
  onTabChange,
  children,
  footer,
  className
}: ThreadToolsSidebarProps) {
  return (
    <div className={cn("flex h-full w-full bg-background border-l", className)}>
      {/* Vertical Navigation (Icons Only) */}
      <nav className="flex w-14 shrink-0 flex-col items-center border-r bg-muted/5 py-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange('strategy')}
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
                  activeTab === 'strategy' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <Sparkles className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Strategic Advisor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onTabChange('catalog')}
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-all duration-200",
                  activeTab === 'catalog' 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <ShoppingBag className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Product Catalog</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Action Footer (Send/Cancel) */}
        {footer && (
          <footer className="shrink-0 border-t p-4 bg-background/80 backdrop-blur-md animate-in slide-in-from-bottom-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
