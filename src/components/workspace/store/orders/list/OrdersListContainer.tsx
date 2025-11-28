'use client';

/**
 * Orders List Container (Smart Component)
 *
 * Industry Standard Pattern:
 * - Container handles data fetching (GraphQL)
 * - Presentational components handle UI (list/ folder)
 * - Clean separation of concerns
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrdersTable } from './OrdersTable';
import { OrdersFilters } from './OrdersFilters';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Plus } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { GetOrdersDocument } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrders.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';

type TabValue = 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived';

export default function OrdersListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  // State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Filters
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [orderSource, setOrderSource] = useState<string | null>(null);
  const [shippingRegion, setShippingRegion] = useState<string | null>(null);

  // Determine status filter based on active tab
  const getStatusFilter = () => {
    switch (activeTab) {
      case 'unfulfilled':
        return 'UNFULFILLED';
      case 'unpaid':
        return null; // We'll handle this via paymentStatus
      case 'open':
        return 'OPEN';
      case 'archived':
        return 'ARCHIVED';
      default:
        return null;
    }
  };

  // Override payment status for "unpaid" tab
  const effectivePaymentStatus = activeTab === 'unpaid' ? 'UNPAID' : paymentStatus;

  // Fetch orders with GraphQL
  const { data, loading, error, fetchMore, refetch } = useQuery(GetOrdersDocument, {
    variables: {
      first: 50,
      status: getStatusFilter() as any,
      paymentStatus: effectivePaymentStatus as any,
      paymentMethod: paymentMethod as any,
      orderSource: orderSource as any,
      shippingRegion: shippingRegion as any,
    },
    skip: !currentWorkspace,
    fetchPolicy: 'network-only', // Always fetch fresh data, ignore cache
  });

  // Transform GraphQL data
  const orders = data?.orders?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const totalCount = data?.orders?.totalCount || 0;
  const hasNextPage = data?.orders?.pageInfo?.hasNextPage || false;

  // Handlers
  const handleAddOrder = () => {
    router.push(`/workspace/${currentWorkspace?.id}/store/orders/add`);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && data?.orders?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.orders.pageInfo.endCursor,
        },
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSelectedOrders([]);
    // Reset payment status when changing tabs (except for unpaid tab)
    if (value !== 'unpaid') {
      setPaymentStatus(null);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load orders</p>
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
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store orders ({totalCount} total)
          </p>
        </div>
        <Button onClick={handleAddOrder}>
          <Plus className="mr-2 h-4 w-4" />
          Create order
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unfulfilled">Unfulfilled</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <OrdersFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={setPaymentStatus}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        orderSource={orderSource}
        onOrderSourceChange={setOrderSource}
        shippingRegion={shippingRegion}
        onShippingRegionChange={setShippingRegion}
      />

      {/* Bulk Actions Toolbar */}
      {selectedOrders.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found</p>
              {(searchTerm || paymentStatus || paymentMethod || orderSource || shippingRegion) ? (
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              ) : (
                <div className="mt-4">
                  <Button onClick={handleAddOrder}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create your first order
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <OrdersTable
          orders={orders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
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
            {loading ? 'Loading...' : 'Load more orders'}
          </Button>
        </div>
      )}
    </div>
  );
}
