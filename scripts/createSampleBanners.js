require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const BannerAdSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    imageUrl: String,
    linkUrl: String,
    cost: Number,
    startDate: Date,
    endDate: Date,
    isActive: Boolean,
    displayOrder: Number,
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const BannerAd = mongoose.models.BannerAd || mongoose.model('BannerAd', BannerAdSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const sampleBanners = [
  {
    title: 'Launch Your Business to New Heights',
    description: 'Discover cutting-edge cloud solutions that scale with your ambitions. Transform your digital presence today.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
    linkUrl: 'https://example.com/cloud-solutions',
    cost: 500,
    displayOrder: 1,
  },
  {
    title: 'Premium E-Commerce Platform',
    description: 'Build your online store with our award-winning platform. Trusted by over 10,000 businesses worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop',
    linkUrl: 'https://example.com/ecommerce',
    cost: 750,
    displayOrder: 2,
  },
  {
    title: 'AI-Powered Marketing Solutions',
    description: 'Revolutionize your marketing strategy with artificial intelligence. Increase ROI by up to 300%.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop',
    linkUrl: 'https://example.com/ai-marketing',
    cost: 600,
    displayOrder: 3,
  },
];

async function createSampleBanners() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.email}`);

    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30);

    console.log('\nCreating sample banner ads...');

    for (const banner of sampleBanners) {
      const existingBanner = await BannerAd.findOne({ title: banner.title });
      
      if (existingBanner) {
        console.log(`✓ Banner "${banner.title}" already exists, skipping...`);
        continue;
      }

      const newBanner = await BannerAd.create({
        ...banner,
        startDate,
        endDate,
        isActive: true,
        createdBy: adminUser._id,
      });

      console.log(`✓ Created banner: "${newBanner.title}"`);
    }

    console.log('\n✅ Sample banner ads created successfully!');
    console.log(`📅 Active from: ${startDate.toLocaleDateString()}`);
    console.log(`📅 Active until: ${endDate.toLocaleDateString()}`);
    console.log('\nYou can now view them on the homepage or manage them in the admin panel at /admin/banner-ads');

  } catch (error) {
    console.error('Error creating sample banners:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createSampleBanners();
