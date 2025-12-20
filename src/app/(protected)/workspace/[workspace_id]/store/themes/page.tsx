'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { ApolloProvider } from '@apollo/client/react';
import { themeClient } from '@/services/graphql/clients';
import { MyThemesDocument } from '@/services/graphql/themes/queries/mythemes/__generated__/myThemes.generated';
import { PublishThemeDocument } from '@/services/graphql/themes/mutations/mythemes/__generated__/publishTheme.generated';
import { ActiveThemeCard } from '@/components/workspace/store/themes/ActiveThemeCard';
import { ThemeLibraryCard } from '@/components/workspace/store/themes/ThemeLibraryCard';
import { Button } from '@/components/shadcn-ui/button';
import { Eye, Plus, Package } from 'lucide-react';
import { toast } from 'sonner';

function ThemesContent() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspace_id as string;
  const [publishingThemeId, setPublishingThemeId] = React.useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(MyThemesDocument, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const [publishTheme] = useMutation(PublishThemeDocument, {
    client: themeClient,
    onCompleted: (data) => {
      setPublishingThemeId(null);
      if (data?.publishTheme?.success) {
        toast.success(data.publishTheme.message || 'Theme published successfully');
        refetch();
      } else if (data?.publishTheme?.error) {
        toast.error(data.publishTheme.error);
      }
    },
    onError: (error) => {
      setPublishingThemeId(null);
      toast.error(`Failed to publish theme: ${error.message}`);
    },
  });

  const handleEditTheme = (customizationId: string) => {
    router.push(`/workspace/${workspaceId}/editor/${customizationId}`);
  };

  const handleViewStore = () => {
    // TODO: Navigate to store preview
    toast.info('Store preview coming soon');
  };

  const handleImportTheme = () => {
    // TODO: Navigate to theme store
    router.push('/showcase');
  };

  const handlePublish = async (customizationId: string) => {
    setPublishingThemeId(customizationId);
    try {
      await publishTheme({
        variables: { id: customizationId },
      });
    } catch (error) {
      // Error already handled in onError callback
      console.error('Error publishing theme:', error);
    }
  };

  const handleDelete = (customizationId: string) => {
    // TODO: Implement delete mutation
    toast.info('Delete functionality coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading themes</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const themes = (data?.myThemes || []).filter((t): t is NonNullable<typeof t> => t !== null);
  const activeTheme = themes.find((t) => t.isActive);
  const libraryThemes = themes.filter((t) => !t.isActive);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Themes</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleViewStore}>
              <Eye className="w-4 h-4 mr-2" />
              View your store
            </Button>
            <Button onClick={handleImportTheme}>
              <Plus className="w-4 h-4 mr-2" />
              Import theme
            </Button>
          </div>
        </div>

        {/* Active Theme Section */}
        {activeTheme && (
          <div>
            <ActiveThemeCard
              id={activeTheme.id}
              themeName={activeTheme.themeName}
              previewImage={activeTheme.template.previewImage}
              version={activeTheme.template.version}
              createdAt={activeTheme.createdAt}
              onEditTheme={() => handleEditTheme(activeTheme.id)}
            />
          </div>
        )}

        {/* Theme Library Section */}
        {libraryThemes.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Theme library</h2>
              <p className="text-sm text-gray-600 mt-1">
                These themes are only visible to you. Publishing a theme from your library will switch it to your current theme.
              </p>
            </div>
            <div className="space-y-3">
              {libraryThemes.map((theme) => (
                <ThemeLibraryCard
                  key={theme.id}
                  id={theme.id}
                  themeName={theme.themeName}
                  previewImage={theme.template.previewImage}
                  version={theme.template.version}
                  createdAt={theme.createdAt}
                  isPublished={theme.isPublished}
                  canDelete={theme.canDelete}
                  isPublishing={publishingThemeId === theme.id}
                  onEditTheme={() => handleEditTheme(theme.id)}
                  onPublish={() => handlePublish(theme.id)}
                  onDelete={() => handleDelete(theme.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {themes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No themes yet</h3>
            <p className="text-gray-600 mb-6">Import a theme from our store to get started</p>
            <Button onClick={handleImportTheme}>
              <Plus className="w-4 h-4 mr-2" />
              Browse themes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThemesPage() {
  return (
    <ApolloProvider client={themeClient}>
      <ThemesContent />
    </ApolloProvider>
  );
}
