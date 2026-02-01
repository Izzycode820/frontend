/**
 * Theme Registry - Production Multi-Tenant Architecture
 *
 * Loads master Puck configs (with render functions) from theme source.
 * User customizations (puck.data) are stored in database per workspace.
 *
 * Architecture:
 * - Master Config: Shared puck.config.tsx (this registry) - Read Only
 * - User Data: Per-workspace puck_data JSON (from DB) - Customizable
 *
 * ⚠️  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated on: 2026-01-22T00:14:58.211Z
 * Total themes: 2
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
 * Maps theme slugs to puck.config.tsx modules.
 * Each config contains render functions (cannot be serialized to DB).
 */
export const THEME_REGISTRY: Record<string, ThemeConfigLoader> = {
  // Premium Apple-style tech store with minimalist design, smooth animations, and immersive product showcases
  'ecommerce-apple-forest': () => import('@themes/khendu-apple') as Promise<any>,
  // Clean Shoe e-commerce template with modern design
  'ecommerce-sneakers': () => import('@themes/sneakers') as Promise<any>,
};

/**
 * Load master theme Puck config (shared by all users)
 *
 * @param themeSlug - Theme identifier (e.g., 'ecommerce-sneakers')
 * @returns Full Puck Config with render functions
 * @throws Error if theme not found in registry
 */
export async function loadThemeConfig(themeSlug: string): Promise<Config> {
  console.log('🔵 [ThemeRegistry] Loading master config for:', themeSlug);

  const loader = THEME_REGISTRY[themeSlug];

  if (!loader) {
    const availableThemes = Object.keys(THEME_REGISTRY);
    console.error('❌ [ThemeRegistry] Theme not found:', themeSlug);
    console.error('📋 [ThemeRegistry] Available:', availableThemes);
    throw new Error(
      `Theme "${themeSlug}" not found. Available: ${availableThemes.join(', ')}`
    );
  }

  try {
    const startTime = performance.now();
    const themeModule = await loader();

    const config = themeModule.config || themeModule.default;

    if (!config) {
      throw new Error(`Theme "${themeSlug}" missing puck.config export`);
    }

    const loadTime = performance.now() - startTime;
    console.log(`✅ [ThemeRegistry] Config loaded in ${loadTime.toFixed(2)}ms`);
    console.log('📦 [ThemeRegistry] Components:', Object.keys(config.components || {}));

    return config;
  } catch (error) {
    console.error('❌ [ThemeRegistry] Failed to load:', error);
    throw error;
  }
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
    loader().catch((error) => {
      console.warn(`Failed to preload theme "${themeSlug}":`, error);
    });
  }
}

export const REGISTRY_SIZE = 2;
export const REGISTRY_THEMES = ['ecommerce-apple-forest', 'ecommerce-sneakers'];

console.log(`📦 [ThemeRegistry] Initialized with ${REGISTRY_SIZE} theme(s)`);
