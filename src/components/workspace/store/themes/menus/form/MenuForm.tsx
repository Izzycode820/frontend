'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore';
import { toast } from 'sonner';
import { Button } from '@/components/shadcn-ui/button';
import { Input } from '@/components/shadcn-ui/input';
import { Label } from '@/components/shadcn-ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { ArrowLeft, Plus, Loader2, GripVertical, Trash, Pencil } from 'lucide-react';

import { CreateNavigationDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/CreateNavigation.generated';
import { UpdateNavigationDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/UpdateNavigation.generated';
import { GetNavigationDocument, GetNavigationQuery }    from '@/services/graphql/admin-store/queries/navigation/__generated__/GetNavigation.generated';
import { GetNavigationsDocument } from '@/services/graphql/admin-store/queries/navigation/__generated__/GetNavigations.generated';
import { MenuItemCreateDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/MenuItemCreate.generated';
import { MenuItemUpdateDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/MenuItemUpdate.generated';
import { MenuItemDeleteDocument } from '@/services/graphql/admin-store/mutations/navigation/__generated__/MenuItemDelete.generated';

import { MenuItemSheet, MenuItemData } from './MenuItemSheet';

interface MenuFormProps {
  menuId?: string;
}

export default function MenuForm({ menuId }: MenuFormProps) {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore(workspaceSelectors.currentWorkspace);
  const isEditing = !!menuId && menuId !== 'new'; // Ensure 'new' param doesn't trigger edit mode

  const [title, setTitle] = useState('');
  const [handle, setHandle] = useState('');
  const [items, setItems] = useState<MenuItemData[]>([]);
  
  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);

  // Mutations
  const [createNavigation, { loading: isCreating }] = useMutation(CreateNavigationDocument, {
      refetchQueries: [
          {
              query: GetNavigationsDocument,
              variables: { workspaceId: currentWorkspace?.id || '' }
          }
      ]
  });
  const [updateNavigation, { loading: isUpdating }] = useMutation(UpdateNavigationDocument);
  const [createMenuItem] = useMutation(MenuItemCreateDocument);
  const [updateMenuItem] = useMutation(MenuItemUpdateDocument);
  const [deleteMenuItem] = useMutation(MenuItemDeleteDocument);

  // Query
  const { data: navigationData, loading: isLoadingData } = useQuery(GetNavigationDocument, {
     variables: { id: (menuId || '') as string },
     skip: !isEditing,
     fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    if (navigationData?.navigation) {
        setTitle(navigationData.navigation.title || '');
        setHandle(navigationData.navigation.handle || '');
        // Map items
        const mappedItems = (navigationData.navigation.items || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            value: item.value || item.url,
            // Add other fields if needed
        }));
        setItems(mappedItems);
    }
  }, [navigationData]);

  const handleAddItem = () => {
      setEditingItem(null);
      setIsSheetOpen(true);
  };

  const handleEditItem = (index: number) => {
      setEditingItem(items[index]);
      setIsSheetOpen(true);
  };

  const handleSheetSave = (item: MenuItemData) => {
      if (editingItem) {
          // Update local state
          setItems(items.map(i => i.id === item.id || (editingItem.title === i.title && !i.id) ? item : i));
      } else {
          // Add new
          setItems([...items, item]);
      }
      setIsSheetOpen(false);
  };
  
  const handleSubmit = async () => {
      if (!title.trim()) {
          toast.error('Title is required');
          return;
      }

      const input: any = {
          title,
      };

      if (isEditing && handle) {
          input.handle = handle;
      }

      try {
         let navId = menuId;
         if (isEditing) {
            await updateNavigation({ 
               variables: { 
                  workspaceId: currentWorkspace?.id || '',
                  id: menuId as string, 
                  input 
               } 
            });
         } else {
            const { data } = await createNavigation({ 
               variables: { 
                  workspaceId: currentWorkspace?.id || '',
                  input 
               } 
            });
            if(data?.navigationCreate?.navigation?.id) {
               navId = data.navigationCreate.navigation.id;
            } else {
               throw new Error('Failed to create navigation container');
            }
         }

         // Handle Items
         if (navId) {
             for (const item of items) {
                 const itemInput: any = { // Use any to bypass strict type check if generating types lag behind
                     title: item.title,
                     type: item.type,
                     value: item.value,
                     // position: index // TODO: Add position handling
                 };
                 
                 // Add Robust Linking IDs
                 if (item.pageId) itemInput.pageId = item.pageId;
                 if (item.collectionId) itemInput.collectionId = item.collectionId; // Ensure mapping matches backend (collection vs category_id?)
                 
                 if (item.id && !item.id.startsWith('temp')) { // Check if real ID
                     // Update
                     await updateMenuItem({ 
                        variables: { 
                             id: item.id, 
                             input: itemInput
                        } 
                     });
                 } else {
                     // Create
                     await createMenuItem({ 
                        variables: { 
                             navigationId: navId, 
                             input: itemInput 
                        } 
                     });
                 }
             }
         }

         toast.success(isEditing ? 'Menu updated' : 'Menu created');
         router.back();
      } catch (err: any) {
          toast.error('Failed to save menu: ' + err.message);
      }
  };

  const handleRemoveExistingItem = async (index: number) => {
      const item = items[index];
      if (item.id && !item.id.startsWith('temp')) {
          if(!confirm('Delete this item now?')) return;
          try {
             await deleteMenuItem({ variables: { id: item.id } });
             toast.success('Item deleted');
             setItems(items.filter((_, i) => i !== index));
          } catch(e: any) {
             toast.error('Failed to delete item: ' + e.message);
          }
      } else {
          setItems(items.filter((_, i) => i !== index));
      }
  };

  if (isLoadingData) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
       <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:pl-0 hover:bg-transparent">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
             <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
             </Button>
          </div>
       </div>

       <div className="grid gap-6">
          <Card>
              <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-2">
                      <Label>Title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Main Menu" />
                  </div>
              {isEditing && (
                  <div className="grid gap-2">
                      <Label className="flex items-center gap-2">
                          Handle
                          <span className="text-xs font-normal text-muted-foreground">(System ID)</span>
                      </Label>
                      <Input 
                          value={handle} 
                          readOnly
                          className="bg-muted text-muted-foreground cursor-not-allowed font-mono text-sm"
                          title="This unique identifier is used by themes"
                      />
                      <p className="text-[0.8rem] text-muted-foreground">
                          A unique identifier (slug) reserved by the system to display this menu in your theme.
                      </p>
                  </div>
              )}
              </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Menu Items</CardTitle>
                  {/* Dashed button removed from header to match screenshot style if preferred, usually bottom of list */}
              </CardHeader>
              <CardContent className="space-y-4">
                  {items.length === 0 && (
                      <div className="text-center text-muted-foreground py-6 border-2 border-dashed rounded-md">
                          No items yet. Add links to your menu.
                      </div>
                  )}
                  {items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center p-3 border rounded-md bg-white dark:bg-muted/10 hover:bg-muted/20 transition-colors">
                          <div className="text-muted-foreground cursor-grab">
                              <GripVertical className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="font-medium truncate">{item.title}</div>
                             <div className="text-xs text-muted-foreground truncate">{item.type} • {item.value}</div>
                          </div>
                          <div className="flex items-center gap-1">
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditItem(index)}
                              >
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => handleRemoveExistingItem(index)}
                              >
                                  <Trash className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>
                  ))}
                  
                  <Button 
                      variant="outline" 
                      className="w-full border-dashed" 
                      onClick={handleAddItem}
                  >
                      <Plus className="mr-2 h-4 w-4" /> Add menu item
                  </Button>
              </CardContent>
          </Card>
       </div>

       <MenuItemSheet 
          open={isSheetOpen} 
          onOpenChange={setIsSheetOpen} 
          initialItem={editingItem} 
          onSave={handleSheetSave}
          workspaceId={currentWorkspace?.id || ''}
       />
    </div>
  );
}
