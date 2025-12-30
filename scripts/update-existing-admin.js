// Script to update existing admin accounts with adminType and organizationName
// Run this once to migrate existing admin accounts

import dbConnect from '../lib/db/connect.js';
import User from '../lib/db/models/User.js';

async function updateExistingAdmin() {
  try {
    await dbConnect();

    // Find all admin users without adminType
    const adminsWithoutType = await User.find({
      role: 'admin',
      adminType: { $exists: false }
    });

    if (adminsWithoutType.length === 0) {
      console.log('No admins need updating.');
      process.exit(0);
    }

    console.log(`Found ${adminsWithoutType.length} admin(s) without adminType.`);

    // Update the first admin to be primary
    if (adminsWithoutType.length > 0) {
      const firstAdmin = adminsWithoutType[0];
      firstAdmin.adminType = 'primary';

      // Prompt for organization name or use a default
      const organizationName = process.argv[2] || 'My Organization';
      firstAdmin.organizationName = organizationName;

      await firstAdmin.save();
      console.log(`✓ Updated ${firstAdmin.email} to primary admin with organization: ${organizationName}`);
    }

    // Update remaining admins to secondary
    for (let i = 1; i < adminsWithoutType.length; i++) {
      const admin = adminsWithoutType[i];
      admin.adminType = 'secondary';
      admin.organizationName = adminsWithoutType[0].organizationName;
      await admin.save();
      console.log(`✓ Updated ${admin.email} to secondary admin`);
    }

    console.log('\nMigration complete!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

updateExistingAdmin();
