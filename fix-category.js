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

async function fixCategory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yubbox');
    console.log('Connected to MongoDB');
    
    // Find and update the cosmetics category
    const result = await Category.updateOne(
      { name: 'Cosmetics' },
      { 
        $set: { 
          type: 'product',
          slug: 'cosmetics'
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} document(s)`);
    
    // Verify the update
    const category = await Category.findOne({ name: 'Cosmetics' });
    if (category) {
      console.log('\nUpdated category:');
      console.log(`- Name: "${category.name}" | Type: "${category.type}" | Slug: "${category.slug}"`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCategory();
