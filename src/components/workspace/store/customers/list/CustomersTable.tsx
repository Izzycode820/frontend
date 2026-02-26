import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Badge } from '@/components/shadcn-ui/badge';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import { formatCurrency } from '@/utils/currency';
import type { GetCustomersQuery } from '@/services/graphql/admin-store/queries/customers/__generated__/GetCustomers.generated';

type CustomerNode = NonNullable<
  NonNullable<
    NonNullable<GetCustomersQuery['customers']>['edges'][number]
  >['node']
>;

interface CustomersTableProps {
  customers: CustomerNode[];
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  onSelectAll: (selected: boolean) => void;
  workspaceId: string;
}

export function CustomersTable({
  customers,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll,
  workspaceId,
}: CustomersTableProps) {
  const t = useTranslations('Customers');
  const allSelected = customers.length > 0 && selectedCustomers.length === customers.length;
  const someSelected = selectedCustomers.length > 0 && selectedCustomers.length < customers.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all customers"
                className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
              />
            </TableHead>
            <TableHead>{t('list.table.customer')}</TableHead>
            <TableHead>{t('list.table.location')}</TableHead>
            <TableHead className="text-right">{t('list.table.orders')}</TableHead>
            <TableHead className="text-right">{t('list.table.amountSpent')}</TableHead>
            <TableHead>{t('list.table.lastOrder')}</TableHead>
            <TableHead>{t('list.table.type')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => onSelectCustomer(customer.id)}
                    aria-label={`Select ${customer.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/workspace/${workspaceId}/store/customers/${customer.id}`}
                    className="hover:underline"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{customer.phone}</span>
                        {customer.email && <span>• {customer.email}</span>}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  {customer.city || customer.region ? (
                    <div className="text-sm">
                      {customer.city && <span>{customer.city}</span>}
                      {customer.city && customer.region && <span>, </span>}
                      {customer.region && (
                        <span className="capitalize">{customer.region.replace('_', ' ')}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {customer.totalOrders}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  FCFA {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {customer.lastOrderAt ? (
                    formatDistanceToNow(new Date(customer.lastOrderAt), { addSuffix: true })
                  ) : (
                    t('list.table.never')
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {customer.customerType}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
