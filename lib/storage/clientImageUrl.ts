/**
 * Client-side utility for getting optimized image URLs
 * This works by calling the API route or constructing URLs directly
 */

/**
 * Get optimized image URL (client-side)
 * If NEXT_PUBLIC_CDN_BASE_URL is set, constructs URL directly
 * Otherwise, uses API route to get optimized URL
 */
export async function getOptimizedImageUrlClient(
  imageKey: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'gif';
  } = {}
): Promise<string> {
  // If it's already a full URL (legacy support), return as-is
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  // If it's a local path (legacy support), return as-is
  if (imageKey.startsWith('/uploads/')) {
    return imageKey;
  }

  // If CDN base URL is configured, construct URL directly
  const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL;
  if (cdnBaseUrl) {
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    
    const queryString = params.toString();
    return `${cdnBaseUrl}/images/${encodeURIComponent(imageKey)}${queryString ? `?${queryString}` : ''}`;
  }

  // Otherwise, use API route
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);

  const response = await fetch(
    `/api/images/${encodeURIComponent(imageKey)}?${params.toString()}`
  );
  
  if (!response.ok) {
    // Fallback to direct MinIO URL if API fails
    return imageKey;
  }

  const data = await response.json();
  return data.url || imageKey;
}

/**
 * Synchronous version that constructs URL directly (for use in Image src)
 * This is faster but requires NEXT_PUBLIC_CDN_BASE_URL to be set
 */
export function getImageUrlSync(imageKey: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'gif';
} = {}): string {
  // If it's already a full URL (legacy support), return as-is
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }

  // If it's a local path (legacy support), return as-is
  if (imageKey.startsWith('/uploads/')) {
    return imageKey;
  }

  // TEMPORARY: For testing without MinIO/imgproxy, serve from public directory
  if (imageKey.startsWith('images/')) {
    return `/${imageKey}`;
  }

  // If CDN base URL is configured, construct URL directly
  const cdnBaseUrl = process.env.NEXT_PUBLIC_CDN_BASE_URL;
  if (cdnBaseUrl) {
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    
    const queryString = params.toString();
    return `${cdnBaseUrl}/images/${encodeURIComponent(imageKey)}${queryString ? `?${queryString}` : ''}`;
  }

  // Fallback: use API route URL (will be resolved by Next.js Image component)
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);

  return `/api/images/${encodeURIComponent(imageKey)}${params.toString() ? `?${params.toString()}` : ''}`;
}

