/**
 * Theme Registry - NPM Package Based
 *
 * Loads Puck configs from npm packages.
 * User customizations (puck.data) are stored in database per workspace.
 *
 * Architecture:
 * - Master Config: Installed npm packages - Read Only
 * - User Data: Per-workspace puck_data JSON (from DB) - Customizable
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated on: 2026-04-25T01:53:51.891Z
 * Total themes: 3
 *
 * To update this file, run:
 *   npm run generate-registry
 */

import type { Config } from '@measured/puck';

type ThemeConfigLoader = () => Promise<{
  config?: Config;
  default?: Config;
}>;

/**
 * Theme Registry
 *
 * Maps theme slugs to npm package imports.
 */
export const THEME_REGISTRY: Record<string, ThemeConfigLoader> = {
  // Clean Fast food e-commerce template with modern design
  'ecommerce-fudi': () => import('@huzilerz/theme-fudi') as Promise<any>,
  // Premium Apple-style tech store with minimalist design, smooth animations, and immersive product showcases
  'ecommerce-apple-forest': () => import('@huzilerz/theme-khendu-apple') as Promise<any>,
  // Clean Shoe e-commerce template with modern design
  'ecommerce-sneakers': () => import('@huzilerz/theme-sneakers') as Promise<any>,
};

/**
 * Load master theme Puck config
 *
 * @param themeSlug - Theme identifier (e.g., 'ecommerce-apple-forest')
 * @returns Full Puck Config with render functions
 * @throws Error if theme not found in registry
 */
export async function loadThemeConfig(themeSlug: string): Promise<Config> {
  const loader = THEME_REGISTRY[themeSlug];

  if (!loader) {
    const availableThemes = Object.keys(THEME_REGISTRY);
    throw new Error(
      `Theme "${themeSlug}" not found. Available: ${availableThemes.join(', ')}`
    );
  }

  const themeModule = await loader();
  const config = themeModule.config || themeModule.default;

  if (!config) {
    throw new Error(`Theme "${themeSlug}" missing puck.config export`);
  }

  return config;
}

/**
 * Get list of available theme slugs
 */
export function getAvailableThemes(): string[] {
  return Object.keys(THEME_REGISTRY);
}

/**
 * Check if a theme exists in the registry
 */
export function isThemeAvailable(themeSlug: string): boolean {
  return themeSlug in THEME_REGISTRY;
}

/**
 * Preload theme components (optional optimization)
 */
export function preloadTheme(themeSlug: string): void {
  const loader = THEME_REGISTRY[themeSlug];
  if (loader) {
    loader().catch(() => {
      // Silently fail preload
    });
  }
}

export const REGISTRY_SIZE = 3;
export const REGISTRY_THEMES = ['ecommerce-fudi', 'ecommerce-apple-forest', 'ecommerce-sneakers'];
