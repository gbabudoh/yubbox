import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { uploadFile } from '@/lib/storage/minio';
import { getCdnImageUrl } from '@/lib/storage/imgproxy';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for MinIO)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `images/${timestamp}-${randomString}.${extension}`;

    try {
      // Upload to MinIO
      await uploadFile(buffer, filename, file.type);

      // Generate CDN URL with imgproxy (returns optimized image URL)
      // Store the filename (object key) in database, not the full URL
      // The frontend will use imgproxy to get optimized versions
      const imageUrl = filename; // Store just the filename/key for flexibility

      return NextResponse.json({
        success: true,
        data: { 
          imageUrl, // Return the filename/key
          // Also return a preview URL for immediate display
          previewUrl: getCdnImageUrl(filename, { width: 800, height: 600, fit: 'cover' }),
        },
      });
    } catch (storageError) {
      console.error('MinIO storage error, using fallback:', storageError);
      
      // Fallback: Store the filename and return a mock URL for testing
      const imageUrl = filename;
      const mockPreviewUrl = `https://picsum.photos/seed/${filename}/800/600.jpg`;
      
      return NextResponse.json({
        success: true,
        data: { 
          imageUrl, // Store the filename for now
          previewUrl: mockPreviewUrl, // Use a placeholder image
        },
        warning: 'Using fallback image storage - MinIO may not be configured',
      });
    }
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

