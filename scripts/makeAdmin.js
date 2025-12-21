/**
 * Make a user an admin
 * Usage: node scripts/makeAdmin.js user@example.com
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define User schema inline since we can't easily import TypeScript models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function makeAdmin() {
  try {
    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/makeAdmin.js user@example.com');
      process.exit(1);
    }

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update user
    console.log(`🔍 Looking for user: ${email}`);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`✅ User ${email} is now an admin!`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.error(`❌ User with email ${email} not found`);
      console.log('   Make sure the user exists and the email is correct');
      process.exit(1);
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n📝 Next steps:');
    console.log('   1. Log out of your account');
    console.log('   2. Log back in');
    console.log('   3. Go to /admin or click "Admin Panel" button');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();

