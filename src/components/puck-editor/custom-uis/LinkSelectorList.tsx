'use client';

import React, { useState, useEffect } from 'react';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { adminStoreClient } from '@/services/graphql/clients';
import { CategoriesDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/categories.generated';
import { GetPagesDocument } from '@/services/graphql/admin-store/queries/pages/__generated__/GetPages.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { GetArticlesDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticles.generated';
import { GetProductsPickerDocument } from '@/services/graphql/admin-store/queries/products/__generated__/GetProductsPicker.generated';

import { ScrollArea } from '@/components/shadcn-ui/scroll-area';
import { Skeleton } from '@/components/shadcn-ui/skeleton';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { useParams } from 'next/navigation';
import { 
  ChevronRight, 
  ArrowLeft, 
  Globe, 
  Package, 
  FileText, 
  Layout, 
  BookOpen, 
  Hash,
  Search,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LinkType = 'HTTP' | 'PAGE' | 'COLLECTION' | 'PRODUCT' | 'BLOG' | 'ARTICLE' | 'POLICY' | 'SYSTEM_ROUTE';

export interface LinkResult {
  title: string;
  value: string;
  type: LinkType;
  id?: string;
}

interface LinkSelectorListProps {
  selectedLink?: string; // This is the value stored in Puck data
  onSelect: (result: LinkResult) => void;
  isOpen: boolean;
}

type SelectorView = 'ROOT' | 'COLLECTIONS' | 'PRODUCTS' | 'PAGES' | 'BLOGS' | 'ARTICLES' | 'EXTERNAL';

function LinkSelectorListInner({
  selectedLink,
  onSelect,
  isOpen,
}: LinkSelectorListProps) {
  const [view, setView] = useState<SelectorView>('ROOT');
  const [search, setSearch] = useState('');
  const params = useParams();
  const workspaceId = (params?.workspace_id as string) || '';

  // Queries
  const { data: categoriesData, loading: categoriesLoading } = useQuery(CategoriesDocument, {
    variables: { first: 100 },
    skip: !isOpen || view !== 'COLLECTIONS'
  });

  const { data: productsData, loading: productsLoading } = useQuery(GetProductsPickerDocument, {
    variables: { first: 50 },
    skip: !isOpen || view !== 'PRODUCTS'
  });

  const { data: pagesData, loading: pagesLoading } = useQuery(GetPagesDocument, {
    variables: { workspaceId },
    skip: !isOpen || view !== 'PAGES' || !workspaceId
  });

  const { data: blogsData, loading: blogsLoading } = useQuery(GetBlogsDocument, {
    skip: !isOpen || view !== 'BLOGS'
  });

  const { data: articlesData, loading: articlesLoading } = useQuery(GetArticlesDocument, {
    variables: { limit: 50 },
    skip: !isOpen || view !== 'ARTICLES'
  });

  // Reset view when closing
  useEffect(() => {
    if (!isOpen) {
      setView('ROOT');
      setSearch('');
    }
  }, [isOpen]);

  const handleApplyExternal = () => {
    if (search) {
      onSelect({
        title: search,
        value: search,
        type: 'HTTP'
      });
    }
  };

  const renderRoot = () => (
    <div className="space-y-1 p-2">
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Static Routes
      </div>
      <Button 
        variant="ghost" 
        className="w-full justify-between" 
        onClick={() => onSelect({ title: 'Home', value: '/', type: 'HTTP' })}
      >
        <div className="flex items-center gap-2">
          <Layout className="h-4 w-4 text-primary" />
          <span>Home page</span>
        </div>
        {selectedLink === '/' && <Check className="h-4 w-4 text-primary" />}
      </Button>
      <Button 
        variant="ghost" 
        className="w-full justify-between" 
        onClick={() => onSelect({ title: 'All Products', value: '/products', type: 'HTTP' })}
      >
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span>All Products</span>
        </div>
        {selectedLink === '/products' && <Check className="h-4 w-4 text-primary" />}
      </Button>

      <div className="px-2 py-1.5 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Dynamic Data
      </div>
      <Button variant="ghost" className="w-full justify-between" onClick={() => setView('COLLECTIONS')}>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>Collections</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" className="w-full justify-between" onClick={() => setView('PRODUCTS')}>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>Products</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" className="w-full justify-between" onClick={() => setView('PAGES')}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>Pages</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" className="w-full justify-between" onClick={() => setView('BLOGS')}>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>Blogs</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" className="w-full justify-between" onClick={() => setView('ARTICLES')}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>Blog Posts</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>

      <div className="px-2 py-1.5 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Custom
      </div>
      <div className="p-2 space-y-2">
        <div className="relative">
          <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Paste or type URL..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyExternal()}
          />
        </div>
        {search && (
          <Button className="w-full" onClick={handleApplyExternal}>
            Link to "{search}"
          </Button>
        )}
      </div>
    </div>
  );

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-2 p-2 border-b mb-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setView('ROOT')}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );

  const renderCollections = () => {
    const collections = categoriesData?.categories?.edges?.map(e => e?.node) || [];
    return (
      <div className="p-2 space-y-1">
        {renderHeader('Select Collection')}
        {categoriesLoading && <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
        {collections.map((c: any) => (
          <Button 
            key={c.id} 
            variant="ghost" 
            className="w-full justify-start font-normal text-left h-auto py-2"
            onClick={() => onSelect({ title: c.name, value: `/collections/${c.slug}`, type: 'COLLECTION', id: c.id })}
          >
            {c.name}
          </Button>
        ))}
      </div>
    );
  };

  const renderProducts = () => {
    const products = productsData?.products?.edges?.map(e => e?.node) || [];
    return (
      <div className="p-2 space-y-1">
        {renderHeader('Select Product')}
        {productsLoading && <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
        {products.map((p: any) => (
          <Button 
            key={p.id} 
            variant="ghost" 
            className="w-full justify-start font-normal truncate h-auto py-2"
            onClick={() => onSelect({ title: p.name, value: `/products/${p.slug}`, type: 'PRODUCT', id: p.id })}
          >
            <div className="flex items-center gap-2 truncate">
              {p.featuredMedia?.url && (
                <img src={p.featuredMedia.url} className="w-10 h-10 rounded border object-cover" alt="" />
              )}
              <span className="truncate">{p.name}</span>
            </div>
          </Button>
        ))}
      </div>
    );
  };

  const renderPages = () => {
    const pages = pagesData?.pages || [];
    return (
      <div className="p-2 space-y-1">
        {renderHeader('Select Page')}
        {pagesLoading && <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
        {pages.map((p: any) => (
          <Button 
            key={p.id} 
            variant="ghost" 
            className="w-full justify-start font-normal text-left h-auto py-2"
            onClick={() => onSelect({ title: p.title, value: `/pages/${p.handle}`, type: 'PAGE', id: p.id })}
          >
            {p.title}
          </Button>
        ))}
      </div>
    );
  };

  const renderBlogs = () => {
    const blogs = blogsData?.blogs?.edges?.map(e => e?.node) || [];
    return (
      <div className="p-2 space-y-1">
        {renderHeader('Select Blog')}
        {blogsLoading && <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
        {blogs.map((b: any) => (
          <Button 
            key={b.id} 
            variant="ghost" 
            className="w-full justify-start font-normal text-left h-auto py-2"
            onClick={() => onSelect({ title: b.title, value: `/blogs/${b.handle}`, type: 'BLOG', id: b.id })}
          >
            {b.title}
          </Button>
        ))}
      </div>
    );
  };

  const renderArticles = () => {
    const articles = articlesData?.articles?.edges?.map(e => e?.node) || [];
    return (
      <div className="p-2 space-y-1">
        {renderHeader('Select Blog Post')}
        {articlesLoading && <div className="p-4 space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>}
        {articles.map((a: any) => (
          <Button 
            key={a.id} 
            variant="ghost" 
            className="w-full justify-start font-normal text-left h-auto py-2 flex-col items-start"
            onClick={() => onSelect({ title: a.title, value: `/blogs/article/${a.handle}`, type: 'ARTICLE', id: a.id })}
          >
            <span className="font-medium">{a.title}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{a.blog?.title || 'Blog'}</span>
          </Button>
        ))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[450px]">
      {view === 'ROOT' && renderRoot()}
      {view === 'COLLECTIONS' && renderCollections()}
      {view === 'PRODUCTS' && renderProducts()}
      {view === 'PAGES' && renderPages()}
      {view === 'BLOGS' && renderBlogs()}
      {view === 'ARTICLES' && renderArticles()}
    </ScrollArea>
  );
}

export function LinkSelectorList(props: LinkSelectorListProps) {
  return (
    <ApolloProvider client={adminStoreClient}>
      <LinkSelectorListInner {...props} />
    </ApolloProvider>
  );
}
