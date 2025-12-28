import mongoose from 'mongoose';
import User from '../lib/db/models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete the duplicate student user with gmail
    await User.deleteOne({ email: 'arsalan.anwer9050@gmail.com' });
    console.log('Deleted duplicate user');

    // Update admin user to use gmail
    const admin = await User.findOneAndUpdate(
      { email: 'admin@schedule-builder.com' },
      { email: 'arsalan.anwer9050@gmail.com' },
      { new: true }
    );
    console.log('Admin user updated:', admin);

    // Update student user to use yahoo
    const student = await User.findOneAndUpdate(
      { email: 'student@schedule-builder.com' },
      { email: 'arsalan.anwer9050@yahoo.com' },
      { new: true }
    );
    console.log('Student user updated:', student);

    await mongoose.connection.close();
    console.log('Users updated successfully!');
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

updateUsers();
