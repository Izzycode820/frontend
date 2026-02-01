'use client';

import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { CustomerCard } from './CustomerCard';
import { CustomersFilterChips } from './CustomersFilterChips';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/shadcn-ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn-ui/select';
import { Label } from '@/components/shadcn-ui/label';
import type { GetCustomersQuery } from '@/services/graphql/admin-store/queries/customers/__generated__/GetCustomers.generated';

type CustomerNode = NonNullable<
    NonNullable<
        NonNullable<GetCustomersQuery['customers']>['edges'][number]
    >['node']
>;

interface FilterChip {
    value: string;
    label: string;
    count?: number;
}

interface MobileCustomersListProps {
    customers: CustomerNode[];
    workspaceId: string;
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    // Filter chips
    chips: FilterChip[];
    activeChip: string;
    onChipChange: (value: string) => void;
    // Selection
    selectedCustomers: string[];
    onSelectCustomer: (customerId: string) => void;
    onLongPressCustomer: (customerId: string) => void;
    onClearSelection: () => void;
    // Loading
    isLoading?: boolean;
    // Actions
    onAddCustomer: () => void;
    // Filters
    customerType: string | null;
    onCustomerTypeChange: (value: string | null) => void;
    region: string | null;
    onRegionChange: (value: string | null) => void;
}

const CUSTOMER_TYPES = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'BUSINESS', label: 'Business' },
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

export function MobileCustomersList({
    customers,
    workspaceId,
    searchTerm,
    onSearchChange,
    chips,
    activeChip,
    onChipChange,
    selectedCustomers,
    onSelectCustomer,
    onLongPressCustomer,
    onClearSelection,
    isLoading,
    onAddCustomer,
    customerType,
    onCustomerTypeChange,
    region,
    onRegionChange,
}: MobileCustomersListProps) {
    const isSelectionMode = selectedCustomers.length > 0;
    const activeFilterCount = [customerType, region].filter(Boolean).length;

    const handleClearFilters = () => {
        onCustomerTypeChange(null);
        onRegionChange(null);
    };

    return (
        <div className="flex flex-col gap-4 pb-32">
            {/* Search Bar & Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                </div>

                {/* Filter Sheet Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-xl shrink-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative"
                        >
                            <Filter className="h-5 w-5" />
                            {activeFilterCount > 0 && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px] p-0">
                        <div className="flex flex-col h-full">
                            <SheetHeader className="p-6 pb-2 text-left">
                                <SheetTitle className="text-xl">Filters</SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                                {/* Customer Type Filter */}
                                <div className="space-y-2">
                                    <Label>Customer Type</Label>
                                    <Select
                                        value={customerType || 'all'}
                                        onValueChange={(val) => onCustomerTypeChange(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {CUSTOMER_TYPES.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Region Filter */}
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                    <Select
                                        value={region || 'all'}
                                        onValueChange={(val) => onRegionChange(val === 'all' ? null : val)}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="All Regions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Regions</SelectItem>
                                            {CAMEROON_REGIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <SheetFooter className="p-6 border-t mt-auto">
                                <div className="flex w-full gap-3">
                                    <SheetTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-12" onClick={handleClearFilters}>
                                            Clear all
                                        </Button>
                                    </SheetTrigger>
                                    <SheetTrigger asChild>
                                        <Button className="flex-1 h-12">
                                            View Results
                                        </Button>
                                    </SheetTrigger>
                                </div>
                            </SheetFooter>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Add Customer Button */}
                <Button
                    size="icon"
                    className="rounded-full shrink-0"
                    onClick={onAddCustomer}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {/* Filter Chips */}
            <CustomersFilterChips
                chips={chips}
                activeChip={activeChip}
                onChipChange={onChipChange}
            />

            {/* Customers List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
                </div>
            ) : customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">No customers found</p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                        Try adjusting your filters
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {customers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            workspaceId={workspaceId}
                            isSelected={selectedCustomers.includes(customer.id)}
                            isSelectionMode={isSelectionMode}
                            onSelect={onSelectCustomer}
                            onLongPress={onLongPressCustomer}
                        />
                    ))}
                </div>
            )}

            {/* Selection indicator */}
            {selectedCustomers.length > 0 && (
                <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
                    <div className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-4 py-3 shadow-2xl pointer-events-auto">
                        <button
                            onClick={onClearSelection}
                            className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-zinc-900/10 transition-colors"
                        >
                            ✕
                        </button>
                        <span className="text-sm font-medium px-2">
                            {selectedCustomers.length} selected
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
