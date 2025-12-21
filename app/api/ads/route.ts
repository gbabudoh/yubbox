import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';
import Category from '@/models/Category';
import Industry from '@/models/Industry';
import ProductType from '@/models/ProductType';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');
    const country = searchParams.get('country'); // Filter by country code

    let query: any = {};

    if (userId) {
      // Convert userId string to ObjectId for query
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = new mongoose.Types.ObjectId(userId);
      } else {
        query.userId = userId;
      }
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    // Filter by country - ads that include this country in their countries array
    if (country) {
      query.countries = { $in: [country] };
    }

    // Only show non-expired ads for public feed
    // TODO: Re-enable isPaid filter after testing
    if (!userId) {
      // query.isPaid = true; // TEMPORARILY BYPASSED FOR TESTING
      query.expiryDate = { $gte: new Date() };
    }

    // Fetch ads and populate safely - try full populate, fallback to basic if it fails
    let ads;
    try {
      ads = await Ad.find(query)
        .populate('userId', 'name email')
        .populate('categoryId', 'name slug')
        .populate('industryId', 'name slug')
        .populate('productTypeId', 'name slug type')
        .sort({ createdAt: -1 });
    } catch (populateError) {
      // If populate fails (e.g., collections don't exist), use the basic query
      console.warn('Populate failed, using basic query:', populateError);
      ads = await Ad.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch ads',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const webLink = formData.get('webLink') as string;
    const ownerName = formData.get('ownerName') as string;
    const location = formData.get('location') as string;
    const companyName = formData.get('companyName') as string;
    // Support both countries and targetLocations for backward compatibility
    const countries = formData.getAll('countries').length > 0 
      ? formData.getAll('countries') as string[]
      : formData.getAll('targetLocations') as string[];
    const categoryId = formData.get('categoryId') as string | null;
    const industryId = formData.get('industryId') as string | null;
    
    // Validation
    if (!title || !description || !imageUrl || !webLink || !ownerName || !location || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (countries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one country' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!industryId) {
      return NextResponse.json(
        { success: false, error: 'Industry is required' },
        { status: 400 }
      );
    }

    
    // Set initial expiry date (30 days from now, but will be reset to 30 days from payment when paid)
    // This is just a placeholder - actual expiry starts from payment date
    const initialExpiryDate = new Date();
    initialExpiryDate.setDate(initialExpiryDate.getDate() + 30);

    const adData: any = {
      title,
      description,
      imageUrl,
      webLink,
      ownerName,
      location,
      companyName,
      countries,
      userId: session.user.id,
      isActive: true, // Active immediately (bypassing payment)
      isPaid: false,
      expiryDate: initialExpiryDate, // Will be updated when payment is made
    };

    // Add required fields
    adData.categoryId = categoryId;
    adData.industryId = industryId;

    const ad = await Ad.create(adData);

    // Populate safely
    let populatedAd;
    try {
      populatedAd = await Ad.findById(ad._id)
        .populate('userId', 'name email')
        .populate('categoryId', 'name slug')
        .populate('industryId', 'name slug');
    } catch (populateError) {
      // If populate fails, use basic populate
      populatedAd = await Ad.findById(ad._id)
        .populate('userId', 'name email');
    }

    return NextResponse.json(
      {
        success: true,
        data: populatedAd,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create ad',
      },
      { status: 500 }
    );
  }
}

