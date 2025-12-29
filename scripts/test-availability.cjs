// Test script to verify availability flow
// Run with: node scripts/test-availability.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const AvailabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    Monday: { type: [String], default: [] },
    Tuesday: { type: [String], default: [] },
    Wednesday: { type: [String], default: [] },
    Thursday: { type: [String], default: [] },
    Friday: { type: [String], default: [] },
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

AvailabilitySchema.index({ userId: 1 }, { unique: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
}, { timestamps: true });

async function testAvailabilityFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Availability = mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);

    // Find the student user (arsalan.anwer9050@yahoo.com)
    const student = await User.findOne({ email: 'arsalan.anwer9050@yahoo.com' });

    if (!student) {
      console.error('Student user not found!');
      process.exit(1);
    }

    console.log('\n✓ Found student:', student.name, '-', student.email);

    // Create test availability data
    const testAvailability = {
      userId: student._id,
      availability: {
        Monday: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'],
        Tuesday: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'],
        Wednesday: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'],
        Thursday: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'],
        Friday: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'],
      },
      notes: 'Test availability - Available all day Monday through Friday!'
    };

    // Upsert (create or update) the availability
    const savedAvailability = await Availability.findOneAndUpdate(
      { userId: student._id },
      testAvailability,
      { upsert: true, new: true, runValidators: true }
    );

    console.log('\n✓ Created/Updated availability:');
    console.log('  Monday:', savedAvailability.availability.Monday);
    console.log('  Tuesday:', savedAvailability.availability.Tuesday);
    console.log('  Wednesday:', savedAvailability.availability.Wednesday);
    console.log('  Thursday:', savedAvailability.availability.Thursday);
    console.log('  Friday:', savedAvailability.availability.Friday);
    console.log('  Notes:', savedAvailability.notes);

    // Now test the conversion logic (same as in handleGenerateSchedule)
    console.log('\n=== Testing Conversion Logic ===');

    const convertTo24Hour = (time12h) => {
      const [time, period] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const addThirtyMinutes = (time12h) => {
      const [time, period] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      minutes += 30;
      if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
      }

      let newPeriod = period;

      // If we went from 11:XX to 12:XX in AM, switch to PM
      if (period === 'AM' && hours === 12 && minutes > 0) {
        newPeriod = 'PM';
        hours = 12;
      }
      // If we went past 12 in PM (13+), wrap around but stay in PM
      else if (hours > 12) {
        hours -= 12;
      }

      return `${hours}:${String(minutes).padStart(2, '0')} ${newPeriod}`;
    };

    // Convert availability to scheduler format
    const availability = {};
    const studentAvail = savedAvailability.availability;

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      if (studentAvail[day] && studentAvail[day].length > 0) {
        const timeSlots = studentAvail[day];
        const sortedSlots = [...timeSlots].sort((a, b) => {
          const timeA = convertTo24Hour(a);
          const timeB = convertTo24Hour(b);
          return timeA.localeCompare(timeB);
        });

        const startTime12h = sortedSlots[0];
        const lastSlot12h = sortedSlots[sortedSlots.length - 1];
        const endTime12h = addThirtyMinutes(lastSlot12h);

        // Convert to 24-hour format for the scheduler
        const startTime24h = convertTo24Hour(startTime12h);
        const endTime24h = convertTo24Hour(endTime12h);

        availability[day] = {
          available: true,
          start: startTime24h,
          end: endTime24h
        };

        console.log(`  ${day}: ${startTime12h} → ${startTime24h} to ${endTime12h} → ${endTime24h} (from ${timeSlots.length} slots)`);
      } else {
        availability[day] = { available: false, start: '', end: '' };
      }
    });

    const worker = {
      id: student._id.toString(),
      name: student.name,
      availability: availability
    };

    console.log('\n✓ Converted worker object:');
    console.log(JSON.stringify(worker, null, 2));

    console.log('\n✅ Test completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Log in to the student portal with: arsalan.anwer9050@yahoo.com');
    console.log('2. Check the admin portal - you should see this student has submitted availability');
    console.log('3. Click "Generate Schedule" to test the scheduler');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testAvailabilityFlow();
