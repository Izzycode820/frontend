import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn-ui/dialog';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Button } from '@/components/shadcn-ui/button';
import { Switch } from '@/components/shadcn-ui/switch';
import { useTranslations } from 'next-intl';
import type { VariantFormState } from './types';

interface VariantEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: VariantFormState;
  onSave: (updatedVariant: VariantFormState) => void;
}

export function VariantEditModal({
  open,
  onOpenChange,
  variant,
  onSave
}: VariantEditModalProps) {
  const t = useTranslations('Products.variants');
  const [formData, setFormData] = useState<VariantFormState>(variant);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const variantName = [formData.option1, formData.option2, formData.option3]
    .filter(Boolean)
    .join(' / ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editVariant', { name: variantName })}</DialogTitle>
          <DialogDescription>
            {t('editVariantDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('pricing')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">{t('price', { currency: t('currency') })}</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                />
              </div>

              <div>
                <Label htmlFor="compareAtPrice">{t('compareAtPrice')}</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  value={formData.compareAtPrice || ''}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || undefined })}
                />
              </div>

              <div>
                <Label htmlFor="costPrice">{t('costPerItem')}</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice || ''}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || undefined })}
                />
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('inventory')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">{t('sku')}</Label>
                <Input
                  id="sku"
                  value={(formData as any).sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value } as any)}
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <Label htmlFor="barcode">{t('barcode')}</Label>
                <Input
                  id="barcode"
                  value={(formData as any).barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value } as any)}
                  placeholder="123456789"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('status')}</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">{t('active')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('activeDescription')}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('saveChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
