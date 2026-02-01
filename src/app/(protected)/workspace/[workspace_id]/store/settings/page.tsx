'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileSettingsList } from '@/components/workspace/store/settings/ui/MobileSettingsList';

const MOBILE_BREAKPOINT = 768;

export default function SettingsPage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspace_id as string;
    const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'pending'>('pending');
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Debounced check to ensure viewport is stable before deciding
        // This prevents race conditions during hydration
        let timeoutId: NodeJS.Timeout;

        const checkDevice = () => {
            const width = window.innerWidth;
            const isMobileWidth = width < MOBILE_BREAKPOINT;
            setDeviceType(isMobileWidth ? 'mobile' : 'desktop');
        };

        // Initial check after a brief delay to let viewport stabilize
        timeoutId = setTimeout(checkDevice, 50);

        // Also listen for resize in case viewport changes
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkDevice, 50);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // Only redirect to general on desktop, and only once
        if (deviceType === 'desktop' && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(`/workspace/${workspaceId}/store/settings/general`);
        }
    }, [deviceType, workspaceId, router]);

    // Pending: show mobile list optimistically (better UX than spinner)
    // This way mobile users see content immediately
    if (deviceType === 'pending' || deviceType === 'mobile') {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Settings</h1>
                <MobileSettingsList />
            </div>
        );
    }

    // Desktop: show loading while redirecting to general
    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
        </div>
    );
}
