'use client';

import { useTranslations } from 'next-intl';

export default function WhatsAppOverviewPage() {
    const t = useTranslations('WhatsAppOverview');

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold font-heading">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('placeholder')}</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Visual Placeholder for Metrics */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-xl border bg-card/50 flex items-center justify-center text-muted-foreground/30 italic font-mono text-xs">
                            METRIC_DATA_0{i}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
