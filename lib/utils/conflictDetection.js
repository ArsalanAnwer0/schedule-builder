// Conflict detection utilities for Schedule Builder
import dbConnect from '../db/connect';
import Schedule from '../db/models/Schedule';
import Availability from '../db/models/Availability';
import User from '../db/models/User';
import { convertTo24Hour, normalizeDay, timeToMinutes } from './timeConversion';

/**
 * Detect conflicts between scheduled shifts and current student availability
 * @param {string} scheduleId - The schedule ID to check
 * @param {string} organizationName - The organization name for security scoping
 * @returns {Promise<Object>} Object with hasConflicts boolean and conflicts array
 */
export async function detectScheduleConflicts(scheduleId, organizationName) {
  await dbConnect();

  // 1. Load schedule
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule || schedule.organizationName !== organizationName) {
    throw new Error('Schedule not found or access denied');
  }

  // 2. Get unique student IDs from shifts
  const studentIds = [...new Set(schedule.shifts.map(s => s.studentId.toString()))];

  // 3. Batch load students and availabilities
  const [students, availabilities] = await Promise.all([
    User.find({ _id: { $in: studentIds } }).select('name').lean(),
    Availability.find({ userId: { $in: studentIds } }).lean()
  ]);

  // Create lookup maps
  const studentMap = Object.fromEntries(students.map(s => [s._id.toString(), s.name]));
  const availabilityMap = Object.fromEntries(
    availabilities.map(a => [a.userId.toString(), a])
  );

  // 4. Check each shift for conflicts
  const conflicts = [];
  const processedStudents = new Set(); // Track conflicts per student

  for (const shift of schedule.shifts) {
    const studentId = shift.studentId.toString();
    const studentName = studentMap[studentId] || 'Unknown Student';
    const availability = availabilityMap[studentId];

    // Skip if already processed this student
    if (processedStudents.has(studentId)) continue;

    // Check Type 1: Student deleted from system
    if (!studentMap[studentId]) {
      conflicts.push({
        studentId,
        studentName: 'Unknown Student (Deleted)',
        conflictType: 'shift_not_covered',
        details: {
          day: shift.day,
          scheduledShift: { start: shift.startTime, end: shift.endTime },
          currentAvailability: null,
          reason: 'Student account deleted'
        }
      });
      processedStudents.add(studentId);
      continue;
    }

    // Check Type 2: Availability deleted/missing
    if (!availability) {
      conflicts.push({
        studentId,
        studentName,
        conflictType: 'shift_not_covered',
        details: {
          day: shift.day,
          scheduledShift: { start: shift.startTime, end: shift.endTime },
          currentAvailability: null,
          reason: 'No availability submitted'
        }
      });
      processedStudents.add(studentId);
      continue;
    }

    // Check Type 3: Availability changed after generation
    if (availability.updatedAt > schedule.generatedAt) {
      // Also check if current availability covers the shift
      const dayCapitalized = normalizeDay(shift.day);
      const availSlots = availability.availability[dayCapitalized] || [];

      const shiftCovered = checkIfShiftCovered(
        shift.startTime,
        shift.endTime,
        availSlots
      );

      conflicts.push({
        studentId,
        studentName,
        conflictType: shiftCovered ? 'availability_changed' : 'shift_not_covered',
        details: {
          day: shift.day,
          scheduledShift: { start: shift.startTime, end: shift.endTime },
          currentAvailability: availSlots,
          availabilityUpdatedAt: availability.updatedAt,
          scheduleGeneratedAt: schedule.generatedAt,
          reason: shiftCovered
            ? 'Availability changed after schedule generation'
            : 'Current availability does not cover scheduled shift'
        }
      });
      processedStudents.add(studentId);
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Check if availability time slots cover the full shift duration
 * @param {string} startTime24 - Shift start time in 24-hour format (e.g., "08:00")
 * @param {string} endTime24 - Shift end time in 24-hour format (e.g., "12:00")
 * @param {Array<string>} availabilitySlots12 - Array of availability slots in 12-hour format (e.g., ["8:00 AM", "8:30 AM", ...])
 * @returns {boolean} True if availability covers the shift, false otherwise
 */
function checkIfShiftCovered(startTime24, endTime24, availabilitySlots12) {
  if (!availabilitySlots12 || availabilitySlots12.length === 0) return false;

  // Convert shift times to minutes
  const shiftStartMin = timeToMinutes(startTime24); // e.g., "08:00" → 480
  const shiftEndMin = timeToMinutes(endTime24);     // e.g., "12:00" → 720

  // Convert availability slots to 24-hour and minutes
  const availMinutes = availabilitySlots12
    .map(slot12 => {
      const time24 = convertTo24Hour(slot12); // "8:00 AM" → "08:00"
      return timeToMinutes(time24);
    })
    .sort((a, b) => a - b);

  if (availMinutes.length === 0) return false;

  // Check if availability spans the shift
  // Availability slots are in 30-min increments, so add 30 to last slot for end time
  const availStart = availMinutes[0];
  const availEnd = availMinutes[availMinutes.length - 1] + 30;

  return availStart <= shiftStartMin && availEnd >= shiftEndMin;
}
