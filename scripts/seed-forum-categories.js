import mongoose from 'mongoose';
import dbConnect from '../lib/db/connect.js';
import Category from '../lib/db/models/Category.js';

const categories = [
  {
    name: 'Announcements',
    slug: 'announcements',
    description: 'Official updates and announcements from the Schedule Builder team',
    icon: '📢',
    color: '#14b8a6',
    order: 0,
  },
  {
    name: 'Help & Support',
    slug: 'help-support',
    description: 'Get help with using Schedule Builder and troubleshooting issues',
    icon: '❓',
    color: '#3b82f6',
    order: 1,
  },
  {
    name: 'Feature Requests',
    slug: 'feature-requests',
    description: 'Share your ideas and suggest new features for Schedule Builder',
    icon: '💡',
    color: '#a855f7',
    order: 2,
  },
  {
    name: 'Bug Reports',
    slug: 'bug-reports',
    description: 'Report bugs and technical issues you encounter',
    icon: '🐛',
    color: '#ef4444',
    order: 3,
  },
  {
    name: 'General Discussion',
    slug: 'general-discussion',
    description: 'Discuss anything related to scheduling, team management, and more',
    icon: '💬',
    color: '#6b7280',
    order: 4,
  },
];

async function seedCategories() {
  try {
    await dbConnect();

    console.log('Seeding forum categories...');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const result = await Category.insertMany(categories);
    console.log(`Created ${result.length} categories:`);
    result.forEach(cat => {
      console.log(`  - ${cat.icon} ${cat.name} (${cat.slug})`);
    });

    console.log('✓ Forum categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
