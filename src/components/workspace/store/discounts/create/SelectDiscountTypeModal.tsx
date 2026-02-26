'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { ChevronRight, Tag, Gift, ShoppingCart, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SelectDiscountTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectDiscountTypeModal({ open, onOpenChange }: SelectDiscountTypeModalProps) {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const t = useTranslations('Discounts');

  const handleSelectType = (type: string) => {
    if (type === 'amount_off_product' || type === 'buy_x_get_y') {
      router.push(`/workspace/${currentWorkspace?.id}/store/discounts/new/${type.replace(/_/g, '-')}`);
      onOpenChange(false);
    }
  };

  const discountTypes = [
    {
      id: 'amount_off_product',
      icon: Tag,
      title: t('type.amountOffProductTitle'),
      description: t('type.amountOffProductDesc'),
      available: true,
    },
    {
      id: 'buy_x_get_y',
      icon: Gift,
      title: t('type.buyXGetYTitle'),
      description: t('type.buyXGetYDesc'),
      available: true,
    },
    {
      id: 'amount_off_order',
      icon: ShoppingCart,
      title: t('type.amountOffOrderTitle'),
      description: t('type.amountOffOrderDesc'),
      available: false,
    },
    {
      id: 'free_shipping',
      icon: Truck,
      title: t('type.freeShippingTitle'),
      description: t('type.freeShippingDesc'),
      available: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('type.modalTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {discountTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelectType(type.id)}
              disabled={!type.available}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                type.available
                  ? 'hover:bg-accent cursor-pointer'
                  : 'opacity-50 cursor-not-allowed bg-muted'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 text-left">
                <type.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {type.title}
                    {!type.available && (
                      <span className="text-xs text-muted-foreground font-normal">{t('type.comingSoon')}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </div>
              {type.available && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
