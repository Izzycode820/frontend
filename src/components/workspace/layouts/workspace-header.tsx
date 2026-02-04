"use client"

/**
 * Universal Workspace Header
 * shadcn design - clean and simple
 */

import { ThemeSelector } from "@/components/workspace/layouts/theme-selector"
import { ModeToggle } from "@/components/workspace/layouts/mode-toggle"

interface WorkspaceHeaderProps {
  title: string
  actions?: React.ReactNode
}

export function WorkspaceHeader({ title, actions }: WorkspaceHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="text-base font-medium">{title}</h1>

      <div className="flex items-center gap-2">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfcpaZGM5yEZX-PX-eQXq0o-SsfHR6N22Bi1AfvqiJubfddhQ/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          title="Report a problem"
        >
          <span className="mr-2">🐛</span> Report a Problem
        </a>
        {actions}
        <ThemeSelector />
        <ModeToggle />
      </div>
    </div>
  )
}
