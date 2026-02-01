'use client';

import { useParams, useRouter } from 'next/navigation';
import { ApolloProvider } from '@apollo/client/react';
import { notificationClient } from '@/services/graphql/clients';
import { NotificationSettingsPage } from '@/components/workspace/store/settings/notifications/NotificationSettingsPage';
import { Button } from '@/components/shadcn-ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotificationsPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspace_id as string;

    return (
        <ApolloProvider client={notificationClient}>
            {/* Header with back button for mobile */}
            <div className="flex items-center gap-3 md:hidden mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/workspace/${workspaceId}/store/settings`)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Notifications</h1>
            </div>
            <NotificationSettingsPage workspaceId={workspaceId} />
        </ApolloProvider>
    );
}
