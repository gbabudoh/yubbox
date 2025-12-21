# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for managing categories, industries, and product types.

## Making a User an Admin

To make a user an admin, you need to update their role in the database. Here are a few ways to do this:

### Option 1: Using MongoDB Compass or MongoDB Shell

1. Connect to your MongoDB database
2. Navigate to the `users` collection
3. Find the user you want to make an admin (by email)
4. Update the document:
   ```json
   {
     "role": "admin"
   }
   ```

### Option 2: Using MongoDB Shell Command

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use yubbox

# Update user role to admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 3: Create a Script (One-time setup)

Create a file `scripts/makeAdmin.js`:

```javascript
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const User = require('../models/User');

async function makeAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email: node scripts/makeAdmin.js user@example.com');
    process.exit(1);
  }
  
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );
  
  if (user) {
    console.log(`User ${email} is now an admin!`);
  } else {
    console.error(`User with email ${email} not found`);
  }
  
  await mongoose.disconnect();
}

makeAdmin();
```

Run it:
```bash
node scripts/makeAdmin.js your-email@example.com
```

## Accessing the Admin Dashboard

1. Log in with an admin account
2. Go to `/admin` or click the "Admin Panel" button in the dashboard (only visible to admins)
3. You'll see three management sections:
   - **Categories** - Manage product/service categories
   - **Industries** - Manage industry classifications
   - **Product Types** - Manage service and physical product types

## Managing Categories

1. Click on **Categories** from the admin dashboard
2. Click **+ Add New** to create a category
3. Fill in:
   - **Name** (required) - e.g., "Electronics", "Food & Beverage"
   - **Description** (optional) - Brief description
   - **Order** (optional) - Number for sorting (lower numbers appear first)
   - **Active** - Toggle to enable/disable
4. Click **Create**
5. To edit: Click **Edit** on any category
6. To delete: Click **Delete** (confirmation required)
7. To toggle active status: Click the status badge

## Managing Industries

1. Click on **Industries** from the admin dashboard
2. Follow the same process as Categories
3. Examples: "Technology", "Healthcare", "Finance", "Retail"

## Managing Product Types

1. Click on **Product Types** from the admin dashboard
2. Click **+ Add New**
3. Fill in:
   - **Name** (required) - e.g., "SaaS Software", "Physical Goods"
   - **Type** (required) - Select either:
     - **Service** - For service-based products
     - **Physical** - For physical products
   - **Description** (optional)
   - **Order** (optional)
   - **Active** - Toggle to enable/disable
4. Click **Create**

## Using Categories, Industries, and Product Types in Ads

When creating a Yubbox listing:

1. Fill in the basic information (title, description, image, web link)
2. Select optional fields:
   - **Category** - Choose from available categories
   - **Industry** - Choose from available industries
   - **Product Type** - Choose from available product types
3. Select target countries
4. Submit the form

These fields help organize and filter Yubbox listings for better discoverability.

## Best Practices

### Categories
- Keep categories broad and general
- Examples: "Electronics", "Clothing", "Food & Beverage", "Services", "Software"

### Industries
- Use specific industry classifications
- Examples: "Technology", "Healthcare", "Finance", "E-commerce", "Education"

### Product Types
- Create specific types for services and physical products
- Service examples: "SaaS", "Consulting", "Digital Marketing", "Web Development"
- Physical examples: "Electronics", "Clothing", "Home & Garden", "Books"

### Ordering
- Use order numbers to control display order
- Lower numbers appear first
- Example: Order 1 = first, Order 10 = later

## API Endpoints

### Admin Endpoints (Require Admin Role)

- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

- `GET /api/admin/industries` - Get all industries
- `POST /api/admin/industries` - Create industry
- `PUT /api/admin/industries/[id]` - Update industry
- `DELETE /api/admin/industries/[id]` - Delete industry

- `GET /api/admin/product-types` - Get all product types
- `POST /api/admin/product-types` - Create product type
- `PUT /api/admin/product-types/[id]` - Update product type
- `DELETE /api/admin/product-types/[id]` - Delete product type

### Public Endpoints (No Auth Required)

- `GET /api/categories` - Get active categories
- `GET /api/industries` - Get active industries
- `GET /api/product-types` - Get active product types

## Security Notes

- Only users with `role: 'admin'` can access admin endpoints
- Admin routes are protected server-side
- Regular users cannot see admin dashboard links
- Always verify admin status on both client and server

## Troubleshooting

### Can't access admin dashboard
- Verify user role is set to "admin" in database
- Check browser console for errors
- Ensure you're logged in

### Options not showing in ad form
- Verify categories/industries/product types are marked as active
- Check browser console for API errors
- Ensure public API endpoints are accessible

### Changes not saving
- Check admin status
- Verify API responses in browser network tab
- Check server logs for errors

