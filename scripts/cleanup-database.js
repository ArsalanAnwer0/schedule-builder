/**
 * Database Cleanup Script
 * This script deletes ALL data from the database to start fresh
 * USE WITH CAUTION - THIS WILL DELETE EVERYTHING!
 */

import dbConnect from '../lib/db/connect.js';
import User from '../lib/db/models/User.js';
import Session from '../lib/db/models/Session.js';
import Availability from '../lib/db/models/Availability.js';
import AvailabilityEditRequest from '../lib/db/models/AvailabilityEditRequest.js';
import Schedule from '../lib/db/models/Schedule.js';
import VerificationCode from '../lib/db/models/VerificationCode.js';

async function cleanupDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await dbConnect();

    console.log('⚠️  WARNING: This will delete ALL data from the database!');
    console.log('⏳ Starting cleanup in 3 seconds...');

    // Wait 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🗑️  Deleting all data...\n');

    // Delete all collections
    const results = await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Availability.deleteMany({}),
      AvailabilityEditRequest.deleteMany({}),
      Schedule.deleteMany({}),
      VerificationCode.deleteMany({}),
    ]);

    console.log('✅ Cleanup complete!');
    console.log('\nDeleted:');
    console.log(`  - Users: ${results[0].deletedCount}`);
    console.log(`  - Sessions: ${results[1].deletedCount}`);
    console.log(`  - Availability: ${results[2].deletedCount}`);
    console.log(`  - Edit Requests: ${results[3].deletedCount}`);
    console.log(`  - Schedules: ${results[4].deletedCount}`);
    console.log(`  - Verification Codes: ${results[5].deletedCount}`);
    console.log('\n🎉 Database is now clean! You can start fresh.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupDatabase();
