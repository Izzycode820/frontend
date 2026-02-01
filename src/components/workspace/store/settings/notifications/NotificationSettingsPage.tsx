'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/shadcn-ui/card';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Alert, AlertDescription } from '@/components/shadcn-ui/alert';
import { toast } from 'sonner';
import {
    IconBell,
    IconVolume,
    IconMoon,
    IconInfoCircle,
    IconLoader2,
    IconDeviceFloppy,
    IconClock
} from '@tabler/icons-react';

import { GetNotificationSettingsDocument } from '@/services/graphql/notifications/queries/__generated__/GetNotificationSettings.generated';
import { UpdateNotificationSettingsDocument } from '@/services/graphql/notifications/mutations/__generated__/UpdateNotificationSettings.generated';
import { requestNotificationPermission } from '@/components/workspace/store/notifications/useNotificationSound';

interface Props {
    workspaceId: string;
}

const EVENTS_CONFIG = [
    { key: 'new_order', label: 'New Order', description: 'When a customer places a new order' },
    { key: 'order_status_change', label: 'Order Updates', description: 'When order status changes' },
    { key: 'low_stock_alert', label: 'Low Stock', description: 'When product inventory is running low' },
    { key: 'new_customer', label: 'New Customer', description: 'When a new customer signs up' },
];

