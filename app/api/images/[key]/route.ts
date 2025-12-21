import { NextRequest, NextResponse } from 'next/server';
import { getCdnImageUrl } from '@/lib/storage/imgproxy';

/**
 * API route to get optimized image URL
 * This allows the frontend to request optimized image URLs without exposing server config
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    // Get optional query parameters for image processing
    const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined;
    const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined;
    const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : undefined;
    const format = searchParams.get('f') as 'webp' | 'jpeg' | 'png' | 'gif' | undefined;
    const fit = searchParams.get('fit') as 'contain' | 'cover' | 'fill' | 'inside' | 'outside' | undefined;

    // Decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Generate optimized URL
    const optimizedUrl = getCdnImageUrl(decodedKey, {
      width,
      height,
      quality,
      format,
      fit,
    });

    return NextResponse.json({
      success: true,
      url: optimizedUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image URL',
      },
      { status: 500 }
    );
  }
}

