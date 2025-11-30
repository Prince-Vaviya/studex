const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assignment';

async function checkDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to: ${MONGODB_URI}`);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log('Users:', userCount);

    const courseCount = await mongoose.connection.db.collection('courses').countDocuments();
    console.log('Courses:', courseCount);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDb();
