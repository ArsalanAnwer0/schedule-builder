import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/session';
import dbConnect from '../../../../lib/db/connect';
import Schedule from '../../../../lib/db/models/Schedule';
import User from '../../../../lib/db/models/User';

// GET - Fetch published schedule for students
export async function GET(request) {
  try {
    // Check authentication (students or admin can view)
    try {
      await requireAuth();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get the published schedule
    const publishedSchedule = await Schedule.findOne({ status: 'published' })
      .sort({ publishedAt: -1 });

    if (!publishedSchedule) {
      return NextResponse.json({ schedule: null });
    }

    // Get all student information for the schedule
    const studentIds = [...new Set(publishedSchedule.shifts.map(shift => shift.studentId.toString()))];
    const students = await User.find({ _id: { $in: studentIds } }).select('_id name email');

    // Create a map of student ID to student info
    const studentMap = {};
    students.forEach(student => {
      studentMap[student._id.toString()] = {
        id: student._id.toString(),
        name: student.name,
        email: student.email
      };
    });

    // Transform shifts to include student names
    const shiftsWithNames = publishedSchedule.shifts.map(shift => ({
      studentId: shift.studentId.toString(),
      studentName: studentMap[shift.studentId.toString()]?.name || 'Unknown',
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      hours: shift.hours
    }));

    // Organize by day
    const scheduleByDay = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    };

    shiftsWithNames.forEach(shift => {
      if (scheduleByDay[shift.day]) {
        scheduleByDay[shift.day].push(shift);
      }
    });

    return NextResponse.json({
      schedule: {
        id: publishedSchedule._id.toString(),
        strategyName: publishedSchedule.strategyName,
        publishedAt: publishedSchedule.publishedAt,
        scheduleConfig: publishedSchedule.scheduleConfig,
        shifts: scheduleByDay,
        totalHoursByStudent: publishedSchedule.totalHoursByStudent
      }
    });

  } catch (error) {
    console.error('Get published schedule error:', error);
    return NextResponse.json({ error: 'Failed to fetch published schedule' }, { status: 500 });
  }
}
