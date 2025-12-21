# Quick Admin Access Guide

## Step 1: Make Your User an Admin

You need to update your user's role in the database to `admin`. Here are the easiest ways:

### Option 1: Using MongoDB Compass (Easiest)

1. **Open MongoDB Compass**
   - Connect to your MongoDB database
   - Navigate to your database (usually `yubbox` or your database name)
   - Click on the `users` collection

2. **Find Your User**
   - Look for your user by email address
   - Click on the document to edit it

3. **Update Role**
   - Find the `role` field (or add it if it doesn't exist)
   - Change the value from `user` to `admin`
   - Click **Update**

### Option 2: Using MongoDB Shell

1. **Open Terminal/Command Prompt**
2. **Connect to MongoDB**
   ```bash
   mongosh
   # Or if using older version:
   mongo
   ```

3. **Switch to Your Database**
   ```bash
   use yubbox
   # Replace 'yubbox' with your actual database name
   ```

4. **Update Your User**
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
   Replace `your-email@example.com` with your actual email address.

5. **Verify**
   ```javascript
   db.users.findOne({ email: "your-email@example.com" })
   ```
   You should see `"role": "admin"` in the result.

### Option 3: Using MongoDB Atlas (If using cloud)

1. **Log in to MongoDB Atlas**
2. **Go to Collections**
3. **Select your database → `users` collection**
4. **Find your user document**
5. **Click Edit**
6. **Add or update `role` field to `"admin"`**
7. **Save**

---

## Step 2: Access Admin Dashboard

1. **Log Out and Log Back In** (to refresh your session)
   - Go to your dashboard
   - Click **Sign Out**
   - Log back in with your admin account

2. **Access Admin Panel**
   - After logging in, you'll see an **"Admin Panel"** button in your dashboard
   - OR go directly to: `http://localhost:3000/admin` (or your domain)

3. **You Should See**
   - Admin Dashboard with three cards:
     - **Categories**
     - **Industries**
     - **Product Types**

---

## Step 3: Add Categories

1. **Click on "Categories"** from the admin dashboard
2. **Click "+ Add New"** button
3. **Fill in the form:**
   - **Name**: e.g., "Electronics", "Food & Beverage", "Services"
   - **Description**: (Optional) Brief description
   - **Order**: Number for sorting (lower = appears first)
   - **Active**: Checkbox (checked = active)
4. **Click "Create"**

### Example Categories:
- Electronics
- Food & Beverage
- Clothing & Fashion
- Home & Garden
- Software & Technology
- Services
- Health & Beauty
- Automotive
- Education
- Entertainment

---

## Step 4: Add Industries

1. **Click on "Industries"** from the admin dashboard
2. **Click "+ Add New"** button
3. **Fill in the form:**
   - **Name**: e.g., "Technology", "Healthcare", "Retail"
   - **Description**: (Optional)
   - **Order**: Number for sorting
   - **Active**: Checkbox
4. **Click "Create"**

### Example Industries:
- Technology
- Healthcare
- Finance
- Retail & E-commerce
- Education
- Manufacturing
- Real Estate
- Hospitality & Tourism
- Media & Entertainment
- Agriculture

---

## Step 5: Add Product Types

1. **Click on "Product Types"** from the admin dashboard
2. **Click "+ Add New"** button
3. **Fill in the form:**
   - **Name**: e.g., "SaaS Software", "Physical Goods"
   - **Type**: Select either:
     - **Service** - For service-based products
     - **Physical** - For physical products
   - **Description**: (Optional)
   - **Order**: Number for sorting
   - **Active**: Checkbox
4. **Click "Create"**

### Example Product Types:

**Service Types:**
- SaaS Software
- Consulting Services
- Digital Marketing
- Web Development
- Graphic Design
- Online Courses
- Subscription Services
- Cloud Services

**Physical Types:**
- Electronics
- Clothing & Apparel
- Home & Garden Products
- Food Products
- Books & Media
- Sports Equipment
- Beauty Products
- Toys & Games

---

## Quick Setup Script

If you want to quickly add some default categories, industries, and product types, you can use this MongoDB script:

```javascript
// Run in MongoDB shell or Compass

use yubbox

// Add Categories
db.categories.insertMany([
  { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets", order: 1, isActive: true },
  { name: "Food & Beverage", slug: "food-beverage", description: "Food and drink products", order: 2, isActive: true },
  { name: "Clothing & Fashion", slug: "clothing-fashion", description: "Apparel and fashion items", order: 3, isActive: true },
  { name: "Services", slug: "services", description: "Service-based offerings", order: 4, isActive: true },
  { name: "Software & Technology", slug: "software-technology", description: "Software and tech products", order: 5, isActive: true },
  { name: "Home & Garden", slug: "home-garden", description: "Home and garden products", order: 6, isActive: true },
  { name: "Health & Beauty", slug: "health-beauty", description: "Health and beauty products", order: 7, isActive: true },
  { name: "Automotive", slug: "automotive", description: "Automotive products and services", order: 8, isActive: true }
])

// Add Industries
db.industries.insertMany([
  { name: "Technology", slug: "technology", description: "Technology industry", order: 1, isActive: true },
  { name: "Healthcare", slug: "healthcare", description: "Healthcare industry", order: 2, isActive: true },
  { name: "Finance", slug: "finance", description: "Financial services", order: 3, isActive: true },
  { name: "Retail & E-commerce", slug: "retail-ecommerce", description: "Retail and e-commerce", order: 4, isActive: true },
  { name: "Education", slug: "education", description: "Education sector", order: 5, isActive: true },
  { name: "Manufacturing", slug: "manufacturing", description: "Manufacturing industry", order: 6, isActive: true },
  { name: "Real Estate", slug: "real-estate", description: "Real estate industry", order: 7, isActive: true },
  { name: "Hospitality & Tourism", slug: "hospitality-tourism", description: "Hospitality and tourism", order: 8, isActive: true }
])

// Add Product Types
db.producttypes.insertMany([
  { name: "SaaS Software", slug: "saas-software", type: "service", description: "Software as a Service", order: 1, isActive: true },
  { name: "Consulting Services", slug: "consulting-services", type: "service", description: "Professional consulting", order: 2, isActive: true },
  { name: "Digital Marketing", slug: "digital-marketing", type: "service", description: "Digital marketing services", order: 3, isActive: true },
  { name: "Web Development", slug: "web-development", type: "service", description: "Web development services", order: 4, isActive: true },
  { name: "Online Courses", slug: "online-courses", type: "service", description: "Educational courses online", order: 5, isActive: true },
  { name: "Physical Electronics", slug: "physical-electronics", type: "physical", description: "Physical electronic devices", order: 6, isActive: true },
  { name: "Clothing & Apparel", slug: "clothing-apparel", type: "physical", description: "Physical clothing items", order: 7, isActive: true },
  { name: "Home Products", slug: "home-products", type: "physical", description: "Physical home products", order: 8, isActive: true },
  { name: "Food Products", slug: "food-products", type: "physical", description: "Physical food items", order: 9, isActive: true }
])
```

---

## Troubleshooting

### Can't See Admin Panel Button
- Make sure you logged out and logged back in after making yourself admin
- Check your user role in database: `db.users.findOne({ email: "your-email" })`
- Clear browser cache and cookies

### Getting "Unauthorized" Error
- Verify your user has `role: "admin"` in database
- Check server logs for admin check errors
- Ensure you're logged in

### Can't Access Admin Routes
- Check that `lib/admin.ts` is working correctly
- Verify MongoDB connection
- Check server console for errors

---

## Admin Dashboard URLs

- **Main Admin Dashboard**: `/admin`
- **Categories Management**: `/admin/categories`
- **Industries Management**: `/admin/industries`
- **Product Types Management**: `/admin/product-types`

---

## Next Steps

After adding categories, industries, and product types:

1. **Refresh your browser** - The ad form will automatically load the new options
2. **Test Creating a Yubbox** - You should now see the dropdowns populated
3. **Verify Required Fields** - All three fields (Category, Industry, Product Type) are now required

---

**Need Help?** Check `ADMIN_SETUP.md` for more detailed instructions.

