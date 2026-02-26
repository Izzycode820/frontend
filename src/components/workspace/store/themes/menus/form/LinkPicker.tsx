'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Check, ChevronsUpDown, ChevronRight, ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shadcn-ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/shadcn-ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn-ui/popover';

// Queries
import { CategoriesDocument } from '@/services/graphql/admin-store/queries/categories/__generated__/categories.generated';
import { GetPagesDocument } from '@/services/graphql/admin-store/queries/pages/__generated__/GetPages.generated';
import { GetBlogsDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetBlogs.generated';
import { GetArticlesDocument } from '@/services/graphql/admin-store/queries/blogs/__generated__/GetArticles.generated';

export type LinkType = 'HTTP' | 'PAGE' | 'COLLECTION' | 'PRODUCT' | 'BLOG' | 'ARTICLE' | 'POLICY' | 'SYSTEM_ROUTE';

export interface LinkResult {
  title: string;
  value: string;
  type: LinkType;
  id?: string; // For robust linking
}

interface LinkPickerProps {
  value?: string;
  onChange: (result: LinkResult) => void;
  className?: string;
  workspaceId: string;
}

type PickerView = 'ROOT' | 'COLLECTIONS' | 'PAGES' | 'BLOGS' | 'ARTICLES';

export function LinkPicker({ value, onChange, className, workspaceId }: LinkPickerProps) {
  const t = useTranslations('Themes');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PickerView>('ROOT');
  const [search, setSearch] = useState('');

  // Queries (fetched on demand / when view is active ideally, but hook rules apply) 
  const { data: categoriesData, loading: categoriesLoading } = useQuery(CategoriesDocument, {
     variables: { first: 50 }, // Use pagination or search if needed
     skip: view !== 'COLLECTIONS' && !open 
  });

  const { data: pagesData, loading: pagesLoading } = useQuery(GetPagesDocument, {
     variables: { workspaceId }, 
     skip: view !== 'PAGES' && !open || !workspaceId
  });

  const { data: blogsData, loading: blogsLoading } = useQuery(GetBlogsDocument, {
     skip: view !== 'BLOGS' && !open // Fetches only when needed
  });

  const { data: articlesData, loading: articlesLoading } = useQuery(GetArticlesDocument, {
     variables: { 
         limit: 20, // Reasonable initial load
         search: view === 'ARTICLES' ? search : undefined // Pass search term only when in Article view
     },
     skip: view !== 'ARTICLES' && !open
  });
  
  const handleSelectRoot = (type: string, label: string) => {
      if (type === 'COLLECTIONS') {
          setView('COLLECTIONS');
          setSearch('');
          return;
      }
      if (type === 'PAGES') {
          setView('PAGES');
          setSearch('');
          return;
      }

      // Static Routes
      let result: LinkResult = { title: label, value: '', type: 'HTTP' };
      
      switch(type) {
          case 'HOME':
              result = { title: t('menus.form.picker.home'), value: '/', type: 'HTTP' };
              break;
          case 'SEARCH':
              result = { title: t('menus.form.picker.search'), value: 'search', type: 'SYSTEM_ROUTE' };
              break;
          case 'PRODUCTS':
              result = { title: t('menus.form.picker.products'), value: '/products', type: 'HTTP' }; // User requested no drill down
              break;
          case 'BLOGS':
              setView('BLOGS');
              setSearch('');
              return;
          case 'ARTICLES':
              setView('ARTICLES');
              setSearch('');
              return;
          case 'POLICIES':
              result = { title: t('menus.form.picker.policies'), value: '/policies', type: 'POLICY' };
              break;
      }
      
      onChange(result);
      setOpen(false);
  };

  const handleSelectCollection = (collection: any) => {
      onChange({
          title: collection.name,
          value: collection.slug, 
          type: 'COLLECTION',
          id: collection.id
      });
      setOpen(false);
      setView('ROOT');
  };

  const handleSelectPage = (page: any) => {
      onChange({
          title: page.title,
          value: page.id,
          type: 'PAGE',
          id: page.id
      });
      setOpen(false);
      setView('ROOT');
  };

  const handleSelectBlog = (blog: any) => {
      onChange({
          title: blog.title,
          value: blog.handle, // Using handle as value for Blog Container mostly
          type: 'BLOG',
          id: blog.id
      });
      setOpen(false);
      setView('ROOT');
  };

  const handleSelectArticle = (article: any) => {
      onChange({
          title: article.title,
          value: article.handle, // Fallback value
          type: 'ARTICLE',
          id: article.id
      });
      setOpen(false);
      setView('ROOT');
  };

  const renderRoot = () => (
      <>
        <CommandGroup heading={t('menus.form.picker.routes')}>
            <CommandItem onSelect={() => handleSelectRoot('HOME', t('menus.form.picker.home'))}>
                <span className="flex-1">{t('menus.form.picker.home')}</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('SEARCH', t('menus.form.picker.search'))}>
                <span className="flex-1">{t('menus.form.picker.search')}</span>
            </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t('menus.form.picker.resources')}>
            <CommandItem onSelect={() => handleSelectRoot('COLLECTIONS', t('menus.form.picker.collections'))}>
                <span className="flex-1">{t('menus.form.picker.collections')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('PRODUCTS', t('menus.form.picker.products'))}>
                <span className="flex-1">{t('menus.form.picker.products')}</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('PAGES', t('menus.form.picker.pages'))}>
                <span className="flex-1">{t('menus.form.picker.pages')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('BLOGS', t('menus.form.picker.blogs'))}>
                <span className="flex-1">{t('menus.form.picker.blogs')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('ARTICLES', t('menus.form.picker.blogPosts'))}>
                <span className="flex-1">{t('menus.form.picker.blogPosts')}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('POLICIES', t('menus.form.picker.policies'))}>
                <span className="flex-1">{t('menus.form.picker.policies')}</span>
            </CommandItem>
        </CommandGroup>
      </>
  );

  const renderCollections = () => {
       const edges = categoriesData?.categories?.edges || [];
       // Helper to clean edges
       const collections = edges.map(e => e?.node).filter(Boolean);
       
       return (
           <>
              <div className="flex items-center p-2 border-b cursor-pointer hover:bg-muted/50" onClick={() => setView('ROOT')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{t('menus.form.picker.backToLinkTypes')}</span>
              </div>
              <CommandGroup heading={t('menus.form.picker.collections')}>
                  {categoriesLoading && (
                      <CommandItem disabled>{t('menus.form.picker.loadingCollections')}</CommandItem>
                  )}
                  {!categoriesLoading && collections.length === 0 && <CommandEmpty>{t('menus.form.picker.noCollections')}</CommandEmpty>}
                  {collections.map((c: any) => (
                      <CommandItem key={c.id} onSelect={() => handleSelectCollection(c)}>
                          {c.name}
                      </CommandItem>
                  ))}
              </CommandGroup>
           </>
       );
  };

  const renderPages = () => {
      // Pages query structure might be slightly diff, check generated types or assume edges/nodes pattern
      const edges = pagesData?.pages || []; // Wait, checked GetPages.graphql earlier? No. 
      // PagesListContainer uses `pagesData?.pages` as a direct array (mistake I fixed earlier).
      // Let's assume it's an array based on my previous fix in PagesListContainer.
      const pages = Array.isArray(edges) ? edges : [];

      return (
           <>
              <div className="flex items-center p-2 border-b cursor-pointer hover:bg-muted/50" onClick={() => setView('ROOT')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{t('menus.form.picker.backToLinkTypes')}</span>
              </div>
              <CommandGroup heading={t('menus.form.picker.pages')}>
                  {pagesLoading && (
                      <CommandItem disabled>{t('menus.form.picker.loadingPages')}</CommandItem>
                  )}
                  {!pagesLoading && pages.length === 0 && <CommandEmpty>{t('menus.form.picker.noPagesResult')}</CommandEmpty>}
                  {pages.map((p: any) => (
                      <CommandItem key={p.id} onSelect={() => handleSelectPage(p)}>
                          {p.title}
                      </CommandItem>
                  ))}
              </CommandGroup>
           </>
       );
  };

  const renderBlogs = () => {
      const edges = blogsData?.blogs?.edges || [];
      const blogs = edges.map((e: any) => e?.node).filter(Boolean);

      return (
           <>
              <div className="flex items-center p-2 border-b cursor-pointer hover:bg-muted/50" onClick={() => setView('ROOT')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{t('menus.form.picker.backToLinkTypes')}</span>
              </div>
              <CommandGroup heading={t('menus.form.picker.blogs')}>
                  {blogsLoading && (
                      <CommandItem disabled>{t('menus.form.picker.loadingBlogs')}</CommandItem>
                  )}
                  {!blogsLoading && blogs.length === 0 && <CommandEmpty>{t('menus.form.picker.noBlogs')}</CommandEmpty>}
                  {blogs.map((b: any) => (
                      <CommandItem key={b.id} onSelect={() => handleSelectBlog(b)}>
                          {b.title}
                      </CommandItem>
                  ))}
              </CommandGroup>
           </>
       );
  };

  const renderArticles = () => {
      const edges = articlesData?.articles?.edges || [];
      const articles = edges.map((e: any) => e?.node).filter(Boolean);

      return (
           <>
              <div className="flex items-center p-2 border-b cursor-pointer hover:bg-muted/50" onClick={() => setView('ROOT')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">{t('menus.form.picker.backToLinkTypes')}</span>
              </div>
              <CommandGroup heading={t('menus.form.picker.blogPosts')}>
                  {articlesLoading && (
                      <CommandItem disabled>{t('menus.form.picker.loadingArticles')}</CommandItem>
                  )}
                  {!articlesLoading && articles.length === 0 && <CommandEmpty>{t('menus.form.picker.noArticles')}</CommandEmpty>}
                  {articles.map((a: any) => (
                      <CommandItem key={a.id} onSelect={() => handleSelectArticle(a)}>
                          <span className="flex-1 truncate">{a.title}</span>
                          {a.blog && <span className="ml-2 text-xs text-muted-foreground">{a.blog.title}</span>}
                      </CommandItem>
                  ))}
              </CommandGroup>
           </>
       );
  };


  return (
    <Popover open={open} onOpenChange={(o) => {
        setOpen(o);
        if (!o) setView('ROOT'); // Reset view on close
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
              <span className="truncate">{value}</span> 
          ) : (
            t('menus.form.picker.placeholder')
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command>
          <CommandInput placeholder={t('menus.form.picker.searchPlaceholder')} onValueChange={setSearch} />
          <CommandList>
              {view === 'ROOT' && renderRoot()}
              {view === 'COLLECTIONS' && renderCollections()}
              {view === 'PAGES' && renderPages()}
              {view === 'BLOGS' && renderBlogs()}
              {view === 'ARTICLES' && renderArticles()}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
