const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/nebraska';
console.log('Connecting to:', dbUrl);

mongoose.connect(dbUrl).then(async () => {
  console.log('Connected!');
  const db = mongoose.connection.db;
  const sponsors = await db.collection('sponsors').find({}).toArray();
  console.log('All Sponsors in DB:');
  console.log(JSON.stringify(sponsors, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
