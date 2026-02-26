import { Button } from '@/components/shadcn-ui/button';
import { User, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CustomerDetailsHeaderProps {
  customerName: string;
}

export function CustomerDetailsHeader({ customerName }: CustomerDetailsHeaderProps) {
  const t = useTranslations('Customers');

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">{customerName}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            {t('details.moreActions')}
            <MoreHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
