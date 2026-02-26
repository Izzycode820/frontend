/**
 * Store Workspace Sidebar Configuration
 * EXACT Shopify admin structure (2024) - uses routes from domains
 */

import {
  IconBuildingStore,
  IconChartBar,
  IconHome,
  IconPackage,
  IconShoppingCart,
  IconSettings,
  IconUsers,
  IconDiscount,
  IconWorldWww,
  IconBell,
  IconPencil,
} from "@tabler/icons-react"
import type {
  NavMainItem,
  NavSectionProps,
  NavSecondaryItem,
  WorkspaceConfig,
  UserConfig,
  WorkspaceSidebarConfig,
} from "@/types/workspace/dashboard-ui/workspace"
import { STORE_ROUTES } from "@/routes/domains/workspace"
import { LeaveWorkspaceButton } from "@/components/workspace/layouts/leave-workspace-button"

/**
 * Get store sidebar navigation (Shopify-exact structure)
 * @param workspaceId - Current workspace ID from params/context
 * @param user - Current user data
 */
export function getStoreSidebarConfig(
  workspaceId: string,
  user: UserConfig
): WorkspaceSidebarConfig {
  // Main navigation (matches Shopify 2024 exactly)
  const navMain: NavMainItem[] = [
    {
      title: "home",
      url: STORE_ROUTES.HOME(workspaceId),
      icon: IconHome,
    },
    {
      title: "orders",
      url: STORE_ROUTES.ORDERS.LIST(workspaceId),
      icon: IconShoppingCart,
    },
    {
      title: "products",
      url: STORE_ROUTES.PRODUCTS.LIST(workspaceId),
      icon: IconPackage,
      defaultOpen: false,
      navigateToFirstChild: false, // Click navigates to Products page itself
      items: [
        {
          title: "inventory",
          url: STORE_ROUTES.PRODUCTS.INVENTORY(workspaceId),
        },
        {
          title: "collections",
          url: STORE_ROUTES.PRODUCTS.COLLECTIONS(workspaceId),
        },
      ],
    },
    {
      title: "customers",
      url: STORE_ROUTES.CUSTOMERS.LIST(workspaceId),
      icon: IconUsers,
    },
    {
      title: "analytics",
      url: STORE_ROUTES.ANALYTICS.OVERVIEW(workspaceId),
      icon: IconChartBar,
    },
    {
      title: "discounts",
      url: STORE_ROUTES.DISCOUNTS.LIST(workspaceId),
      icon: IconDiscount,
    },
    {
      title: "studio",
      url: STORE_ROUTES.STUDIO.BLOGS.LIST(workspaceId),
      icon: IconPencil,
      navigateToFirstChild: true,
      items: [
        {
          title: "blogPosts",
          url: STORE_ROUTES.STUDIO.BLOGS.LIST(workspaceId),
        },
        {
          title: "pages",
          url: STORE_ROUTES.STUDIO.PAGES.LIST(workspaceId),
        },
      ],
    },
  ]

  // Multiple sections (Shopify-style: Sales channels + Apps)
  const navSections: NavSectionProps[] = [
    {
      label: "salesChannels",
      items: [
        {
          name: "onlineStore",
          url: STORE_ROUTES.CHANNELS.THEMES(workspaceId), // Points to first child
          icon: IconWorldWww,
          navigateToFirstChild: true, // Click opens children and navigates to first child
          items: [
            {
              title: "themes",
              url: STORE_ROUTES.CHANNELS.THEMES(workspaceId),
            },
            {
              title: "navigation",
              url: STORE_ROUTES.CHANNELS.NAVIGATION.LIST(workspaceId),
            },
            {
              title: "preferences",
              url: STORE_ROUTES.CHANNELS.PREFERENCES(workspaceId),
            },
          ],
        },
      ],
    },
  ]

  // Secondary navigation (bottom) - Notifications above Settings
  const navSecondary: NavSecondaryItem[] = [
    {
      title: "notifications",
      url: `#notifications:${workspaceId}`, // Embed ID for robust extraction
      icon: IconBell,
    },
    {
      title: "settings",
      url: STORE_ROUTES.SETTINGS.GENERAL(workspaceId),
      icon: IconSettings,
    },
  ]

  // Workspace configuration
  const workspaceConfig: WorkspaceConfig = {
    name: "store",
    icon: IconBuildingStore,
  }

  return {
    user,
    navMain,
    navSections,
    navSecondary,
    workspaceConfig,
    footerActions: <LeaveWorkspaceButton />,
  }
}

// Export default config (for static use without workspace ID)
export const defaultStoreConfig = {
  workspaceConfig: {
    name: "store",
    icon: IconBuildingStore,
  },
}
