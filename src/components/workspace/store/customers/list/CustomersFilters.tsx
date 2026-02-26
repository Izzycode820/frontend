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
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
interface CustomersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  customerType: string | null;
  onCustomerTypeChange: (value: string | null) => void;
  region: string | null;
  onRegionChange: (value: string | null) => void;
}

const CUSTOMER_TYPES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'BUSINESS', label: 'Small Business' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'CORPORATE', label: 'Corporate' },
];

const CAMEROON_REGIONS = [
  { value: 'CENTRE', label: 'Centre' },
  { value: 'LITTORAL', label: 'Littoral' },
  { value: 'WEST', label: 'West' },
  { value: 'NORTH_WEST', label: 'Northwest' },
  { value: 'SOUTH_WEST', label: 'Southwest' },
  { value: 'ADAMAWA', label: 'Adamawa' },
  { value: 'EAST', label: 'East' },
  { value: 'FAR_NORTH', label: 'Far North' },
  { value: 'NORTH', label: 'North' },
  { value: 'SOUTH', label: 'South' },
];

export function CustomersFilters({
  searchTerm,
  onSearchChange,
  customerType,
  onCustomerTypeChange,
  region,
  onRegionChange,
}: CustomersFiltersProps) {
  const t = useTranslations('Customers');
  const hasActiveFilters = customerType || region;

  const clearFilters = () => {
    onCustomerTypeChange(null);
    onRegionChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('list.searchPlaceholder')}
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
            {t('list.filters.title')}
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {[customerType, region].filter(Boolean).length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{t('list.filters.title')}</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1 text-xs"
              >
                {t('list.filters.clearAll')}
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Customer Type Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('list.filters.type')}</label>
            <Select
              value={customerType || 'all'}
              onValueChange={(value) => onCustomerTypeChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('list.filters.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list.filters.allTypes')}</SelectItem>
                {CUSTOMER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(`list.filters.types.${type.value.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Filter */}
          <div className="p-2">
            <label className="text-sm font-medium mb-2 block">{t('list.filters.region')}</label>
            <Select
              value={region || 'all'}
              onValueChange={(value) => onRegionChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('list.filters.allRegions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list.filters.allRegions')}</SelectItem>
                {CAMEROON_REGIONS.map((reg) => (
                  <SelectItem key={reg.value} value={reg.value}>
                    {t(`list.filters.regions.${reg.value.toLowerCase()}`)}
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
