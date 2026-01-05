import { redirect } from 'next/navigation';

interface SettingsPageProps {
    params: Promise<{ workspace_id: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
    const resolvedParams = await params;
    redirect(`/workspace/${resolvedParams.workspace_id}/store/settings/general`);
}
