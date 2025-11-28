'use client';

import { useQuery } from '@apollo/client/react';
import { GetOrderDocument } from '@/services/graphql/admin-store/queries/orders/__generated__/getOrder.generated';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { OrderDetailsHeader } from './OrderDetailsHeader';
import { UnfulfillmentCard } from './UnfulfillmentCard';
import { PaymentCard } from './PaymentCard';
import { TimelineSection } from './TimelineSection';
import { OrderSidebar } from './OrderSidebar';
import { toast } from 'sonner';

interface OrderDetailsContainerProps {
  orderId: string;
}

export default function OrderDetailsContainer({ orderId }: OrderDetailsContainerProps) {
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);

  const { data, loading, error, refetch } = useQuery(GetOrderDocument, {
    variables: { id: orderId },
    skip: !currentWorkspace,
  });

  const order = data?.order;

  const handleEdit = () => {
    toast.info('Edit order functionality coming soon!');
  };

  const handleRefund = () => {
    toast.info('Refund functionality coming soon!');
  };

  const handleCancel = () => {
    toast.info('Cancel order functionality coming soon!');
  };

  const handleMarkAsFulfilled = () => {
    toast.info('Mark as fulfilled functionality coming soon!');
    // TODO: Call mutation to update order status
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading order...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load order</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || 'Order not found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <OrderDetailsHeader
        orderNumber={order.orderNumber}
        status={order.status}
        paymentStatus={order.paymentStatus}
        createdAt={order.createdAt}
        orderSource={order.orderSource}
        workspaceId={currentWorkspace?.id || ''}
        onEdit={handleEdit}
        onRefund={handleRefund}
        onCancel={handleCancel}
        canBeCancelled={order.canBeCancelled}
        canBeRefunded={order.canBeRefunded}
      />

      {/* Main Content */}
      <div className="px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unfulfillment Card */}
            <UnfulfillmentCard
              status={order.status}
              items={order.items || []}
              onMarkAsFulfilled={handleMarkAsFulfilled}
            />

            {/* Payment Card */}
            <PaymentCard
              paymentStatus={order.paymentStatus}
              paymentMethod={order.paymentMethod}
              subtotal={order.subtotal}
              shippingCost={order.shippingCost}
              taxAmount={order.taxAmount}
              discountAmount={order.discountAmount}
              totalAmount={order.totalAmount}
              currency={order.currency}
              itemCount={order.itemCount}
            />

            {/* Timeline */}
            <TimelineSection
              createdAt={order.createdAt}
              confirmedAt={order.confirmedAt}
              shippedAt={order.shippedAt}
              deliveredAt={order.deliveredAt}
              orderNumber={order.orderNumber}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <OrderSidebar
              notes={order.notes}
              customer={order.customer}
              customerName={order.customerName}
              customerPhone={order.customerPhone}
              customerEmail={order.customerEmail}
              shippingAddress={order.shippingAddress}
              billingAddress={order.billingAddress}
              shippingRegion={order.shippingRegion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
