"use client"

/**
 * Universal Workspace Sidebar
 * shadcn design - simplified structure with collapsible sections
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { IconChevronDown, IconChevronRight, IconCornerDownRight, IconLogout, IconUser } from "@tabler/icons-react"
import type { WorkspaceSidebarConfig } from "@/types/workspace/dashboard-ui/workspace"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/shadcn-ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shadcn-ui/collapsible"
import { NotificationBell } from "@/components/workspace/store/notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/shadcn-ui/dropdown-menu"
import { useAuth } from "@/hooks/authentication/useAuth"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface WorkspaceSidebarProps {
  config: WorkspaceSidebarConfig
}

export function WorkspaceSidebar({ config }: WorkspaceSidebarProps) {
  const t = useTranslations('Dashboard.navigation')
  const at = useTranslations('Authentication.logout')
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [openMainItem, setOpenMainItem] = useState<string | null>(null)
  const [openSectionItem, setOpenSectionItem] = useState<string | null>(null)

  // Handle logout with navigation
  const handleLogout = async () => {
    try {
      await logout()
      toast.success(at('success'))
    } catch (error) {
      console.error("Logout error:", error)
    }
  }


  return (
    <div className="flex h-full flex-col gap-2">
      {/* Workspace Header - shadcn style */}
      <div className="flex h-14 items-center border-b px-4 justify-between">
        <Link
          href={config.workspaceConfig.url || "#"}
          className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-foreground/80"
        >
          <config.workspaceConfig.icon className="h-5 w-5" />
          <span className="text-base">{t(config.workspaceConfig.name)}</span>
        </Link>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider dark:bg-blue-900/40 dark:text-blue-300">
          Beta
        </span>
      </div>

      {/* Main Navigation - shadcn style with collapsible support */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {config.navMain.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url
          const hasSubItems = item.items && item.items.length > 0

          // If item has sub-items, render as collapsible with accordion behavior
          if (hasSubItems) {
            const isOpen = openMainItem === item.title

            // Label-only parent: clicking navigates to first child and opens dropdown
            if (item.navigateToFirstChild) {
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setOpenMainItem(open ? item.title : null)
                  }}
                >
                  <Link
                    href={item.items![0].url}
                    onClick={() => setOpenMainItem(item.title)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="flex-1 text-left">{t(item.title)}</span>
                    <IconChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </Link>
                  <CollapsibleContent className="pl-6 space-y-1 pt-1">
                    {item.items!.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.url}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )}
                        >
                          {isSubActive && <IconCornerDownRight className="h-3 w-3" />}
                          <span>{t(subItem.title)}</span>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            // Navigable parent: split button (icon/text navigates, chevron toggles)
            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={(open) => {
                  setOpenMainItem(open ? item.title : null)
                }}
              >
                <div className="flex items-center gap-0">
                  <Link
                    href={item.url}
                    onClick={() => setOpenMainItem(item.title)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-1",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="flex-1 text-left">{t(item.title)}</span>
                  </Link>
                  <CollapsibleTrigger className="p-2 hover:bg-sidebar-accent rounded-md transition-colors">
                    <IconChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="pl-6 space-y-1 pt-1">
                  {item.items!.map((subItem) => {
                    const isSubActive = pathname === subItem.url
                    return (
                      <Link
                        key={subItem.title}
                        href={subItem.url}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        {isSubActive && <IconCornerDownRight className="h-3 w-3" />}
                        <span>{t(subItem.title)}</span>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          // Regular nav item without sub-items
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{t(item.title)}</span>
            </Link>
          )
        })}

        {/* Sections (Sales channels, Apps, etc.) - shadcn style with collapsible */}
        {config.navSections?.map((section) => (
          <Collapsible key={section.label} defaultOpen={section.defaultOpen ?? true} className="pt-4">
            <CollapsibleTrigger className="w-full group">
              <div className="flex items-center justify-between px-2 mb-1">
                <h3 className="text-xs font-semibold text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors">
                  {section.label}
                </h3>
                <IconChevronDown className="h-3 w-3 text-sidebar-foreground/70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                const hasSubItems = item.items && item.items.length > 0

                // If section item has sub-items (e.g., Online Store -> Themes, Preferences)
                if (hasSubItems) {
                  const isOpen = openSectionItem === item.name

                  // Label-only parent: clicking navigates to first child and opens dropdown
                  if (item.navigateToFirstChild) {
                    return (
                      <Collapsible
                        key={item.name}
                        open={isOpen}
                        onOpenChange={(open) => {
                          setOpenSectionItem(open ? item.name : null)
                        }}
                      >
                        <Link
                          href={item.items![0].url}
                          onClick={() => setOpenSectionItem(item.name)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="flex-1 text-left">{t(item.name)}</span>
                          <IconChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-90"
                          )} />
                        </Link>
                        <CollapsibleContent className="pl-6 space-y-1 pt-1">
                          {item.items!.map((subItem) => {
                            const isSubActive = pathname === subItem.url
                            return (
                              <Link
                                key={subItem.title}
                                href={subItem.url}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                  isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                )}
                              >
                                {isSubActive && <IconCornerDownRight className="h-3 w-3" />}
                                <span>{t(subItem.title)}</span>
                              </Link>
                            )
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  }

                  // Navigable parent: split button (icon/text navigates, chevron toggles)
                  return (
                    <Collapsible
                      key={item.name}
                      open={isOpen}
                      onOpenChange={(open) => {
                        setOpenSectionItem(open ? item.name : null)
                      }}
                    >
                      <div className="flex items-center gap-0">
                        <Link
                          href={item.url}
                          onClick={() => setOpenSectionItem(item.name)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-1",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="flex-1 text-left">{t(item.name)}</span>
                        </Link>
                        <CollapsibleTrigger className="p-2 hover:bg-sidebar-accent rounded-md transition-colors">
                          <IconChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-90"
                          )} />
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="pl-6 space-y-1 pt-1">
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname === subItem.url
                          return (
                            <Link
                              key={subItem.title}
                              href={subItem.url}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              )}
                            >
                              {isSubActive && <IconCornerDownRight className="h-3 w-3" />}
                              <span>{t(subItem.title)}</span>
                            </Link>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                // Regular section item without sub-items
                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{t(item.name)}</span>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </nav>

      {/* Secondary Navigation (Settings, etc.) - shadcn style */}
      <div className="space-y-1 border-t px-2 py-2">
        {config.navSecondary.map((item) => {
          // Special handling for Notifications
          if (item.url.startsWith("#notifications")) {
            // Extract workspaceId from the URL string: #notifications:workspaceId
            const workspaceId = item.url.split(':')[1]

            if (!workspaceId) return null

            return (
              <NotificationBell
                key={item.title}
                workspaceId={workspaceId}
                className="w-full justify-start px-2 py-2 h-auto font-medium"
              />
            )
          }

          const Icon = item.icon
          const isActive = pathname === item.url

          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{t(item.title)}</span>
            </Link>
          )
        })}
      </div>

      {/* User Footer - shadcn style with Avatar */}
      <div className="border-t p-4 space-y-3">
        {/* Footer Actions (Security: Leave Workspace, etc.) */}
        <div className="pb-2">
          {config.footerActions}
        </div>


        {/* User Info with Logout Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-md p-2 -m-2 hover:bg-sidebar-accent transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {config.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden text-left">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {config.user.name}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/70">
                  {config.user.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <div className="px-2 py-1.5 border-b">
              <p className="text-sm font-medium truncate">{config.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{config.user.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex w-full cursor-pointer items-center"
              >
                <IconUser className="mr-2 h-4 w-4" />
                <span>{t('profile') || 'Profile'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <IconLogout className="h-4 w-4 mr-2" />
              {t('signOut') || 'Sign Out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
