import mongoose from 'mongoose';
import User from '../lib/db/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('Current users:', JSON.stringify(users, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
