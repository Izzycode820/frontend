'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function WhatsAppPage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspace_id as string;

    useEffect(() => {
        router.replace(`/workspace/${workspaceId}/store/whatsapp/overview`);
    }, [workspaceId, router]);

    return (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
        </div>
    );
}
