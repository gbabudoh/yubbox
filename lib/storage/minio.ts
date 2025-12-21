import * as Minio from 'minio';

// Initialize MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

// Bucket name for storing images
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'yubbox-images';

/**
 * Ensure bucket exists, create if it doesn't
 */
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1');
    // Set bucket policy to allow public read access
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

/**
 * Upload file to MinIO
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    // Ensure bucket exists
    await ensureBucket();

    // Upload file
    await minioClient.putObject(BUCKET_NAME, filename, file, file.length, {
      'Content-Type': contentType,
    });

    // Return the object key (filename)
    return filename;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Delete file from MinIO
 */
export async function deleteFile(filename: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, filename);
  } catch (error) {
    console.error('Error deleting from MinIO:', error);
    throw new Error('Failed to delete file from storage');
  }
}

/**
 * Get public URL for a file (direct MinIO URL)
 * Note: This returns the MinIO URL. For CDN, use the imgproxy utility instead.
 */
export function getFileUrl(filename: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${filename}`;
}

export { minioClient, BUCKET_NAME };

