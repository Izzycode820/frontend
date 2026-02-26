'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import { Badge } from '@/components/shadcn-ui/badge';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { DiscountRowActions } from './DiscountRowActions';
import * as Types from '@/types/workspace/store/graphql-base';
import { useTranslations } from 'next-intl';

interface Discount {
  id: string;
  code: string;
  name: string;
  method: Types.WorkspaceStoreDiscountMethodChoices;
  discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices;
  status: Types.WorkspaceStoreDiscountStatusChoices;
  discountValueType: Types.WorkspaceStoreDiscountDiscountValueTypeChoices | null;
  value: any | null;
  customerBuysQuantity: number | null;
  customerBuysValue: any | null;
  customerGetsQuantity: number | null;
  minimumPurchaseAmount: any | null;
  minimumQuantityItems: number | null;
  limitOnePerCustomer: boolean;
  usageCount: number;
  canCombineWithProductDiscounts: boolean;
  canCombineWithOrderDiscounts: boolean;
  isActive: boolean | null;
  isExpired: boolean | null;
}

interface DiscountsTableProps {
  discounts: Discount[];
  onDiscountSelect?: (selectedIds: string[]) => void;
  onEdit?: (discountId: string, discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices) => void;
  onDelete?: (discountId: string) => void;
}

export function DiscountsTable({
  discounts,
  onDiscountSelect,
  onEdit,
  onDelete,
}: DiscountsTableProps) {
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspace_id;
  const t = useTranslations('Discounts');

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? discounts.map((d) => d.id) : [];
    setSelectedDiscounts(newSelected);
    onDiscountSelect?.(newSelected);
  };

  const handleSelectDiscount = (discountId: string, checked: boolean) => {
    const newSelected = checked
      ? [...selectedDiscounts, discountId]
      : selectedDiscounts.filter((id) => id !== discountId);
    setSelectedDiscounts(newSelected);
    onDiscountSelect?.(newSelected);
  };

  const handleRowClick = (discount: Discount) => {
    let path = '';
    switch (discount.discountType) {
      case Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct:
        path = `/workspace/${workspaceId}/store/discounts/${discount.id}/edit/amount-off-product`;
        break;
      case Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY:
        path = `/workspace/${workspaceId}/store/discounts/${discount.id}/edit/buy-x-get-y`;
        break;
      default:
        // Fallback
        return;
    }
    router.push(path);
  };

  const getStatusBadge = (discount: Discount) => {
     if (discount.isExpired) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          {t('list.expired')}
        </Badge>
      );
    }
    if (!discount.isActive) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          {t('list.scheduled')}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        {t('list.active')}
      </Badge>
    );
  };

   const getMethodBadge = (method: Types.WorkspaceStoreDiscountMethodChoices) => {
    return (
      <span className="text-sm">
        {method === Types.WorkspaceStoreDiscountMethodChoices.DiscountCode ? t('method.code') : t('method.automatic')}
      </span>
    );
  };

   const getTypeBadge = (discountType: Types.WorkspaceStoreDiscountDiscountTypeChoices) => {
    const typeLabels = {
      [Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct]: t('type.amountOffProductTitle'),
      [Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY]: t('type.buyXGetYTitle'),
      [Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffOrder]: t('type.amountOffOrderTitle'),
      [Types.WorkspaceStoreDiscountDiscountTypeChoices.FreeShipping]: t('type.freeShippingTitle'),
    };
    return <span className="text-sm">{typeLabels[discountType] || discountType}</span>;
  };

  const getCombinationIcons = (discount: Discount) => {
    const combinations = [];
     if (discount.canCombineWithProductDiscounts) {
      combinations.push(t('list.products'));
    }
    if (discount.canCombineWithOrderDiscounts) {
      combinations.push(t('list.orders'));
    }
    return combinations.length > 0 ? (
      <span className="text-sm">{combinations.join(' • ')}</span>
    ) : (
      <span className="text-muted-foreground">-</span>
    );
  };

  const getDiscountDescription = (discount: Discount) => {
    const parts = [];

     // Discount value
    if (discount.discountType === Types.WorkspaceStoreDiscountDiscountTypeChoices.AmountOffProduct) {
      if (discount.discountValueType === Types.WorkspaceStoreDiscountDiscountValueTypeChoices.Percentage) {
        parts.push(t('list.percentageOff', { amount: discount.value }));
      } else if (discount.discountValueType === Types.WorkspaceStoreDiscountDiscountValueTypeChoices.FixedAmount) {
        parts.push(t('list.off', { amount: `FCFA${parseFloat(discount.value).toLocaleString()}` }));
      }
    } else if (discount.discountType === Types.WorkspaceStoreDiscountDiscountTypeChoices.BuyXGetY) {
      if (discount.customerBuysQuantity && discount.customerGetsQuantity) {
        parts.push(t('list.buyXGetY', { x: discount.customerBuysQuantity, y: discount.customerGetsQuantity }));
      }
    }

     // Minimum requirements
    if (discount.minimumPurchaseAmount) {
      parts.push(t('list.minPurchase', { amount: parseFloat(discount.minimumPurchaseAmount).toLocaleString() }));
    } else if (discount.minimumQuantityItems) {
      parts.push(t('list.minQuantity', { count: discount.minimumQuantityItems }));
    }

    // Usage limit
    if (discount.limitOnePerCustomer) {
      parts.push(t('list.onePerCustomer'));
    }

    return parts.join(' • ');
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
             <TableHead>{t('list.tableTitle')}</TableHead>
            <TableHead>{t('list.tableStatus')}</TableHead>
            <TableHead>{t('list.tableMethod')}</TableHead>
            <TableHead>{t('list.tableType')}</TableHead>
            <TableHead>{t('list.tableCombinations')}</TableHead>
            <TableHead>{t('list.tableUsed')}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow
              key={discount.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(discount)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedDiscounts.includes(discount.id)}
                  onCheckedChange={(checked) => handleSelectDiscount(discount.id, checked as boolean)}
                  aria-label={`Select ${discount.code}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                  <div className="font-medium">{discount.code}</div>
                  <div className="text-xs text-muted-foreground">{getDiscountDescription(discount)}</div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(discount)}</TableCell>
              <TableCell>{getMethodBadge(discount.method)}</TableCell>
              <TableCell>{getTypeBadge(discount.discountType)}</TableCell>
              <TableCell>{getCombinationIcons(discount)}</TableCell>
              <TableCell>
                <span className="text-sm">{discount.usageCount}</span>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DiscountRowActions
                  discount={discount}
                  onEdit={(id) => onEdit?.(id, discount.discountType)}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
