# How to Access Admin Backend - Quick Guide

## 🚀 Quick Start: Create Super Admin Account

**Want to create a brand new admin account?** Run this command:

```bash
npm run create-super-admin
```

This will create a super admin account with:
- **Email**: `admin@yubbox.com`
- **Password**: `Admin123!@#`
- **Name**: `Super Admin`

**Custom credentials?** You can specify them:
```bash
npm run create-super-admin your-email@example.com YourPassword123 YourName
```

Then just **log in** at `http://localhost:3000/login` and you'll have full admin access!

---

## Step 1: Make Yourself an Admin (If you already have an account)

You need to update your user account in MongoDB to have `role: "admin"`.

### ⚡ Easiest Method: Use the Script (Recommended)

I've created a helper script for you! Just run:

```bash
npm run make-admin your-email@example.com
```

Replace `your-email@example.com` with your actual email address.

**Example:**
```bash
npm run make-admin admin@yubbox.com
```

The script will:
- ✅ Connect to your MongoDB database
- ✅ Find your user by email
- ✅ Update your role to `admin`
- ✅ Show you confirmation

Then just **log out and log back in** to refresh your session!

---

### Alternative Method: MongoDB Compass

1. **Open MongoDB Compass** (or your MongoDB GUI)
2. **Connect to your database**
3. **Go to the `users` collection**
4. **Find your user** (search by your email)
5. **Edit the document** and add/update:
   ```json
   {
     "role": "admin"
   }
   ```
6. **Save**

### Alternative: MongoDB Shell

```bash
# Open terminal/command prompt
mongosh

# Switch to your database (replace 'yubbox' with your database name)
use yubbox

# Update your user (replace email with your actual email)
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

# Verify it worked
db.users.findOne({ email: "your-email@example.com" })
```

You should see `"role": "admin"` in the result.

---

## Step 2: Log Out and Log Back In

1. **Go to your dashboard** (`http://localhost:3000/dashboard`)
2. **Click "Sign Out"** (or logout button)
3. **Log back in** with your account

This refreshes your session so it recognizes you as an admin.

---

## Step 3: Access Admin Dashboard

### Option A: Via Dashboard Button
- After logging in, you'll see an **"Admin Panel"** button in your dashboard
- Click it to go to the admin dashboard

### Option B: Direct URL
- Go directly to: `http://localhost:3000/admin`
- (Replace `localhost:3000` with your domain if in production)

---

## Step 4: Add Categories, Industries, and Product Types

Once in the admin dashboard, you'll see three cards:

### 📁 Categories
1. Click **"Categories"**
2. Click **"+ Add New"** button
3. Fill in:
   - **Name**: e.g., "Electronics", "Food & Beverage"
   - **Description**: (Optional)
   - **Order**: Number for sorting (1 = first)
   - **Active**: ✓ Checked = visible to users
4. Click **"Create"**

### 🏢 Industries
1. Click **"Industries"**
2. Click **"+ Add New"**
3. Fill in the same fields as Categories
4. Examples: "Technology", "Healthcare", "Finance"

### 📦 Product Types
1. Click **"Product Types"**
2. Click **"+ Add New"**
3. Fill in:
   - **Name**: e.g., "SaaS Software", "Physical Goods"
   - **Type**: Select either:
     - **Service** - For services
     - **Physical** - For physical products
   - **Description**: (Optional)
   - **Order**: Number
   - **Active**: ✓ Checked
4. Click **"Create"**

---

## Quick Setup: Add Default Data

If you want to quickly add some default categories, industries, and product types, you can run this in MongoDB:

### Using MongoDB Compass:
1. Go to your database
2. Create new documents in each collection:

**Categories Collection:**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic devices and gadgets",
  "order": 1,
  "isActive": true
}
```

**Industries Collection:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "description": "Technology industry",
  "order": 1,
  "isActive": true
}
```

**ProductTypes Collection:**
```json
{
  "name": "SaaS Software",
  "slug": "saas-software",
  "type": "service",
  "description": "Software as a Service",
  "order": 1,
  "isActive": true
}
```

### Using MongoDB Shell:

```javascript
use yubbox

// Add Categories
db.categories.insertMany([
  { name: "Electronics", slug: "electronics", order: 1, isActive: true },
  { name: "Food & Beverage", slug: "food-beverage", order: 2, isActive: true },
  { name: "Clothing & Fashion", slug: "clothing-fashion", order: 3, isActive: true },
  { name: "Services", slug: "services", order: 4, isActive: true },
  { name: "Software & Technology", slug: "software-technology", order: 5, isActive: true }
])

// Add Industries
db.industries.insertMany([
  { name: "Technology", slug: "technology", order: 1, isActive: true },
  { name: "Healthcare", slug: "healthcare", order: 2, isActive: true },
  { name: "Finance", slug: "finance", order: 3, isActive: true },
  { name: "Retail & E-commerce", slug: "retail-ecommerce", order: 4, isActive: true },
  { name: "Education", slug: "education", order: 5, isActive: true }
])

// Add Product Types
db.producttypes.insertMany([
  { name: "SaaS Software", slug: "saas-software", type: "service", order: 1, isActive: true },
  { name: "Consulting Services", slug: "consulting-services", type: "service", order: 2, isActive: true },
  { name: "Digital Marketing", slug: "digital-marketing", type: "service", order: 3, isActive: true },
  { name: "Physical Electronics", slug: "physical-electronics", type: "physical", order: 4, isActive: true },
  { name: "Clothing & Apparel", slug: "clothing-apparel", type: "physical", order: 5, isActive: true }
])
```

---

## Troubleshooting

### ❌ Can't see "Admin Panel" button
- Make sure you logged out and logged back in after making yourself admin
- Check your user role in database: `db.users.findOne({ email: "your-email" })`
- Clear browser cache

### ❌ Getting "Unauthorized" when accessing `/admin`
- Verify your user has `role: "admin"` in database
- Log out and log back in
- Check server console for errors

### ❌ Admin dashboard shows but can't add items
- Check browser console for errors
- Verify MongoDB connection
- Check server logs

---

## Admin URLs

- **Main Admin Dashboard**: `/admin`
- **Categories**: `/admin/categories`
- **Industries**: `/admin/industries`
- **Product Types**: `/admin/product-types`

---

## After Adding Items

1. **Refresh your browser** - The ad creation form will automatically load the new options
2. **Test creating a Yubbox** - You should see the dropdowns populated with your new categories, industries, and product types
3. **All three fields are required** - Users must select Category, Industry, and Product Type when creating a Yubbox

---

**That's it!** You're now ready to manage your content. 🎉

