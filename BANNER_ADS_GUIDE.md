# Banner Ads System Guide

## Overview

The Banner Ads system allows you to display premium, rotating banner advertisements at the top of your Yubbox homepage. This feature is designed for showcasing featured partners, premium products, or special promotions.

## Features

- **Premium Display**: Eye-catching carousel with fade transitions
- **Responsive Design**: Optimized for all screen sizes
- **Auto-rotation**: Banners automatically rotate every 6 seconds
- **Date Scheduling**: Set start and end dates for each banner
- **Cost Tracking**: Monitor revenue from banner placements
- **Display Order**: Control the sequence of banner display
- **Admin Management**: Full CRUD interface for managing banners

## Admin Access

### Accessing Banner Management

1. Log in as an admin user
2. Navigate to `/admin/banner-ads`
3. Or click "Banner Ads" in the admin sidebar

### Creating a Banner Ad

1. Click the "Create Banner Ad" button
2. Fill in the required fields:
   - **Title**: Main headline (max 100 characters)
   - **Description**: Supporting text (max 500 characters, optional)
   - **Image URL**: Direct link to banner image (recommended: 1920x1080px)
   - **Link URL**: Destination URL when users click the banner
   - **Cost**: Revenue amount for this banner placement
   - **Start Date**: When the banner becomes active
   - **End Date**: When the banner expires
   - **Display Order**: Lower numbers appear first (0 = highest priority)
   - **Active**: Toggle to enable/disable the banner

3. Click "Create" to save

### Editing a Banner Ad

1. Find the banner in the list
2. Click "Edit" button
3. Modify the fields as needed
4. Click "Update" to save changes

### Deleting a Banner Ad

1. Find the banner in the list
2. Click "Delete" button
3. Confirm the deletion

## Banner Status

Banners have three status states:

- **Active** (Green): Currently displaying on the homepage
- **Scheduled** (Yellow): Active but outside the date range
- **Inactive** (Red): Manually disabled

## Creating Sample Banners

To quickly populate your site with sample banner ads for testing:

```bash
npm run create-sample-banners
```

This will create 3 sample banners with:
- Professional stock images from Unsplash
- 30-day active period starting today
- Different display orders and costs

**Note**: You must have an admin user created before running this script.

## Image Recommendations

For best results, use images with these specifications:

- **Dimensions**: 1920x1080px (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File Size**: Under 500KB for fast loading
- **Content**: High-quality, professional images
- **Text**: Minimal text on image (use title/description fields instead)

## API Endpoints

### Public Endpoint
- `GET /api/banner-ads/active` - Fetch currently active banners

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/banner-ads` - List all banners
- `POST /api/admin/banner-ads` - Create new banner
- `GET /api/admin/banner-ads/[id]` - Get specific banner
- `PUT /api/admin/banner-ads/[id]` - Update banner
- `DELETE /api/admin/banner-ads/[id]` - Delete banner

## Frontend Integration

The banner display is automatically integrated into the homepage at `app/page.tsx`. The component is located at `components/BannerAdDisplay.tsx`.

### Features:
- Fade transition effects
- Navigation arrows (desktop only)
- Pagination dots
- Hover effects with scale and brightness
- Banner counter (e.g., "1 / 3")
- "PREMIUM PARTNER" badge
- "Explore Now" call-to-action button

## Database Model

The BannerAd model (`models/BannerAd.ts`) includes:

```typescript
{
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  cost: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  displayOrder: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Best Practices

1. **Limit Active Banners**: Keep 3-5 active banners for optimal rotation
2. **Update Regularly**: Refresh banners monthly to maintain user interest
3. **Test Links**: Always verify destination URLs before publishing
4. **Monitor Performance**: Track which banners drive the most engagement
5. **Schedule Ahead**: Set up future banners in advance with scheduled dates
6. **Use Quality Images**: Professional imagery significantly impacts click-through rates

## Troubleshooting

### Banners Not Displaying

1. Check if any banners are active in `/admin/banner-ads`
2. Verify start/end dates are current
3. Ensure `isActive` is set to true
4. Check browser console for API errors

### Images Not Loading

1. Verify image URLs are publicly accessible
2. Check for HTTPS (not HTTP) image URLs
3. Ensure images aren't blocked by CORS policies
4. Test image URL directly in browser

### Admin Access Issues

1. Confirm user has admin role in database
2. Check authentication session
3. Verify admin middleware is working

## Support

For additional help or feature requests, contact your development team or refer to the main application documentation.
