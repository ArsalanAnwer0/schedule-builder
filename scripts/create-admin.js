import dotenv from 'dotenv';
import dbConnect from '../lib/db/connect.js';
import User from '../lib/db/models/User.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Name: ${existingAdmin.name}`);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@schedule-builder.com',
      name: 'Admin User',
      role: 'admin',
    });

    console.log('✓ Admin user created successfully!');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Name: ${admin.name}`);
    console.log(`  Role: ${admin.role}`);
    console.log('\nYou can now login at http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
