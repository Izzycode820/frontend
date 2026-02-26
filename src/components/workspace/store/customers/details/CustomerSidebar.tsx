import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Separator } from '@/components/shadcn-ui/separator';
import { MoreHorizontal, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CustomerSidebarProps {
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    region?: string | null;
    tags?: string | null;
    smsNotifications?: boolean;
  };
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
  const t = useTranslations('Customers');

  return (
    <div className="space-y-4">
      {/* Customer Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{t('details.sidebar.customer')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('details.sidebar.contactInfo')}</h3>
            <div className="space-y-1">
              {customer.email ? (
                <div className="flex items-center justify-between group">
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ) : null}
              <div className="flex items-center justify-between group">
                <p className="text-sm">{customer.phone}</p>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('details.sidebar.notificationsLanguage')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Default Address */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('details.sidebar.defaultAddress')}</h3>
            <div className="text-sm space-y-0.5">
              <p>{customer.name}</p>
              {customer.address && <p className="text-muted-foreground">{customer.address}</p>}
              {customer.city && <p className="text-muted-foreground">{customer.city}</p>}
              {customer.region && (
                <p className="text-muted-foreground capitalize">
                  {t(`list.filters.regions.${customer.region.toLowerCase()}`)}
                </p>
              )}
              <p className="text-muted-foreground">{t('details.sidebar.country')}</p>
            </div>
          </div>

          <Separator />

          {/* Marketing */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('details.sidebar.marketing')}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-muted-foreground">
                  {customer.email ? t('details.sidebar.emailSubscribed') : t('details.sidebar.emailNotSubscribed')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-muted-foreground">
                  {customer.smsNotifications ? t('details.sidebar.smsSubscribed') : t('details.sidebar.smsNotSubscribed')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax Details */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t('details.sidebar.taxDetails')}</h3>
            <p className="text-sm text-muted-foreground">{t('details.sidebar.collectTax')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Store Credit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{t('details.sidebar.storeCredit')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('details.sidebar.noStoreCredit')}</p>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{t('details.sidebar.tags')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {customer.tags ? (
            <div className="flex flex-wrap gap-2">
              {JSON.parse(customer.tags).map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-md p-3 text-center">
              <p className="text-sm text-muted-foreground">{t('details.sidebar.noTags')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{t('details.sidebar.notes')}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('details.sidebar.noNotes')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