export function NotificationSettingsPage({ workspaceId }: Props) {
    // Queries - skip until workspace ID is available
    // Authentication is handled by the notificationClient's authLink middleware
    const { data, loading, error } = useQuery(GetNotificationSettingsDocument, {
        variables: { workspaceId },
        fetchPolicy: 'cache-and-network',
        skip: !workspaceId,
    });

    const [updateSettings, { loading: saving }] = useMutation(UpdateNotificationSettingsDocument);

    // Local state
    // We use local state for the form to handle "Save" behavior for complex edits
    // and optimistic updates for toggles.
    const [quietHoursStart, setQuietHoursStart] = useState('22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
    const [eventPreferences, setEventPreferences] = useState<Record<string, any>>({});
    const [isDirty, setIsDirty] = useState(false);

    // Initialize state from data
    useEffect(() => {
        if (data?.workspaceNotificationSettings) {
            const settings = data.workspaceNotificationSettings;
            if (settings.quietHoursStart) setQuietHoursStart(settings.quietHoursStart);
            if (settings.quietHoursEnd) setQuietHoursEnd(settings.quietHoursEnd);
            if (settings.inAppEvents) {
                // Ensure we have a valid object
                setEventPreferences(typeof settings.inAppEvents === 'string'
                    ? JSON.parse(settings.inAppEvents)
                    : settings.inAppEvents || {});
            }
        }
    }, [data]);

    // Handlers
    const handleToggle = async (field: string, value: boolean) => {
        // Instant save for main toggles
        try {
            await updateSettings({
                variables: {
                    workspaceId,
                    input: {
                        [field]: value
                    }
                },
                optimisticResponse: {
                    updateNotificationSettings: {
                        success: true,
                        settings: {
                            __typename: 'NotificationSettingsType',
                            id: data?.workspaceNotificationSettings?.id || 'temp',
                            ...data?.workspaceNotificationSettings,
                            [field]: value
                        }
                    }
                }
            });
            toast.success('Setting updated');
        } catch (err) {
            toast.error('Failed to update setting');
            console.error(err);
        }
    };

    const handleEventPreferenceChange = (eventKey: string, field: 'enabled' | 'sound', value: boolean) => {
        setEventPreferences(prev => ({
            ...prev,
            [eventKey]: {
                ...(prev[eventKey] || { enabled: true, sound: true }),
                [field]: value
            }
        }));
        setIsDirty(true);
    };

    const handleSaveBatch = async () => {
        try {
            await updateSettings({
                variables: {
                    workspaceId,
                    input: {
                        quietHoursStart,
                        quietHoursEnd,
                        inAppEvents: eventPreferences
                    }
                }
            });
            toast.success('Preferences saved successfully');
            setIsDirty(false);
        } catch (err) {
            toast.error('Failed to save preferences');
            console.error(err);
        }
    };

    if (loading && !data) {
        return (
            <div className="space-y-6 max-w-[1000px] mx-auto">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1000px] mx-auto">
                <Alert variant="destructive">
                    <AlertDescription>Error loading settings: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const settings = data?.workspaceNotificationSettings;

    return (
        <div className="space-y-8 pb-10 max-w-[1000px] mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
                <p className="text-muted-foreground">
                    Manage how you receive alerts and notifications within the dashboard.
                </p>
            </div>

            {/* General Preferences */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconBell className="w-5 h-5 text-zinc-500" />
                        <CardTitle className="text-base">General Preferences</CardTitle>
                    </div>
                    <CardDescription>Global settings for in-app notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Play Notification Sound</Label>
                            <p className="text-sm text-muted-foreground">
                                Play a sound when a new notification arrives while you are online.
                            </p>
                        </div>
                        <Switch
                            checked={settings?.inAppSoundEnabled ?? true}
                            onCheckedChange={(val) => handleToggle('inAppSoundEnabled', val)}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Browser Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Show system notifications (banners) when the app is in the background.
                            </p>
                        </div>
                        <Switch
                            checked={settings?.inAppBrowserNotifications ?? false}
                            onCheckedChange={async (val) => {
                                if (val) {
                                    const result = await requestNotificationPermission();
                                    if (result !== 'granted') {
                                        toast.error('Permission denied. Please enable notifications in your browser settings.');
                                        return;
                                    }
                                }
                                handleToggle('inAppBrowserNotifications', val);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconMoon className="w-5 h-5 text-indigo-500" />
                        <CardTitle className="text-base">Quiet Hours</CardTitle>
                    </div>
                    <CardDescription>Mute sounds and banners during specific times</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Enable Quiet Hours</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically mute notifications during the specified schedule.
                            </p>
                        </div>
                        <Switch
                            checked={settings?.quietHoursEnabled ?? false}
                            onCheckedChange={(val) => handleToggle('quietHoursEnabled', val)}
                        />
                    </div>

                    {settings?.quietHoursEnabled && (
                        <div className="grid grid-cols-2 gap-4 mt-4 p-4 border rounded-lg bg-muted/30">
                            <div className="space-y-2">
                                <Label htmlFor="start-time" className="text-xs font-semibold uppercase text-muted-foreground">
                                    Start Time
                                </Label>
                                <div className="relative">
                                    <IconClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="start-time"
                                        type="time"
                                        className="pl-9"
                                        value={quietHoursStart}
                                        onChange={(e) => {
                                            setQuietHoursStart(e.target.value);
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-time" className="text-xs font-semibold uppercase text-muted-foreground">
                                    End Time
                                </Label>
                                <div className="relative">
                                    <IconClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="end-time"
                                        type="time"
                                        className="pl-9"
                                        value={quietHoursEnd}
                                        onChange={(e) => {
                                            setQuietHoursEnd(e.target.value);
                                            setIsDirty(true);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Event Preferences */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <IconVolume className="w-5 h-5 text-emerald-500" />
                        <CardTitle className="text-base">Event Rules</CardTitle>
                    </div>
                    <CardDescription>Customize alerts for specific events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {EVENTS_CONFIG.map((event) => {
                            const pref = eventPreferences[event.key] || { enabled: true, sound: true };
                            return (
                                <div key={event.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 border-b last:border-0 border-border">
                                    <div className="space-y-1">
                                        <p className="font-medium text-sm">{event.label}</p>
                                        <p className="text-xs text-muted-foreground">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Sound</Label>
                                            <Switch
                                                checked={pref.sound}
                                                onCheckedChange={(val) => handleEventPreferenceChange(event.key, 'sound', val)}
                                                disabled={!pref.enabled}
                                                className="scale-90"
                                            />
                                        </div>
                                        <div className="h-8 w-px bg-border mx-2" />
                                        <div className="flex flex-col items-center gap-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground font-semibold">Enabled</Label>
                                            <Switch
                                                checked={pref.enabled}
                                                onCheckedChange={(val) => handleEventPreferenceChange(event.key, 'enabled', val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Floating Save Button */}
            {isDirty && (
                <div className="fixed bottom-6 right-6 md:right-10 z-50 animate-in slide-in-from-bottom-5">
                    <Button
                        size="lg"
                        className="shadow-xl gap-2 rounded-full px-6"
                        onClick={handleSaveBatch}
                        disabled={saving}
                    >
                        {saving ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconDeviceFloppy className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}
