'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IconX, IconChevronDown, IconChevronRight, IconBell, IconLogout } from '@tabler/icons-react';
import { Drawer, DrawerContent, DrawerClose, DrawerTitle } from '@/components/shadcn-ui/drawer';
import type { WorkspaceSidebarConfig } from "@/types/workspace/dashboard-ui/workspace";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shadcn-ui/collapsible";
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { NotificationPanel } from '@/components/workspace/store/notifications';
import { useNotificationSocket } from '@/components/workspace/store/notifications/use-notification-socket';
import { ApolloProvider } from '@apollo/client/react';
import { notificationClient } from '@/services/graphql/clients';
import { useAuth } from '@/hooks/authentication/useAuth';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface MobileMenuDrawerProps {
    config: WorkspaceSidebarConfig;
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

function MobileMenuDrawerInner({ config, isOpen, onClose }: MobileMenuDrawerProps) {
    const t = useTranslations('Dashboard.navigation');
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const [openCollapsible, setOpenCollapsible] = React.useState<string | null>(null);
    const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const { unreadCount } = useNotificationSocket();

    // Handle logout with navigation
    const handleLogout = async () => {
        try {
            onClose(false); // Close menu first
            await logout();
            toast.success('Signed out successfully');
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            router.replace('/auth/login');
        }
    };

    // Extract workspaceId from the notifications URL pattern
    const getWorkspaceIdFromNotificationUrl = (url: string): string | null => {
        if (url.startsWith('#notifications:')) {
            return url.split(':')[1] || null;
        }
        return null;
    };

    // Handle notification item click
    const handleNotificationClick = () => {
        // Close the menu drawer first
        onClose(false);
        // Wait a bit for smooth transition, then open notification panel
        setTimeout(() => {
            setNotificationPanelOpen(true);
        }, 150);
    };

    // Get workspaceId for notification panel from config
    const notificationItem = config.navSecondary.find(item => item.url.startsWith('#notifications:'));
    const workspaceId = notificationItem ? getWorkspaceIdFromNotificationUrl(notificationItem.url) : null;

    return (
        <>
            <Drawer open={isOpen} onOpenChange={onClose}>
                <DrawerContent className="bg-black text-white border-zinc-800 h-[85vh]">
                    <div className="flex flex-col h-full overflow-y-auto px-4 py-6">

                        {/* Header with Close Button */}
                        <div className="flex justify-between items-center mb-6">
                            <DrawerTitle className="text-lg font-semibold">{t('menu')}</DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800 text-white">
                                    <IconX className="w-5 h-5" />
                                </Button>
                            </DrawerClose>
                        </div>

                        {/* Navigation List */}
                        <div className="flex flex-col gap-1">
                            {/* Main Nav */}
                            {config.navMain.map((item) => {
                                const Icon = item.icon;
                                const hasChildren = item.items && item.items.length > 0;
                                const isActive = pathname.startsWith(item.url);
                                const isOpen = openCollapsible === item.title;

                                if (hasChildren) {
                                    return (
                                        <Collapsible
                                            key={item.title}
                                            open={isOpen}
                                            onOpenChange={(open) => setOpenCollapsible(open ? item.title : null)}
                                        >
                                            <div className="flex items-center justify-between py-3 px-2 rounded-lg active:bg-zinc-900">
                                                <Link
                                                    href={item.url}
                                                    onClick={() => onClose(false)}
                                                    className="flex items-center gap-3 flex-1"
                                                >
                                                    {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
                                                    <span className="text-base font-medium">{t(item.title)}</span>
                                                </Link>
                                                <CollapsibleTrigger asChild>
                                                    <button className="p-1">
                                                        <IconChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
                                                    </button>
                                                </CollapsibleTrigger>
                                            </div>
                                            <CollapsibleContent className="pl-10 space-y-2 py-1">
                                                {item.items!.map(sub => (
                                                    <Link
                                                        key={sub.title}
                                                        href={sub.url}
                                                        onClick={() => onClose(false)}
                                                        className="block py-2 text-sm text-zinc-400 hover:text-white"
                                                    >
                                                        {t(sub.title)}
                                                    </Link>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        onClick={() => onClose(false)}
                                        className={cn(
                                            "flex items-center gap-3 py-3 px-2 rounded-lg active:bg-zinc-900",
                                            isActive ? "text-white" : "text-zinc-300"
                                        )}
                                    >
                                        {Icon && <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400")} />}
                                        <span className="text-base font-medium">{t(item.title)}</span>
                                    </Link>
                                );
                            })}

                            {/* Sales Channels / Nav Sections */}
                            {config.navSections && config.navSections.length > 0 && (
                                <>
                                    <div className="my-4 h-px bg-zinc-900" />
                                    {config.navSections.map((section) => (
                                        <div key={section.label} className="mb-2">
                                            <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">
                                                {t(section.label)}
                                            </span>

                                            {section.items.map((sectionItem) => {
                                                const SectionIcon = sectionItem.icon;
                                                const hasSubItems = sectionItem.items && sectionItem.items.length > 0;
                                                const isOpen = openCollapsible === sectionItem.name;

                                                if (hasSubItems) {
                                                    return (
                                                        <Collapsible
                                                            key={sectionItem.name}
                                                            open={isOpen}
                                                            onOpenChange={(open) => setOpenCollapsible(open ? sectionItem.name : null)}
                                                        >
                                                            <div className="flex items-center justify-between py-3 px-2 rounded-lg active:bg-zinc-900">
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    {SectionIcon && <SectionIcon className="w-5 h-5 text-zinc-400" />}
                                                                    <span className="text-base font-medium text-zinc-300">{t(sectionItem.name)}</span>
                                                                </div>
                                                                <CollapsibleTrigger asChild>
                                                                    <button className="p-1">
                                                                        <IconChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
                                                                    </button>
                                                                </CollapsibleTrigger>
                                                            </div>
                                                            <CollapsibleContent className="pl-10 space-y-2 py-1">
                                                                {sectionItem.items!.map(sub => (
                                                                    <Link
                                                                        key={sub.title}
                                                                        href={sub.url}
                                                                        onClick={() => onClose(false)}
                                                                        className="block py-2 text-sm text-zinc-400 hover:text-white"
                                                                    >
                                                                        {t(sub.title)}
                                                                    </Link>
                                                                ))}
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={sectionItem.name}
                                                        href={sectionItem.url}
                                                        onClick={() => onClose(false)}
                                                        className="flex items-center gap-3 py-3 px-2 rounded-lg active:bg-zinc-900 text-zinc-300"
                                                    >
                                                        {SectionIcon && <SectionIcon className="w-5 h-5 text-zinc-400" />}
                                                        <span className="text-base font-medium">{t(sectionItem.name)}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Divider */}
                            <div className="my-4 h-px bg-zinc-900" />

                            {/* Secondary/Settings - with special handling for Notifications */}
                            {config.navSecondary.map((item) => {
                                const Icon = item.icon;

                                // Special handling for notifications
                                if (item.url.startsWith('#notifications:')) {
                                    return (
                                        <button
                                            key={item.title}
                                            onClick={handleNotificationClick}
                                            className="flex items-center gap-3 py-3 px-2 rounded-lg active:bg-zinc-900 text-zinc-300 w-full text-left"
                                        >
                                            <div className="relative">
                                                <IconBell className="w-5 h-5 text-zinc-400" />
                                                {unreadCount > 0 && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full"
                                                    >
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-base font-medium">{t(item.title)}</span>
                                            {unreadCount > 0 && (
                                                <Badge variant="secondary" className="ml-auto rounded-full px-2 text-xs">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        onClick={() => onClose(false)}
                                        className="flex items-center gap-3 py-3 px-2 rounded-lg active:bg-zinc-900 text-zinc-300"
                                    >
                                        {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
                                        <span className="text-base font-medium">{t(item.title)}</span>
                                    </Link>
                                );
                            })}

                            {/* Divider before Sign Out */}
                            <div className="my-4 h-px bg-zinc-900" />

                            {/* Sign Out Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 py-3 px-2 rounded-lg active:bg-red-900/30 text-red-400 w-full text-left hover:bg-red-900/20 transition-colors"
                            >
                                <IconLogout className="w-5 h-5" />
                                <span className="text-base font-medium">{t('signOut')}</span>
                            </button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Notification Panel (slides from bottom) */}
            {workspaceId && (
                <NotificationPanel
                    open={notificationPanelOpen}
                    onOpenChange={setNotificationPanelOpen}
                    workspaceId={workspaceId}
                />
            )}
        </>
    );
}

export function MobileMenuDrawer(props: MobileMenuDrawerProps) {
    return (
        <ApolloProvider client={notificationClient}>
            <MobileMenuDrawerInner {...props} />
        </ApolloProvider>
    );
}

