'use client';

import { useQuery } from '@apollo/client/react';
import { GetWhatsAppAccountsDocument } from '@/services/graphql/admin-store/queries/whatsapp/__generated__/GetWhatsAppAccounts.generated';
import { WhatsAppBYONOverview } from '@/components/workspace/store/whatsapp/onboarding/WhatsAppBYONOverview';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function WhatsAppAPIControlPage() {
    const t = useTranslations('WhatsAppNav');
    const { data, loading } = useQuery(GetWhatsAppAccountsDocument);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const initialAccount = data?.marketingWhatsappAccounts?.[0] || null;

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold font-heading">{t('items.api_control.label')}</h1>
                    <p className="text-muted-foreground">
                        {t('items.api_control.description')}
                    </p>
                </header>
                
                <WhatsAppBYONOverview initialAccount={initialAccount} />
            </div>
        </div>
    );
}
