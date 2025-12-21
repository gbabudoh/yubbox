/**
 * Create a super admin account
 * Usage: node scripts/createSuperAdmin.js
 * 
 * This will create a super admin user with:
 * Email: admin@yubbox.com
 * Password: Admin123!@#
 * 
 * You can change these in the script or pass as arguments
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    // Default credentials (you can change these)
    const defaultEmail = process.argv[2] || 'admin@yubbox.com';
    const defaultPassword = process.argv[3] || 'Admin123!@#';
    const defaultName = process.argv[4] || 'Super Admin';

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: defaultEmail.toLowerCase().trim() });
    
    if (existingAdmin) {
      console.log(`⚠️  User with email ${defaultEmail} already exists!`);
      console.log('   Updating to admin role...\n');
      
      // Update existing user to admin
      existingAdmin.role = 'admin';
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash(defaultPassword, salt);
      existingAdmin.name = defaultName;
      await existingAdmin.save();
      
      console.log('✅ Existing user updated to super admin!\n');
      console.log('📋 Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:    ${defaultEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Name:     ${defaultName}`);
      console.log(`   Role:     admin`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      // Create new admin user
      console.log('👤 Creating super admin account...\n');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      const admin = await User.create({
        name: defaultName,
        email: defaultEmail.toLowerCase().trim(),
        password: hashedPassword,
        role: 'admin'
      });

      console.log('✅ Super admin account created successfully!\n');
      console.log('📋 Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:    ${defaultEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Name:     ${defaultName}`);
      console.log(`   Role:     admin`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    console.log('📝 Next Steps:');
    console.log('   1. Go to: http://localhost:3000/login');
    console.log('   2. Login with the credentials above');
    console.log('   3. You\'ll see "Admin Panel" button in dashboard');
    console.log('   4. Or go directly to: http://localhost:3000/admin\n');
    
    console.log('💡 Tip: Change the password after first login for security!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists. Use different email or update existing user.');
    }
    process.exit(1);
  }
}

createSuperAdmin();

