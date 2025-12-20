'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { GetBillingOverviewDocument } from '@/services/graphql/subscription/queries/billing/__generated__/get-billing-overview.generated';
import { GetPastBillsDocument } from '@/services/graphql/subscription/queries/billing/__generated__/get-past-bills.generated';
import { GetBillingProfileDocument } from '@/services/graphql/subscription/queries/billing/__generated__/get-billing-profile.generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import { Badge } from '@/components/shadcn-ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import { Checkbox } from '@/components/shadcn-ui/checkbox';
import { Input } from '@/components/shadcn-ui/input';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import {
  CreditCard,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit
} from 'lucide-react';

export function BillingPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<string>('newest_first');
  const pageSize = 50;

  // Query for billing overview
  const { data: overviewData, loading: overviewLoading } = useQuery(GetBillingOverviewDocument);

  // Query for billing profile (for payment method)
  const { data: profileData, loading: profileLoading } = useQuery(GetBillingProfileDocument);

  // Query for past bills
  const { data: billsData, loading: billsLoading } = useQuery(GetPastBillsDocument, {
    variables: {
      limit: pageSize,
      offset: currentPage * pageSize,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortOrder,
      search: searchQuery || undefined,
    },
  });

  const billingOverview = overviewData?.billingOverview;
  const billingProfile = profileData?.billingProfile;
  const pastBills = billsData?.pastBills || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount === null || amount === undefined) return 'XAF 0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `XAF ${numAmount.toFixed(2)}`;
  };

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      CREATED: 'Subscription created',
      RENEWED: 'Billing cycle ended',
      UPGRADED: 'Plan upgraded',
      DOWNGRADED: 'Plan downgraded',
      CONVERTED: 'Trial converted',
      SUSPENDED: 'Subscription suspended',
      REACTIVATED: 'Subscription reactivated',
      CANCELLED: 'Subscription cancelled',
    };
    return actionMap[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing</h1>
        <Button
          variant="outline"
          onClick={() => router.push('./billing/profile')}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Billing profile
        </Button>
      </div>

      {/* Upcoming Bill Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming bill</CardTitle>
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              View bill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {overviewLoading ? (
            <>
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            <>
              {/* Amount */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {formatCurrency(billingOverview?.upcomingBillAmount)}
                  </span>
                  <span className="text-muted-foreground">XAF</span>
                </div>
              </div>

              {/* Next bill info */}
              <p className="text-sm text-muted-foreground">
                {billingOverview?.daysUntilBill !== null && billingOverview?.daysUntilBill !== undefined
                  ? `Next bill in ${billingOverview.daysUntilBill} days${
                      billingOverview?.upcomingBillAmount
                        ? ` or when your ${formatCurrency(billingOverview.upcomingBillAmount)} XAF threshold is reached. You have ${formatCurrency(billingOverview.upcomingBillAmount)} remaining.`
                        : '.'
                    }`
                  : 'No upcoming bill scheduled.'}
              </p>

              {/* Payment Method */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {billingProfile?.primaryPaymentMethod ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-8 bg-blue-600 rounded text-white font-bold text-sm">
                          {billingProfile.primaryPaymentMethod === 'MTN' ? 'MTN' :
                           billingProfile.primaryPaymentMethod === 'Orange' ? 'OM' :
                           billingProfile.primaryPaymentMethod}
                        </div>
                        <div>
                          <p className="font-medium">
                            {billingProfile.primaryPaymentMethod}{' '}
                            {billingProfile.userPhone
                              ? `•••• ${billingProfile.userPhone.slice(-4)}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-8 bg-gray-200 rounded text-gray-500 font-bold text-sm">
                          --
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No payment method added
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push('./billing/profile')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Plan settings link */}
              <p className="text-sm">
                To make changes to your plan,{' '}
                <Button
                  variant="link"
                  className="text-blue-600 p-0 h-auto"
                  onClick={() => router.push('./plan')}
                >
                  visit plan settings
                </Button>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Past Bills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Past bills</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('./billing/charges')}>
                  See charge table
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex items-center justify-between gap-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bills..."
                  className="pl-9 w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'newest_first' ? 'oldest_first' : 'newest_first')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          {billsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Bill number</TableHead>
                    <TableHead>Date issued</TableHead>
                    <TableHead>Bill reason</TableHead>
                    <TableHead className="text-right">Bill total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastBills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No bills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pastBills.map((bill) => (
                      <TableRow key={bill?.billNumber}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{bill?.billNumber}</TableCell>
                        <TableCell>{bill?.createdAt ? formatDate(bill.createdAt) : '-'}</TableCell>
                        <TableCell>{bill?.action ? getActionText(bill.action) : '-'}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(bill?.amountPaid)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={bill?.status === 'PAID' ? 'default' : 'secondary'}
                            className={
                              bill?.status === 'PAID'
                                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                : ''
                            }
                          >
                            {bill?.status === 'PAID' ? 'Paid' : bill?.status === 'UNPAID' ? 'Unpaid' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pastBills.length >= pageSize && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={pastBills.length < pageSize}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
