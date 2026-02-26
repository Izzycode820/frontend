import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';

interface OrdersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  paymentStatus: string | null;
  onPaymentStatusChange: (value: string | null) => void;
  paymentMethod: string | null;
  onPaymentMethodChange: (value: string | null) => void;
  orderSource: string | null;
  onOrderSourceChange: (value: string | null) => void;
  shippingRegion: string | null;
  onShippingRegionChange: (value: string | null) => void;
}

export function OrdersFilters({
  searchTerm,
  onSearchChange,
  paymentStatus,
  onPaymentStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  orderSource,
  onOrderSourceChange,
  shippingRegion,
  onShippingRegionChange,
}: OrdersFiltersProps) {
  const t = useTranslations('Orders.filters');
  const tBadges = useTranslations('Orders.badges');
  const tTable = useTranslations('Orders.table');

  const PAYMENT_STATUSES = [
    { value: 'PAID', label: tBadges('paid') },
    { value: 'PENDING', label: tBadges('pending') },
    { value: 'FAILED', label: tBadges('failed') },
    { value: 'REFUNDED', label: tBadges('refunded') },
  ];

  const PAYMENT_METHODS = [
    { value: 'CASH_ON_DELIVERY', label: tTable('methods.cash_on_delivery') },
    { value: 'MOBILE_MONEY', label: t('mobileMoney') },
    { value: 'BANK_TRANSFER', label: t('bankTransfer') },
    { value: 'CARD', label: t('card') },
  ];

  const ORDER_SOURCES = [
    { value: 'WHATSAPP', label: tTable('channels.whatsapp') },
    { value: 'MANUAL', label: tTable('channels.manual') },
    { value: 'WEB', label: tTable('channels.web') },
  ];

  const CAMEROON_REGIONS = [
    { value: 'CENTRE', label: t('regions.centre') },
    { value: 'LITTORAL', label: t('regions.littoral') },
    { value: 'WEST', label: t('regions.west') },
    { value: 'NORTHWEST', label: t('regions.northwest') },
    { value: 'SOUTHWEST', label: t('regions.southwest') },
    { value: 'ADAMAWA', label: t('regions.adamawa') },
    { value: 'EAST', label: t('regions.east') },
    { value: 'FAR_NORTH', label: t('regions.far_north') },
    { value: 'NORTH', label: t('regions.north') },
    { value: 'SOUTH', label: t('regions.south') },
  ];
  const hasActiveFilters = paymentStatus || paymentMethod || orderSource || shippingRegion;

  const clearFilters = () => {
    onPaymentStatusChange(null);
    onPaymentMethodChange(null);
    onOrderSourceChange(null);
    onShippingRegionChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t('filters')}
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {[paymentStatus, paymentMethod, orderSource, shippingRegion].filter(Boolean).length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{t('filters')}</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1 text-xs"
              >
                {t('clearAll')}
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Payment Status Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('paymentStatus')}</label>
            <Select
              value={paymentStatus || 'all'}
              onValueChange={(value) => onPaymentStatusChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                {PAYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('paymentMethod')}</label>
            <Select
              value={paymentMethod || 'all'}
              onValueChange={(value) => onPaymentMethodChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('allMethods')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allMethods')}</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Source Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('orderSource')}</label>
            <Select
              value={orderSource || 'all'}
              onValueChange={(value) => onOrderSourceChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('allSources')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSources')}</SelectItem>
                {ORDER_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shipping Region Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('shippingRegion')}</label>
            <Select
              value={shippingRegion || 'all'}
              onValueChange={(value) => onShippingRegionChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('allRegions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRegions')}</SelectItem>
                {CAMEROON_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
