# Admin Login Guide

## Quick Start: Create Admin Account

Run this command to create a new admin account:

```bash
npm run create-admin
```

This will create an admin account with default credentials:
- **Email**: `admin@yubbox.com`
- **Password**: `Admin123!@#`
- **Name**: `Super Admin`

### Custom Credentials

You can specify custom credentials:

```bash
npm run create-admin your-email@example.com YourPassword123 "Your Name"
```

**Example:**
```bash
npm run create-admin john@company.com SecurePass123 "John Admin"
```

---

## Admin Access Points

### Admin Login Page
**URL**: `http://localhost:3000/admin-login`

This is a dedicated login page specifically for admin users. It:
- Has a purple/dark theme to distinguish it from regular login
- Validates that the user has admin role after authentication
- Redirects to admin dashboard upon successful login
- Shows clear error messages if access is denied

### Admin Dashboard
**URL**: `http://localhost:3000/admin`

Once logged in, you'll have access to:
- **Dashboard** - Overview statistics
- **Users** - Manage all users
- **Activities** - View user activities
- **All Ads** - Manage all advertisements
- **Banner Ads** - Manage banner advertisements
- **Payments** - View payment history
- **Categories** - Manage product/service categories
- **Industries** - Manage industry classifications
- **Product Types** - Manage product type classifications

---

## Features

### Separate Admin Portal
- Dedicated admin login page at `/admin/login`
- Different styling (purple theme) from regular user login
- Admin role verification before granting access
- Automatic redirect to admin dashboard after login

### Security
- Only users with `role: "admin"` can access admin pages
- Server-side authentication checks
- Automatic redirect to admin login if not authenticated
- Session-based access control

### Easy Admin Creation
- Simple command: `npm run create-admin`
- Automatically checks if user exists
- Updates existing users to admin role if needed
- Creates new admin users with secure password hashing

---

## Troubleshooting

### Can't login to admin portal
1. Make sure you created an admin account using `npm run create-admin`
2. Check that you're using the correct email and password
3. Verify the user has `role: "admin"` in the database

### "Access denied" error
- The account exists but doesn't have admin privileges
- Run: `npm run make-admin your-email@example.com` to upgrade the account

### Redirected to regular login
- Make sure you're accessing `/admin-login` not `/login`
- Clear browser cache and try again

---

## Database Structure

Admin users in MongoDB have this structure:
```json
{
  "_id": "...",
  "name": "Super Admin",
  "email": "admin@yubbox.com",
  "password": "hashed_password",
  "role": "admin",
  "createdAt": "...",
  "updatedAt": "..."
}
```

The `role: "admin"` field is what grants admin access.

---

## Production Deployment

For production:
1. Create admin accounts with strong passwords
2. Use environment variables for default admin credentials
3. Change default passwords immediately after first login
4. Consider implementing 2FA for admin accounts
5. Use HTTPS for all admin access

---

## Next Steps

After logging in to the admin portal:

1. **Add Categories** - Go to Categories and add product/service categories with type (product/service)
2. **Add Industries** - Add industry classifications
3. **Manage Users** - View and manage user accounts
4. **Monitor Ads** - Review and manage all advertisements
5. **View Payments** - Track payment history and revenue

---

**That's it!** You now have a separate admin login and full admin access. 🎉
