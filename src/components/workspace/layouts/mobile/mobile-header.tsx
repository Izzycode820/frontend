'use client';

import React, { useState } from 'react';
import { useTheme } from '@/utils/ThemeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/shadcn-ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn-ui/avatar';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { IconSettings, IconSun, IconMoon, IconBell } from '@tabler/icons-react';
import type { UserConfig } from '@/types/workspace/dashboard-ui/workspace';
import { NotificationPanel } from '@/components/workspace/store/notifications';
import { useNotificationSocket } from '@/components/workspace/store/notifications/use-notification-socket';
import { ApolloProvider } from '@apollo/client/react';
import { notificationClient } from '@/services/graphql/clients';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';
import { getStoreSidebarConfig } from '@/components/workspace/store/config/sidebar';

interface MobileHeaderProps {
    user: UserConfig;
    workspaceId: string;
}

function MobileHeaderInner({ user, workspaceId }: MobileHeaderProps) {
    const { setTheme } = useTheme();
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const { unreadCount } = useNotificationSocket();
    const pathname = usePathname();

    // Get sidebar config to find active route context
    const sidebarConfig = getStoreSidebarConfig(workspaceId, user);

    const getNavItemLabel = (item: any): string => {
        return item.title || item.name || '';
    };

    // Helper to find active item and its optional children/siblings
    const findActiveContext = () => {
        // 1. Check Main Nav
        for (const item of sidebarConfig.navMain) {
            // Check children FIRST
            if (item.items) {
                const activeChild = item.items.find(child => child.url === pathname);
                if (activeChild) {
                    // Dedup siblings by URL
                    const siblings = [item, ...item.items];
                    const uniqueSiblings = siblings.filter((obj, index, self) =>
                        index === self.findIndex((t) => t.url === obj.url)
                    );

                    return {
                        current: activeChild,
                        parent: item,
                        siblings: uniqueSiblings
                    };
                }
            }
            // Check top level
            if (pathname === item.url) {
                return {
                    current: item,
                    parent: item,
                    siblings: item.items && item.items.length > 0 ? [item, ...item.items] : null
                };
            }
        }

        // 2. Check Sections (Sales Channels etc)
        for (const section of sidebarConfig.navSections || []) {
            for (const item of section.items) {
                // Check children FIRST
                if (item.items) {
                    const activeChild = item.items.find(child => child.url === pathname);
                    if (activeChild) {
                        // Dedup siblings by URL
                        const siblings = [item, ...item.items];
                        const uniqueSiblings = siblings.filter((obj, index, self) =>
                            index === self.findIndex((t) => t.url === obj.url)
                        );
                        return { current: activeChild, parent: item, siblings: uniqueSiblings };
                    }
                }
                // Check parent
                if (pathname === item.url) {
                    // If items exist, check if any child has SAME url (redirect case)
                    // If so, maybe prefer child label? But sticking to parent is safer default unless navigateToFirstChild
                    // For now, just return parent
                    return { current: item, parent: item, siblings: item.items ? [item, ...item.items] : null };
                }
            }
        }

        // 3. Check Secondary
        for (const item of sidebarConfig.navSecondary) {
            if (pathname === item.url) return { current: item, parent: item, siblings: null };
        }

        return null;
    };

    const activeContext = findActiveContext();
    const showSecondaryNav = activeContext && activeContext.siblings;
    const pageTitle = activeContext ? getNavItemLabel(activeContext.current) : 'Store';

    return (
        <>
            <header className="sticky top-0 z-40 w-full flex flex-col md:hidden">
                {/* Main Top Bar */}
                <div className="h-14 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b">
                    {/* Left: User Avatar */}
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 transition-transform active:scale-95">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">My Store</span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1">
                        {/* Notification Bell */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full relative"
                            onClick={() => setNotificationPanelOpen(true)}
                        >
                            <IconBell className="h-[1.2rem] w-[1.2rem]" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className={cn(
                                        'absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]',
                                        'flex items-center justify-center rounded-full'
                                    )}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                            )}
                            <span className="sr-only">Notifications</span>
                        </Button>

                        {/* Theme Dropdown (Compact) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <IconSun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <IconMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[120px] min-w-0">
                                <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 text-xs">
                                    <IconSun className="h-3.5 w-3.5" /> Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 text-xs">
                                    <IconMoon className="h-3.5 w-3.5" /> Dark
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Settings Button */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <IconSettings className="h-5 w-5 opacity-70" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </div>
                </div>

                {/* Secondary Navigation Bar */}
                {activeContext && (
                    <div className="h-10 bg-zinc-900 dark:bg-zinc-950 text-white flex items-center px-4 relative z-50">
                        {showSecondaryNav ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium focus:outline-none group">
                                    {pageTitle}
                                    <IconChevronDown className="h-4 w-4 opacity-70 group-data-[state=open]:rotate-180 transition-transform" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-56 mt-1 bg-zinc-900 border-zinc-800 text-white p-1"
                                >
                                    {activeContext.siblings!.map((item: any) => {
                                        const isItemActive = pathname === item.url;
                                        return (
                                            <DropdownMenuItem key={item.url} asChild>
                                                <Link
                                                    href={item.url}
                                                    className={cn(
                                                        "flex items-center justify-between gap-2 cursor-pointer focus:bg-zinc-800 focus:text-white",
                                                        isItemActive && "bg-zinc-800"
                                                    )}
                                                >
                                                    <span>{getNavItemLabel(item)}</span>
                                                    {isItemActive && <IconCheck className="h-4 w-4" />}
                                                </Link>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <span className="text-sm font-medium">{pageTitle}</span>
                        )}
                    </div>
                )}
            </header>

            {/* Notification Panel (slides from bottom) */}
            <NotificationPanel
                open={notificationPanelOpen}
                onOpenChange={setNotificationPanelOpen}
                workspaceId={workspaceId}
            />
        </>
    );
}

export function MobileHeader(props: MobileHeaderProps) {
    return (
        <ApolloProvider client={notificationClient}>
            <MobileHeaderInner {...props} />
        </ApolloProvider>
    );
}

