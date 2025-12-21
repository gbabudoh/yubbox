const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Import User model
const User = require('../models/User').default || require('../models/User');

async function createAdmin() {
  try {
    // Get credentials from command line or use defaults
    const email = process.argv[2] || 'admin@yubbox.com';
    const password = process.argv[3] || 'Admin123!@#';
    const name = process.argv[4] || 'Super Admin';

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      
      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('ℹ️  User is already an admin');
      }
      
      console.log('\n📋 Admin Details:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log('\n🔐 Use your existing password to login');
    } else {
      // Create new admin user
      console.log('\n🔨 Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const adminUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Login Details:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: admin`);
    }

    console.log('\n🌐 Access Points:');
    console.log('   Admin Login: http://localhost:3000/admin-login');
    console.log('   Admin Dashboard: http://localhost:3000/admin');
    console.log('   Regular Login: http://localhost:3000/login');
    
    console.log('\n✨ You can now login with these credentials!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createAdmin();
