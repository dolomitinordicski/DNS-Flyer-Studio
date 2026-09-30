/**
 * Utility functions for logo format handling (SVG vs PNG/Raster).
 */

/**
 * Checks if an image source URL is an SVG vector (starts with data:image/svg+xml or contains .svg).
 * Returns false if the image is a PNG, JPG, WebP, or non-SVG raster image.
 */
export function isSvgUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('data:image/svg+xml')) return true;
  if (url.toLowerCase().includes('.svg')) return true;
  return false;
}
