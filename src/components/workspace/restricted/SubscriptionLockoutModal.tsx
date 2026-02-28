'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { Button } from '@/components/shadcn-ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function SubscriptionLockoutModal() {
    const router = useRouter();
    const t = useTranslations('Workspaces.subscriptionLockout');
    const { status, expiresAt, tier, billingCycle } = useSubscription();
    const [isReactivating, setIsReactivating] = useState(false);

    if (status !== 'restricted' || !expiresAt) {
        return null;
    }

    const expirationDate = new Date(expiresAt).getTime();
    const daysOverdue = (Date.now() - expirationDate) / (1000 * 60 * 60 * 24);

    if (daysOverdue <= 3) {
        return null; // Grace period (Soft Lock)
    }

    const handleReactivate = () => {
        setIsReactivating(true);
        const params = new URLSearchParams({
            action: 'subscribe',
            tier: tier || 'pro',
            cycle: billingCycle || 'monthly'
        });
        router.push(`/checkout?${params.toString()}`);
    };

    const tierName = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Plan';

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md [&>button]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">{t('title')}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {t('subtitle')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 leading-relaxed">
                            {t.rich('body', {
                                tier: tierName,
                                strong: (chunks) => <strong>{chunks}</strong>,
                            })}
                        </p>
                    </div>

                    <Button
                        onClick={handleReactivate}
                        disabled={isReactivating}
                        className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        size="lg"
                    >
                        <RefreshCw className={`h-5 w-5 mr-2 ${isReactivating ? 'animate-spin' : ''}`} />
                        {isReactivating ? t('processing') : t('reactivate', { tier: tierName })}
                    </Button>

                    <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                            {t('changePlans')}{' '}
                            <a href="/billing" className="underline hover:text-gray-700">{t('startFresh')}</a>
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
