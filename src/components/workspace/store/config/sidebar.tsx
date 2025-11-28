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
  IconBuilding,
  IconFileText,
  IconSpeakerphone,
  IconApps,
  IconShoppingBag,
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
      title: "Home",
      url: STORE_ROUTES.HOME(workspaceId),
      icon: IconHome,
    },
    {
      title: "Orders",
      url: STORE_ROUTES.ORDERS.LIST(workspaceId),
      icon: IconShoppingCart,
    },
    {
      title: "Products",
      url: STORE_ROUTES.PRODUCTS.LIST(workspaceId),
      icon: IconPackage,
      defaultOpen: true, // Shopify-style: Products section open by default
      items: [
        {
          title: "All products",
          url: STORE_ROUTES.PRODUCTS.LIST(workspaceId),
        },
        {
          title: "Inventory",
          url: STORE_ROUTES.PRODUCTS.INVENTORY(workspaceId),
        },
        {
          title: "Collections",
          url: STORE_ROUTES.PRODUCTS.COLLECTIONS(workspaceId),
        },
        // {
        //   title: "Transfers",
        //   url: STORE_ROUTES.PRODUCTS.TRANSFERS(workspaceId),
        // },
      ],
    },
    {
      title: "Customers",
      url: STORE_ROUTES.CUSTOMERS.LIST(workspaceId),
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: STORE_ROUTES.ANALYTICS.OVERVIEW(workspaceId),
      icon: IconChartBar,
    },
    {
      title: "Discounts",
      url: STORE_ROUTES.DISCOUNTS.LIST(workspaceId),
      icon: IconDiscount,
    },
  ]

  // Multiple sections (Shopify-style: Sales channels + Apps)
  const navSections: NavSectionProps[] = [
    {
      label: "Sales channels",
      items: [
        {
          name: "Online Store",
          url: STORE_ROUTES.CHANNELS.ONLINE_STORE(workspaceId),
          icon: IconWorldWww,
        },
        
      ],
    },
  ]

  // Secondary navigation (bottom)
  const navSecondary: NavSecondaryItem[] = [
    {
      title: "Settings",
      url: STORE_ROUTES.SETTINGS.GENERAL(workspaceId),
      icon: IconSettings,
    },
  ]

  // Workspace configuration
  const workspaceConfig: WorkspaceConfig = {
    name: "Store",
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
    name: "Store",
    icon: IconBuildingStore,
  },
}
