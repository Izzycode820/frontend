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
import { MobileOrdersList } from './mobile';
import { useIsMobile } from '@/hooks/shadcn/use-mobile';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/shadcn-ui/pagination';
import { Plus, Archive, XCircle, Package, ChevronDown, CreditCard } from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GetOrdersDocument } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrders.generated';
import { BulkUpdateOrderStatusDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/BulkUpdateOrderStatus.generated';
import { ArchiveOrderDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/ArchiveOrder.generated';
import { UnarchiveOrderDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/UnarchiveOrder.generated';
import { CancelOrderDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/CancelOrder.generated';
import { MarkOrderAsPaidDocument } from '@/services/graphql/admin-store/mutations/orders/__generated__/MarkOrderAsPaid.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';

type TabValue = 'all' | 'unfulfilled' | 'unpaid' | 'open' | 'archived';

export default function OrdersListContainer() {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isMobile = useIsMobile();
  const t = useTranslations('Orders.list');
  const tActions = useTranslations('Orders.actions');

  // State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Pagination state
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<{ [page: number]: string }>({});

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
        return 'PENDING';
      case 'archived':
        return null; // Archived is handled via is_archived boolean, not status
      default:
        return null;
    }
  };

  // Override payment status for "unpaid" tab
  const effectivePaymentStatus = activeTab === 'unpaid' ? 'PENDING' : paymentStatus;

  // Determine isArchived filter based on active tab
  const getIsArchivedFilter = () => {
    if (activeTab === 'archived') {
      return true;  // Show only archived orders
    }
    // For all other tabs (including 'all'), exclude archived orders
    return false;  // Show only non-archived orders
  };

  // Fetch orders with GraphQL
  const { data, loading, error, refetch } = useQuery(GetOrdersDocument, {
    variables: {
      first: pageSize,
      after: cursors[currentPage] || undefined,
      status: getStatusFilter() as any,
      paymentStatus: effectivePaymentStatus as any,
      paymentMethod: paymentMethod as any,
      orderSource: orderSource as any,
      shippingRegion: shippingRegion as any,
      isArchived: getIsArchivedFilter(),
    },
    skip: !currentWorkspace,
  });

  // Store cursor for next page when data changes
  React.useEffect(() => {
    const endCursor = data?.orders?.pageInfo?.endCursor;
    if (endCursor) {
      setCursors(prev => ({
        ...prev,
        [currentPage + 1]: endCursor
      }));
    }
  }, [data?.orders?.pageInfo?.endCursor, currentPage]);

  // Mutations for bulk actions
  const [bulkUpdateStatus] = useMutation(BulkUpdateOrderStatusDocument, {
    refetchQueries: ['GetOrders'],
    awaitRefetchQueries: true,
  });

  const [archiveOrder] = useMutation(ArchiveOrderDocument, {
    refetchQueries: ['GetOrders'],
    awaitRefetchQueries: true,
  });

  const [unarchiveOrder] = useMutation(UnarchiveOrderDocument, {
    refetchQueries: ['GetOrders'],
    awaitRefetchQueries: true,
  });

  const [cancelOrder] = useMutation(CancelOrderDocument, {
    refetchQueries: ['GetOrders'],
    awaitRefetchQueries: true,
  });

  const [markOrderAsPaid] = useMutation(MarkOrderAsPaidDocument, {
    refetchQueries: ['GetOrders'],
    awaitRefetchQueries: true,
  });

  // Transform GraphQL data
  const orders = (data?.orders?.edges?.map(edge => edge?.node).filter((node): node is NonNullable<typeof node> => node !== null && node !== undefined)) || [];
  const totalCount = data?.orders?.totalCount || 0;
  const hasNextPage = data?.orders?.pageInfo?.hasNextPage || false;
  const totalPages = Math.ceil(totalCount / pageSize);

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
      setSelectedOrders(orders.filter(Boolean).map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrders([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSelectedOrders([]);
    setCurrentPage(1);
    setCursors({});
    // Reset payment status when changing tabs (except for unpaid tab)
    if (value !== 'unpaid') {
      setPaymentStatus(null);
    }
  };

  // Long press handler for mobile selection
  const handleLongPressOrder = (orderId: string) => {
    // Start selection mode and select this order
    if (!selectedOrders.includes(orderId)) {
      setSelectedOrders([orderId]);
    }
  };

  // Bulk action handlers
  const handleBulkArchive = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(tActions('confirmArchive', { count: selectedOrders.length }))) return;

    try {
      // Run all archive operations in parallel
      const results = await Promise.all(
        selectedOrders.map(orderId =>
          archiveOrder({ variables: { orderId } })
        )
      );

      const successCount = results.filter(r => r.data?.archiveOrder?.success).length;
      const failCount = results.length - successCount;

      // Show results
      if (successCount > 0) {
        toast.success(tActions('successArchived', { count: successCount }));
      }
      if (failCount > 0) {
        toast.error(tActions('failArchived', { count: failCount }));
      }

      // Clear selection and refetch will happen automatically
      setSelectedOrders([]);
    } catch (e) {
      toast.error(tActions('errorBulkArchive'));
      console.error('Bulk archive error:', e);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(tActions('confirmCancel', { count: selectedOrders.length }))) return;

    try {
      // Run all cancel operations in parallel
      const results = await Promise.all(
        selectedOrders.map(orderId =>
          cancelOrder({ variables: { orderId, reason: 'Bulk cancelled by merchant' } })
        )
      );

      const successCount = results.filter(r => r.data?.cancelOrder?.success).length;
      const failCount = results.length - successCount;

      // Show results
      if (successCount > 0) {
        toast.success(tActions('successCancelled', { count: successCount }));
      }
      if (failCount > 0) {
        toast.error(tActions('failCancelled', { count: failCount }));
      }

      // Clear selection and refetch will happen automatically
      setSelectedOrders([]);
    } catch (e) {
      toast.error(tActions('errorBulkCancel'));
      console.error('Bulk cancel error:', e);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedOrders.length === 0) return;

    if (!confirm(tActions('confirmMarkAsPaid', { count: selectedOrders.length }))) return;

    try {
      // Run all operations in parallel
      const results = await Promise.all(
        selectedOrders.map(orderId =>
          markOrderAsPaid({ variables: { orderId } })
        )
      );

      const successCount = results.filter(r => r.data?.markOrderAsPaid?.success).length;
      const failCount = results.length - successCount;

      // Show results
      if (successCount > 0) {
        toast.success(tActions('successMarkedAsPaid', { count: successCount }));
      }
      if (failCount > 0) {
        toast.error(tActions('failMarkedAsPaid', { count: failCount }));
      }

      // Clear selection and refetch will happen automatically
      setSelectedOrders([]);
    } catch (e) {
      toast.error(tActions('errorBulkMarkAsPaid'));
      console.error('Bulk mark as paid error:', e);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string, statusLabel?: string) => {
    if (selectedOrders.length === 0) return;

    try {
      const result = await bulkUpdateStatus({
        variables: {
          bulkData: {
            updates: selectedOrders.map(orderId => ({
              orderId,
              newStatus,
            })),
          },
        },
      });

      if (result.data?.bulkUpdateOrderStatus?.success) {
        const { successfulUpdates, failedUpdates } = result.data.bulkUpdateOrderStatus;

        if (successfulUpdates && successfulUpdates > 0) {
          const label = statusLabel || newStatus;
          toast.success(tActions('successMarkedAs', { count: successfulUpdates, label }));
        }
        if (failedUpdates && failedUpdates.length > 0) {
          toast.error(tActions('failUpdate', { count: failedUpdates.length }));
        }

        // Clear selection and refetch will happen automatically
        setSelectedOrders([]);
      } else {
        toast.error(result.data?.bulkUpdateOrderStatus?.error || tActions('failUpdate', { count: selectedOrders.length }));
      }
    } catch (e) {
      toast.error(tActions('errorBulkUpdate'));
      console.error('Bulk status update error:', e);
    }
  };

  // Individual archive/unarchive handlers
  const handleArchiveOrder = async (orderId: string) => {
    try {
      const result = await archiveOrder({ variables: { orderId } });

      if (result.data?.archiveOrder?.success) {
        toast.success(tActions('successArchivedSingle'));
      } else {
        toast.error(result.data?.archiveOrder?.error || tActions('failArchived', { count: 1 }));
      }
    } catch (e) {
      toast.error(tActions('errorArchive'));
      console.error('Archive order error:', e);
    }
  };

  const handleUnarchiveOrder = async (orderId: string) => {
    try {
      const result = await unarchiveOrder({ variables: { orderId } });

      if (result.data?.unarchiveOrder?.success) {
        toast.success(tActions('successUnarchivedSingle'));
      } else {
        toast.error(result.data?.unarchiveOrder?.error || tActions('errorUnarchive'));
      }
    } catch (e) {
      toast.error(tActions('errorUnarchive'));
      console.error('Unarchive order error:', e);
    }
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setCursors({});
  }, [paymentStatus, paymentMethod, orderSource, shippingRegion]);

  // Error state
  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>{t('failedToLoad')}</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile filter chips based on tabs
  const mobileFilterChips = [
    { value: 'all', label: t('tabs.all') },
    { value: 'unfulfilled', label: t('tabs.unfulfilled') },
    { value: 'unpaid', label: t('tabs.unpaid') },
    { value: 'open', label: t('tabs.open') },
    { value: 'archived', label: t('tabs.archived') },
  ];

  // Mobile View
  if (isMobile) {
    return (
      <div className="px-4 pt-4">
        <MobileOrdersList
          orders={orders}
          workspaceId={currentWorkspace?.id || ''}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeChip={activeTab}
          onChipChange={handleTabChange}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onLongPressOrder={handleLongPressOrder}
          onClearSelection={() => setSelectedOrders([])}
          onBulkArchive={handleBulkArchive}
          onBulkMarkAsPaid={handleBulkMarkAsPaid}
          onBulkCancel={handleBulkCancel}
          onBulkStatusUpdate={handleBulkStatusUpdate}
          isLoading={loading}
          // Filter Props
          paymentStatus={paymentStatus}
          onPaymentStatusChange={setPaymentStatus}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          orderSource={orderSource}
          onOrderSourceChange={setOrderSource}
          shippingRegion={shippingRegion}
          onShippingRegionChange={setShippingRegion}
        />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('subtitle', { count: totalCount })}
          </p>
        </div>
        <Button onClick={handleAddOrder}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createOrder')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="unfulfilled">{t('tabs.unfulfilled')}</TabsTrigger>
          <TabsTrigger value="unpaid">{t('tabs.unpaid')}</TabsTrigger>
          <TabsTrigger value="open">{t('tabs.open')}</TabsTrigger>
          <TabsTrigger value="archived">{t('tabs.archived')}</TabsTrigger>
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
                {tActions('selectedCount', { count: selectedOrders.length })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkCancel}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  {tActions('cancelOrders')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                >
                  <Archive className="mr-1 h-3 w-3" />
                  {tActions('archive')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsPaid}
                >
                  <CreditCard className="mr-1 h-3 w-3" />
                  {tActions('markAsPaid')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Package className="mr-1 h-3 w-3" />
                      {tActions('fulfillment')}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('delivered', tActions('markAsDelivered'))}>
                      {tActions('markAsDelivered')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('unfulfilled', tActions('markAsNotDelivered'))}>
                      {tActions('markAsNotDelivered')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('on_hold', tActions('markOnHold'))}
                >
                  {tActions('markOnHold')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('processing', tActions('markProcessing'))}
                >
                  {tActions('markProcessing')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  {tActions('clearSelection')}
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
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noOrders')}</p>
              {(searchTerm || paymentStatus || paymentMethod || orderSource || shippingRegion) ? (
                <p className="text-sm text-muted-foreground mt-2">{t('adjustFilters')}</p>
              ) : (
                <div className="mt-4">
                  <Button onClick={handleAddOrder}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createFirstOrder')}
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
          onArchiveOrder={handleArchiveOrder}
          onUnarchiveOrder={handleUnarchiveOrder}
          totalCount={totalCount}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {t('pagination', { 
              start: ((currentPage - 1) * pageSize) + 1, 
              end: Math.min(currentPage * pageSize, totalCount), 
              total: totalCount 
            })}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
