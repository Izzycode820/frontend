'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Check, ChevronsUpDown, ChevronRight, ArrowLeft, Search as SearchIcon } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PickerView>('ROOT');
  const [search, setSearch] = useState('');

  // Queries (fetched on demand / when view is active ideally, but hook rules apply) 
  const { data: categoriesData } = useQuery(CategoriesDocument, {
     variables: { first: 50 }, // Use pagination or search if needed
     skip: view !== 'COLLECTIONS' && !open 
  });

  const { data: pagesData } = useQuery(GetPagesDocument, {
     variables: { workspaceId }, 
     skip: view !== 'PAGES' && !open || !workspaceId
  });

  const { data: blogsData } = useQuery(GetBlogsDocument, {
     skip: view !== 'BLOGS' && !open // Fetches only when needed
  });

  const { data: articlesData } = useQuery(GetArticlesDocument, {
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
              result = { title: 'Home page', value: '/', type: 'HTTP' };
              break;
          case 'SEARCH':
              result = { title: 'Search', value: 'search', type: 'SYSTEM_ROUTE' };
              break;
          case 'PRODUCTS':
              result = { title: 'All Products', value: '/products', type: 'HTTP' }; // User requested no drill down
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
              result = { title: 'Policies', value: '/policies', type: 'POLICY' };
              break;
      }
      
      onChange(result);
      setOpen(false);
  };

  const handleSelectCollection = (collection: any) => {
      onChange({
          title: collection.name,
          // Use ID for value if robust, or Slug if preferred for display
          // User said: "we benefit from images and slug at once... use only the fields we need"
          // We send ID to backend for FK, but Value might need to be slug for frontend routing?
          // Actually, if we send ID, backend can resolve slug.
          // Let's store slug in value for immediate UI feedback, but ID is the key.
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
        <CommandGroup heading="Routes">
            <CommandItem onSelect={() => handleSelectRoot('HOME', 'Home page')}>
                <span className="flex-1">Home page</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('SEARCH', 'Search')}>
                <span className="flex-1">Search</span>
            </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Resources">
            <CommandItem onSelect={() => handleSelectRoot('COLLECTIONS', 'Collections')}>
                <span className="flex-1">Collections</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('PRODUCTS', 'Products')}>
                <span className="flex-1">Products</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('PAGES', 'Pages')}>
                <span className="flex-1">Pages</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('BLOGS', 'Blogs')}>
                <span className="flex-1">Blogs</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('ARTICLES', 'Blog Posts')}>
                <span className="flex-1">Blog Posts</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => handleSelectRoot('POLICIES', 'Policies')}>
                <span className="flex-1">Policies</span>
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
                  <span className="text-sm font-medium">Back to Link types</span>
              </div>
              <CommandGroup heading="Collections">
                  {collections.length === 0 && <CommandEmpty>No collections found.</CommandEmpty>}
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
                  <span className="text-sm font-medium">Back to Link types</span>
              </div>
              <CommandGroup heading="Pages">
                  {pages.length === 0 && <CommandEmpty>No pages found.</CommandEmpty>}
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
                  <span className="text-sm font-medium">Back to Link types</span>
              </div>
              <CommandGroup heading="Blogs">
                  {blogs.length === 0 && <CommandEmpty>No blogs found.</CommandEmpty>}
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
                  <span className="text-sm font-medium">Back to Link types</span>
              </div>
              <CommandGroup heading="Blog Posts">
                  {articles.length === 0 && <CommandEmpty>No articles found.</CommandEmpty>}
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
              // Value might be ID, we probably want to show Title. 
              // But LinkPicker is controlled, so parent should pass display value?
              // The `value` prop is used for display here? Or the ID?
              // Standard Pattern: value is ID, we need a label.
              // For now, let's assume the parent passes the Display Label as the `value` prop for simple UI, 
              // or we allow children.
              // Refactoring: Let's assume `value` passed here is the Display Title for MVP simplicity, 
              // OR parent manages display.
          ) : (
            "Search or paste a link..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command>
          <CommandInput placeholder="Search..." onValueChange={setSearch} />
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
