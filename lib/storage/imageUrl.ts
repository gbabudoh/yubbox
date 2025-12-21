import { getCdnImageUrl, ImageOptions } from './imgproxy';

/**
 * Get optimized image URL from stored filename/key
 * This utility helps convert stored image keys to CDN/imgproxy URLs
 */
export function getOptimizedImageUrl(
  imageKey: string,
  options: ImageOptions = {}
): string {
  // If it's already a full URL (legacy support), return as-is
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  // If it's a local path (legacy support), return as-is
  if (imageKey.startsWith('/uploads/')) {
    return imageKey;
  }

  // Otherwise, treat it as a MinIO object key and generate CDN/imgproxy URL
  return getCdnImageUrl(imageKey, options);
}

/**
 * Get image URL for ad cards (thumbnail size)
 */
export function getAdCardImageUrl(imageKey: string): string {
  return getOptimizedImageUrl(imageKey, {
    width: 640,
    height: 480,
    fit: 'cover',
    quality: 85,
    format: 'webp',
  });
}

/**
 * Get image URL for ad detail page (medium size)
 */
export function getAdDetailImageUrl(imageKey: string): string {
  return getOptimizedImageUrl(imageKey, {
    width: 1280,
    height: 960,
    fit: 'cover',
    quality: 90,
    format: 'webp',
  });
}

/**
 * Get image URL for dashboard thumbnails
 */
export function getDashboardThumbnailUrl(imageKey: string): string {
  return getOptimizedImageUrl(imageKey, {
    width: 400,
    height: 300,
    fit: 'cover',
    quality: 80,
    format: 'webp',
  });
}

