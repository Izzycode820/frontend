import { Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  region?: string | null;
  totalOrders: number;
  totalSpent: string;
}

interface OrderSidebarProps {
  notes?: string | null;
  customer?: Customer | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  shippingRegion?: string | null;
}

export function OrderSidebar({
  notes,
  customer,
  customerName,
  customerPhone,
  customerEmail,
  shippingAddress,
  billingAddress,
  shippingRegion,
}: OrderSidebarProps) {
  // Use live customer data if available, otherwise use snapshot
  const displayName = customer?.name || customerName;
  const displayPhone = customer?.phone || customerPhone;
  const displayEmail = customer?.email || customerEmail;

  return (
    <div className="space-y-4">
      {/* Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">Notes</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {notes ? (
            <p className="text-sm">{notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No notes from customer</p>
          )}
        </CardContent>
      </Card>

      {/* Customer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayName ? (
            <>
              <div>
                <p className="text-sm font-medium">{displayName}</p>
                {customer && (
                  <p className="text-xs text-muted-foreground">
                    {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Contact information</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                {displayEmail ? (
                  <p className="text-sm text-blue-600">{displayEmail}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No email provided</p>
                )}
                {displayPhone ? (
                  <p className="text-sm">{displayPhone}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No phone number</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No customer information</p>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Shipping address</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shippingAddress || shippingRegion ? (
            <div className="text-sm space-y-1">
              {displayName && <p className="font-medium">{displayName}</p>}
              {shippingAddress && <p className="whitespace-pre-line">{shippingAddress}</p>}
              {shippingRegion && <p className="capitalize">{shippingRegion.replace('_', ' ')}</p>}
              <p>Cameroon</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipping address provided</p>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Billing address</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {billingAddress ? (
            <div className="text-sm space-y-1">
              {displayName && <p className="font-medium">{displayName}</p>}
              <p className="whitespace-pre-line">{billingAddress}</p>
              <p>Cameroon</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No billing address provided</p>
          )}
        </CardContent>
      </Card>

      {/* Conversion Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Conversion summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            There aren't any conversion details available for this order
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
