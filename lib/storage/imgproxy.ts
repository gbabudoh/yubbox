import crypto from 'crypto';

// imgproxy configuration
const IMGPROXY_BASE_URL = process.env.IMGPROXY_BASE_URL || 'http://localhost:8080';
const IMGPROXY_KEY = process.env.IMGPROXY_KEY || '';
const IMGPROXY_SALT = process.env.IMGPROXY_SALT || '';
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'yubbox-images';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';

/**
 * Generate imgproxy URL signature
 */
function generateSignature(path: string): string {
  if (!IMGPROXY_KEY || !IMGPROXY_SALT) {
    // If no key/salt provided, return unsigned URL (for development)
    return '';
  }

  const key = Buffer.from(IMGPROXY_KEY, 'hex');
  const salt = Buffer.from(IMGPROXY_SALT, 'hex');
  const pathBuffer = Buffer.from(path);
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(salt);
  hmac.update(pathBuffer);
  const signature = hmac.digest('base64url');
  return signature;
}

/**
 * Build MinIO source URL for imgproxy
 */
function buildSourceUrl(filename: string): string {
  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  return `s3://${MINIO_BUCKET_NAME}/${filename}`;
}

/**
 * Generate optimized image URL using imgproxy
 */
export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'webp' | 'jpeg' | 'png' | 'gif';
  fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  gravity?: 'no' | 'so' | 'ea' | 'we' | 'noea' | 'nowe' | 'soea' | 'sowe' | 'ce';
  blur?: number; // 0-100
  sharpen?: number; // 0-100
  rotate?: number; // 0-360
}

/**
 * Generate imgproxy URL for an image
 */
export function getImageUrl(filename: string, options: ImageOptions = {}): string {
  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    fit = 'cover',
    gravity = 'ce',
    blur,
    sharpen,
    rotate,
  } = options;

  // Build processing options in imgproxy format
  // Format: /resize:fit:width:height/quality:value/format:type/...
  const processingOptions: string[] = [];

  // Resize with fit mode
  if (width && height) {
    processingOptions.push(`resize:${fit}:${width}:${height}`);
  } else if (width) {
    processingOptions.push(`resize:${fit}:${width}:0`);
  } else if (height) {
    processingOptions.push(`resize:${fit}:0:${height}`);
  }

  if (quality) processingOptions.push(`quality:${quality}`);
  if (format) processingOptions.push(`format:${format}`);
  if (gravity && gravity !== 'ce') processingOptions.push(`gravity:${gravity}`);
  if (blur !== undefined) processingOptions.push(`blur:${blur}`);
  if (sharpen !== undefined) processingOptions.push(`sharpen:${sharpen}`);
  if (rotate) processingOptions.push(`rotate:${rotate}`);

  // Build the path
  const processingPath = processingOptions.length > 0 
    ? `/${processingOptions.join('/')}`
    : '';
  
  const sourceUrl = buildSourceUrl(filename);
  // imgproxy expects base64url encoding for the source URL
  const encodedSource = Buffer.from(sourceUrl).toString('base64url');
  const path = `${processingPath}/${encodedSource}`;

  // Generate signature if key/salt are provided
  const signature = generateSignature(path);
  const signedPath = signature ? `/${signature}${path}` : path;

  return `${IMGPROXY_BASE_URL}${signedPath}`;
}

/**
 * Generate CDN URL (if CDN is configured, otherwise use imgproxy URL)
 */
export function getCdnImageUrl(filename: string, options: ImageOptions = {}): string {
  const CDN_BASE_URL = process.env.CDN_BASE_URL;
  
  if (CDN_BASE_URL) {
    // If CDN is configured, use CDN URL with imgproxy path
    const imgproxyUrl = getImageUrl(filename, options);
    // Extract the path from imgproxy URL and prepend CDN base URL
    const url = new URL(imgproxyUrl);
    return `${CDN_BASE_URL}${url.pathname}${url.search}`;
  }
  
  // Otherwise, use imgproxy URL directly
  return getImageUrl(filename, options);
}

/**
 * Helper functions for common image sizes
 */
export const imagePresets = {
  thumbnail: (filename: string) => getCdnImageUrl(filename, { width: 300, height: 300, fit: 'cover' }),
  small: (filename: string) => getCdnImageUrl(filename, { width: 640, height: 480, fit: 'cover' }),
  medium: (filename: string) => getCdnImageUrl(filename, { width: 1280, height: 960, fit: 'cover' }),
  large: (filename: string) => getCdnImageUrl(filename, { width: 1920, height: 1080, fit: 'cover' }),
  original: (filename: string) => getCdnImageUrl(filename, {}),
};

