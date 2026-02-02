#!/usr/bin/env node
/**
 * Theme Registry Auto-Generator (NPM-Based)
 *
 * Scans package.json for @huzilerz/theme-* packages and generates registry.
 * Run this script whenever you add, remove, or update theme packages.
 *
 * Usage:
 *   node scripts/generate-theme-registry.js
 *   npm run generate-registry
 *
 * Features:
 * - Auto-discovers theme packages in node_modules
 * - Reads theme-manifest.json from each package
 * - Generates TypeScript-safe registry
 * - Runs automatically after npm install (post install hook)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(FRONTEND_ROOT, 'package.json');
const REGISTRY_OUTPUT = path.join(FRONTEND_ROOT, 'src/registry/theme-registry.ts');

/**
 * Scan package.json for @huzilerz/theme-* packages
 */
function scanThemePackages() {
  console.log('🔍 Scanning package.json for theme packages...');

  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.error('❌ package.json not found:', PACKAGE_JSON_PATH);
    process.exit(1);
  }

  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Find all @huzilerz/theme-* packages
  const themePackageNames = Object.keys(dependencies).filter((name) =>
    name.startsWith('@huzilerz/theme-')
  );

  if (themePackageNames.length === 0) {
    console.warn('⚠️  No @huzilerz/theme-* packages found in dependencies');
    return [];
  }

  console.log(`📦 Found ${themePackageNames.length} theme package(s):`, themePackageNames);

  // Read theme-manifest.json from each package
  const themes = [];
  for (const pkgName of themePackageNames) {
    try {
      const pkgPath = path.join(FRONTEND_ROOT, 'node_modules', pkgName);
      const manifestPath = path.join(pkgPath, 'theme-manifest.json');

      if (!fs.existsSync(manifestPath)) {
        console.warn(`  ⚠️  Missing theme-manifest.json in ${pkgName}`);
        continue;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      themes.push({
        slug: manifest.slug || manifest.id,
        packageName: pkgName,
        name: manifest.name,
        description: manifest.description,
        version: manifest.version || dependencies[pkgName],
      });

      console.log(`  ✅ ${manifest.id} (v${manifest.version})`);
    } catch (error) {
      console.error(`  ❌ Failed to load ${pkgName}:`, error.message);
    }
  }

  return themes;
}

/**
 * Generate TypeScript registry file content
 */
function generateRegistryContent(themes) {
  const registryEntries = themes
    .map((theme) => {
      return `  // ${theme.description}\n  '${theme.slug}': () => import('${theme.packageName}') as Promise<any>,`;
    })
    .join('\n');

  return `/**
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
 * Generated on: ${new Date().toISOString()}
 * Total themes: ${themes.length}
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
${registryEntries}
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
      \`Theme "\${themeSlug}" not found. Available: \${availableThemes.join(', ')}\`
    );
  }

  const themeModule = await loader();
  const config = themeModule.config || themeModule.default;

  if (!config) {
    throw new Error(\`Theme "\${themeSlug}" missing puck.config export\`);
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

export const REGISTRY_SIZE = ${themes.length};
export const REGISTRY_THEMES = [${themes.map((t) => `'${t.slug}'`).join(', ')}];
`;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Theme Registry Generator (NPM-Based)\n');

  // Scan for theme packages
  const themes = scanThemePackages();

  if (themes.length === 0) {
    console.warn('\n⚠️  No themes found.');
    console.log('💡 Install theme packages: npm install @huzilerz/theme-khendu-apple');
    // Don't exit with error - allow empty registry during initial setup
  }

  // Generate registry content
  const registryContent = generateRegistryContent(themes);

  // Ensure output directory exists
  const outputDir = path.dirname(REGISTRY_OUTPUT);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('✅ Created registry directory:', outputDir);
  }

  // Write registry file
  fs.writeFileSync(REGISTRY_OUTPUT, registryContent, 'utf-8');

  console.log('\n✅ Registry generated successfully!');
  console.log('📄 Output:', REGISTRY_OUTPUT);
  console.log('📦 Themes registered:', themes.length);

  if (themes.length > 0) {
    console.log('\n📋 Registered themes:');
    themes.forEach((t) => {
      console.log(`   - ${t.slug} (${t.packageName}@${t.version})`);
    });
  }

  console.log('\n🎯 Next steps:');
  console.log('   1. Restart your dev server to apply changes');
  console.log('   2. Import from: import { loadThemeConfig } from "@/registry/theme-registry"');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { scanThemePackages, generateRegistryContent };
