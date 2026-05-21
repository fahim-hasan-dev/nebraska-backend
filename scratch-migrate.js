const mongoose = require('mongoose');

async function migrate() {
  const url = 'mongodb://localhost:27017/nebraska';
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB via Mongoose');
    
    const db = mongoose.connection.db;
    const collection = db.collection('sponsors');
    
    const sponsors = await collection.find({}).toArray();
    console.log(`Found ${sponsors.length} total sponsors:`, JSON.stringify(sponsors, null, 2));
  } catch (err) {
    console.error('Error logging sponsors:', err);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
