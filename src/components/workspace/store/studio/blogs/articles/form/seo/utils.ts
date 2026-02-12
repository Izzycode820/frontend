/**
 * Utility functions for SEO management (Article Context)
 */

import { SEO_LIMITS } from './types';

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Truncate text to max length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim();
}

/**
 * Auto-generate meta title from article title
 */
export function generateMetaTitle(
  articleTitle: string,
  customTitle?: string
): string {
  if (customTitle && customTitle.trim()) {
    return truncateText(customTitle, SEO_LIMITS.TITLE);
  }
  return truncateText(articleTitle, SEO_LIMITS.TITLE);
}

/**
 * Auto-generate meta description from content or summary
 */
export function generateMetaDescription(
  content: string,
  customDescription?: string
): string {
  if (customDescription && customDescription.trim()) {
    return truncateText(customDescription, SEO_LIMITS.DESCRIPTION);
  }
  // Simple strip tags for preview
  const plainText = content.replace(/<[^>]*>?/gm, '');
  return truncateText(plainText, SEO_LIMITS.DESCRIPTION);
}

/**
 * Count characters
 */
export function getCharacterCount(text: string, limit: number): {
  count: number;
  isExceeding: boolean;
  message: string;
} {
  const count = text.length;
  const isExceeding = count > limit;

  return {
    count,
    isExceeding,
    message: `${count} of ${limit} characters used`
  };
}

/**
 * Format URL breadcrumbs for article
 */
export function getUrlBreadcrumbs(blogHandle: string, articleSlug: string): string {
  return `blogs › ${blogHandle} › ${articleSlug}`;
}
