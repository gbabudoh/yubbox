const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'service'], required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

async function checkCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yubbox');
    console.log('Connected to MongoDB');
    
    const categories = await Category.find({});
    console.log('\nAll categories in database:');
    categories.forEach(cat => {
      console.log(`- Name: "${cat.name}" | Type: "${cat.type}" | ID: ${cat._id} | Active: ${cat.isActive}`);
    });
    
    // Check specifically for cosmetics
    const cosmetics = await Category.find({ name: /cosmetics/i });
    console.log('\nCosmetics categories found:');
    cosmetics.forEach(cat => {
      console.log(`- Name: "${cat.name}" | Type: "${cat.type}" | ID: ${cat._id}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCategories();
