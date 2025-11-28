import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Separator } from '@/components/shadcn-ui/separator';
import { formatCurrency } from '@/utils/currency';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  productData?: string;
}

interface UnfulfillmentCardProps {
  status: string;
  items: OrderItem[];
  onMarkAsFulfilled: () => void;
}

export function UnfulfillmentCard({
  status,
  items,
  onMarkAsFulfilled,
}: UnfulfillmentCardProps) {
  const isFulfilled = status?.toLowerCase() === 'fulfilled';

  return (
    <Card>
      <CardHeader className="bg-yellow-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded">
              <Package className="h-4 w-4 text-yellow-700" />
            </div>
            <CardTitle className="text-base">
              {isFulfilled ? 'Fulfilled' : 'Unfulfilled'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 space-y-1">
          <p className="text-sm font-medium">Shipping</p>
        </div>

        <Separator />

        {/* Products List */}
        <div className="divide-y">
          {items.map((item) => {
            let productImage = null;
            try {
              const productData = item.productData ? JSON.parse(item.productData) : null;
              productImage = productData?.image;
            } catch (e) {
              // Ignore parse errors
            }

            return (
              <div key={item.id} className="p-4 flex items-center gap-4">
                {/* Product Image */}
                <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.productName}</p>
                  {item.productSku && (
                    <p className="text-xs text-muted-foreground">SKU: {item.productSku}</p>
                  )}
                </div>

                {/* Price and Quantity */}
                <div className="text-right">
                  <p className="text-sm">
                    FCFA {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                  <p className="text-sm font-medium">
                    FCFA {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {!isFulfilled && (
          <div className="p-4 border-t">
            <Button onClick={onMarkAsFulfilled} className="w-full">
              Mark as fulfilled
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
