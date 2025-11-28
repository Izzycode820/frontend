"use client"

/**
 * Universal Workspace Layout
 * Simple shadcn design - no complex peer selectors
 * Same beautiful UI, cleaner code
 */

import { ReactNode } from "react"

interface WorkspaceLayoutProps {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
}

export function WorkspaceLayout({ sidebar, header, children }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Fixed 288px (18rem) width like shadcn, scrollable */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto border-r bg-sidebar text-sidebar-foreground">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header - Same height as shadcn example */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-colors lg:px-6">
          {header}
        </header>

        {/* Page Content - Scrollable, same bg as shadcn */}
        <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
