'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomersTable } from './CustomersTable';
import { CustomersFilters } from './CustomersFilters';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Plus } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { GetCustomersDocument } from '@/services/graphql/admin-store/queries/customers/__generated__/GetCustomers.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';

type TabValue = 'all' | 'active' | 'inactive';

export default function CustomersListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  // State
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Filters
  const [customerType, setCustomerType] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  // Determine isActive filter based on active tab
  const getIsActiveFilter = () => {
    switch (activeTab) {
      case 'active':
        return true;
      case 'inactive':
        return false;
      default:
        return undefined;
    }
  };

  // Fetch customers with GraphQL
  const { data, loading, error, fetchMore, refetch } = useQuery(GetCustomersDocument, {
    variables: {
      first: 50,
      name_Icontains: searchTerm || undefined,
      customerType: customerType as any,
      region: region as any,
      isActive: getIsActiveFilter(),
    },
    skip: !currentWorkspace,
  });

  // Transform GraphQL data
  const customers = data?.customers?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const totalCount = data?.customers?.totalCount || 0;
  const hasNextPage = data?.customers?.pageInfo?.hasNextPage || false;

  // Handlers
  const handleAddCustomer = () => {
    router.push(`/workspace/${currentWorkspace?.id}/store/customers/add`);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCustomers(customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && data?.customers?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.customers.pageInfo.endCursor,
        },
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSelectedCustomers([]);
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load customers</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store customers ({totalCount} total)
          </p>
        </div>
        <Button onClick={handleAddCustomer}>
          <Plus className="mr-2 h-4 w-4" />
          Add customer
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <CustomersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        customerType={customerType}
        onCustomerTypeChange={setCustomerType}
        region={region}
        onRegionChange={setRegion}
      />

      {/* Bulk Actions Toolbar */}
      {selectedCustomers.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomers([])}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      {loading && customers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found</p>
              {(searchTerm || customerType || region) ? (
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              ) : (
                <div className="mt-4">
                  <Button onClick={handleAddCustomer}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first customer
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomersTable
          customers={customers}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={handleSelectCustomer}
          onSelectAll={handleSelectAll}
          workspaceId={currentWorkspace?.id || ''}
        />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load more customers'}
          </Button>
        </div>
      )}
    </div>
  );
}
