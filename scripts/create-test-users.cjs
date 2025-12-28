require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

// User Schema (same as in app)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true,
    default: 'student',
  },
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createTestUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    console.log('Connected to MongoDB');

    // Delete existing test users if they exist
    await User.deleteMany({
      email: { $in: ['admin@schedule-builder.com', 'student@schedule-builder.com'] }
    });

    console.log('Deleted existing test users');

    // Create admin user
    const admin = await User.create({
      email: 'admin@schedule-builder.com',
      name: 'Admin User',
      role: 'admin',
    });

    console.log('Created admin user:', admin.email);

    // Create student user
    const student = await User.create({
      email: 'student@schedule-builder.com',
      name: 'Student User',
      role: 'student',
    });

    console.log('Created student user:', student.email);

    console.log('\nTest users created successfully!');
    console.log('Admin: admin@schedule-builder.com');
    console.log('Student: student@schedule-builder.com');

    process.exit(0);

  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
