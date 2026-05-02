'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { useTranslations } from 'next-intl';

type TopProduct = {
    id: string;
    name: string;
    views: number;
    sales: number;
    revenue: number;
};

export function TopProductsList({ data }: { data: TopProduct[] | null | undefined }) {
    const t = useTranslations('Analytics');
    if (!data || data.length === 0) return null;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>{t('products.title', { fallback: 'Top Products' })}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[350px]">
                <div className="space-y-4">
                    {data.map((product) => (
                        <div key={product.id} className="flex justify-between items-center bg-muted/30 hover:bg-muted/50 transition-colors p-3 rounded-md border border-border/50">
                            <div className="truncate pr-4 flex-1">
                                <p className="font-semibold text-sm truncate text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">{product.views} views</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-medium text-sm text-foreground">{product.sales} sales</p>
                                <p className="text-xs font-bold text-primary mt-1">{product.revenue.toLocaleString()} XAF</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
