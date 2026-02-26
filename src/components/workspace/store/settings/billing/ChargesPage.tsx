'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { GetChargesDocument } from '@/services/graphql/subscription/queries/billing/__generated__/get-charges.generated';
import { Card, CardContent } from '@/components/shadcn-ui/card';
import { Button } from '@/components/shadcn-ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { useTranslations, useFormatter } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn-ui/dropdown-menu';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';

export function ChargesPage() {
  const router = useRouter();
  const t = useTranslations('Billing');
  const format = useFormatter();
  const [currentPage, setCurrentPage] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [chargeTypeFilter, setChargeTypeFilter] = useState<string>('all');
  const pageSize = 50;

  // Calculate date range based on filter
  const getDateRange = () => {
    if (dateFilter === 'all') return { dateFrom: undefined, dateTo: undefined };

    const now = new Date();
    const dateTo = now.toISOString();
    let dateFrom: string | undefined;

    switch (dateFilter) {
      case 'last_7_days':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_30_days':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last_90_days':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        dateFrom = undefined;
    }

    return { dateFrom, dateTo };
  };

  const { dateFrom, dateTo } = getDateRange();

  // Query for charges
  const { data, loading } = useQuery(GetChargesDocument, {
    variables: {
      limit: pageSize,
      offset: currentPage * pageSize,
      chargeType: chargeTypeFilter === 'all' ? undefined : chargeTypeFilter,
      dateFrom,
      dateTo,
    },
  });

  const charges = data?.charges || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format.dateTime(date, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: string | number | null | undefined) => {
    const numAmount = amount === null || amount === undefined
      ? 0
      : typeof amount === 'string' ? parseFloat(amount) : amount;

    return format.number(numAmount, { style: 'currency', currency: 'XAF' });
  };

  const getChargeTypeLabel = (chargeType: string) => {
    // Falls back to key if not found in en/fr.json
    return t(`chargeTypes.${chargeType}`);
  };

  const dateFilterOptions = [
    { label: t('allTime'), value: 'all' },
    { label: t('last7Days'), value: 'last_7_days' },
    { label: t('last30Days'), value: 'last_30_days' },
    { label: t('last90Days'), value: 'last_90_days' },
  ];

  const chargeTypeOptions = [
    { label: t('allTypes'), value: 'all' },
    { label: t('chargeTypes.SUBSCRIPTION'), value: 'SUBSCRIPTION' },
    { label: t('chargeTypes.SUBSCRIPTION_RENEWAL'), value: 'SUBSCRIPTION_RENEWAL' },
    { label: t('chargeTypes.SUBSCRIPTION_UPGRADE'), value: 'SUBSCRIPTION_UPGRADE' },
    { label: t('chargeTypes.DOMAIN'), value: 'DOMAIN' },
    { label: t('chargeTypes.DOMAIN_RENEWAL'), value: 'DOMAIN_RENEWAL' },
    { label: t('chargeTypes.THEME'), value: 'THEME' },
    { label: t('chargeTypes.CHECKOUT'), value: 'CHECKOUT' },
    { label: t('chargeTypes.ADDON'), value: 'ADDON' },
    { label: t('chargeTypes.OTHER'), value: 'OTHER' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('charges')}</h1>
        </div>
        <Button variant="default" className="bg-black hover:bg-black/90 text-white w-full sm:w-auto">
          {t('export')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
            {/* Date Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  {t('date')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {dateFilterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setDateFilter(option.value);
                      setCurrentPage(0);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bill Number Filter - Placeholder for now */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  {t('billNumber')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>{t('allBills')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Charge Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  {t('chargeType')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {chargeTypeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => {
                      setChargeTypeFilter(option.value);
                      setCurrentPage(0);
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[500px] px-4 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t('billNumber')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('date')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('chargeType')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('source')}</TableHead>
                        <TableHead className="text-right whitespace-nowrap">{t('amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {charges.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            {t('noCharges')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        charges.map((charge) => (
                          <TableRow key={charge?.reference}>
                            <TableCell className="font-medium whitespace-nowrap">#{charge?.reference}</TableCell>
                            <TableCell className="whitespace-nowrap">{charge?.createdAt ? formatDate(charge.createdAt) : '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">{charge?.chargeType ? getChargeTypeLabel(charge.chargeType) : '-'}</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatCurrency(charge?.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {charges.length >= pageSize && (
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
                    disabled={charges.length < pageSize}
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
