'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/shadcn-ui/input';
import { Button } from '@/components/shadcn-ui/button';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/shadcn-ui/sheet';
import { ThemeCard } from '@/components/theme/list/ThemeCard';
import { ThemeFilters } from '@/components/theme/list/ThemeFilters';
import { ThemePagination } from '@/components/theme/list/ThemePagination';
import { ThemeEmptyState } from '@/components/theme/list/ThemeEmptyState';
import { ThemeCardSkeleton } from '@/components/theme/list/ThemeCardSkeleton';
import { ThemesDocument } from '@/services/graphql/themes/queries/showcase/__generated__/themes.generated';
import { useDebounce } from '@/hooks/theme/useDebounce';

const ITEMS_PER_PAGE = 24;

export default function ThemeStorePage() {
  const t = useTranslations('Showcase.page');
  const tTheme = useTranslations('Theme.list.filters');
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms debounce
  const [selectedTemplateType, setSelectedTemplateType] = useState<string | undefined>();
  const [selectedPriceTier, setSelectedPriceTier] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch themes with GraphQL
  const { data, loading, error, fetchMore } = useQuery(ThemesDocument, {
    variables: {
      first: ITEMS_PER_PAGE,
      name_Icontains: debouncedSearchQuery || undefined, // Use debounced value
      templateType: selectedTemplateType,
      priceTier: selectedPriceTier,
    },
  });

  // Transform data
  const themes = data?.themes?.edges?.map(edge => edge?.node).filter(Boolean) || [];
  const totalCount = data?.themes?.totalCount || 0;
  const hasNextPage = data?.themes?.pageInfo?.hasNextPage || false;
  const hasPreviousPage = currentPage > 1;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Handlers
  const handleThemeClick = (slug: string) => {
    router.push(`/showcase/${slug}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    if (page > currentPage && hasNextPage && data?.themes?.pageInfo?.endCursor) {
      fetchMore({
        variables: {
          after: data.themes.pageInfo.endCursor,
        },
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTemplateType(undefined);
    setSelectedPriceTier(undefined);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const hasActiveFilters = searchQuery || selectedTemplateType || selectedPriceTier;

  // Filter Component Instance (Reused)
  const filterComponent = (
    <ThemeFilters
      selectedTemplateType={selectedTemplateType}
      selectedPriceTier={selectedPriceTier}
      onTemplateTypeChange={setSelectedTemplateType}
      onPriceTierChange={setSelectedPriceTier}
    />
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive py-12">
            <p className="text-lg font-semibold mb-2">{t('failedToLoad')}</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">
              {loading ? <span className="animate-pulse">{t('loading')}</span> : t('themesCount', { count: totalCount })}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="default" className="rounded-full px-6">
                  {tTheme('title')}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle>{tTheme('title')}</SheetTitle>
                </SheetHeader>
                {filterComponent}
                <div className="mt-8 pt-4 border-t">
                  <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                    {tTheme('done')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-muted-foreground/20"
            />
          </div>
        </div>

        {/* Main Content: Grid on left, Filters on right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 items-start">
          {/* Left: Theme Grid */}
          <div>
            {loading ? (
              // Loading State: Show Skeleton Grid (during search, filter, or initial load)
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ThemeCardSkeleton key={i} />
                ))}
              </div>
            ) : themes.length === 0 ? (
              <ThemeEmptyState
                hasFilters={!!hasActiveFilters}
                onClearFilters={handleClearFilters}
              />
            ) : (
              // Data Loaded
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 mb-8">
                  {themes.map((theme) => (
                    <ThemeCard
                      key={theme!.id}
                      name={theme!.name}
                      slug={theme!.slug}
                      previewImage={theme!.previewImage}
                      templateType={theme!.templateType}
                      priceTier={theme!.priceTier}
                      priceAmount={theme!.priceAmount}
                      status={theme!.status as any}
                      onClick={() => handleThemeClick(theme!.slug)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <ThemePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

          {/* Right: Filters Sidebar */}
          <div className="hidden lg:block h-full">
            {filterComponent}
          </div>
        </div>
      </div>
    </div>
  );
}
