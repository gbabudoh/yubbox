const mongoose = require('mongoose');
const Ad = require('./models/Ad');

async function fixAdActive() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yubbox');
    
    // Update the specific ad to be active
    const result = await Ad.updateMany(
      { isActive: false },
      { isActive: true }
    );
    
    console.log(`Updated ${result.modifiedCount} ads to active`);
    
    // Verify the update
    const ad = await Ad.findById('694859207d87a8ac46c93fcc');
    console.log('Ad is now active:', ad?.isActive);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdActive();
