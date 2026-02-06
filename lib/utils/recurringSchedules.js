import crypto from 'crypto';

/**
 * Calculate the next run time for a recurring schedule rule
 * @param {Object} rule - The recurring schedule rule
 * @param {Date} fromDate - The date to calculate from (defaults to now)
 * @returns {Date} - The next run time
 */
export function calculateNextRunTime(rule, fromDate = new Date()) {
  const { frequency, dayOfWeek, dayOfMonth, timezone } = rule;

  // For now, use simple UTC-based calculations
  // TODO: Add proper timezone handling with date-fns-tz
  const next = new Date(fromDate);

  if (frequency === 'weekly') {
    // Find next occurrence of dayOfWeek
    const currentDay = next.getDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntilNext);
    next.setHours(9, 0, 0, 0); // Run at 9 AM
  } else if (frequency === 'biweekly') {
    // Find next occurrence of dayOfWeek, 2 weeks ahead
    const currentDay = next.getDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntilNext + 7); // Add extra week
    next.setHours(9, 0, 0, 0);
  } else if (frequency === 'monthly') {
    // Move to next month and set day
    next.setMonth(next.getMonth() + 1);
    next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    next.setHours(9, 0, 0, 0);
  }

  return next;
}

/**
 * Calculate the schedule period (start/end dates) based on rule
 * @param {Object} rule - The recurring schedule rule
 * @param {Date} currentDate - The current date
 * @returns {Object} - { startDate, endDate }
 */
export function calculateSchedulePeriod(rule, currentDate = new Date()) {
  const { frequency, scheduleWeeksAhead } = rule;
  const weeksAhead = scheduleWeeksAhead || 1;

  const startDate = new Date(currentDate);
  const endDate = new Date(currentDate);

  if (frequency === 'weekly') {
    // Find next Monday
    const dayOfWeek = startDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    startDate.setDate(startDate.getDate() + daysUntilMonday);

    // End date is Friday of the same week
    endDate.setDate(startDate.getDate() + 4);
  } else if (frequency === 'biweekly') {
    // Find next Monday
    const dayOfWeek = startDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    startDate.setDate(startDate.getDate() + daysUntilMonday);

    // End date is Friday of second week
    endDate.setDate(startDate.getDate() + 11);
  } else if (frequency === 'monthly') {
    // Start from first day of next month
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(1);

    // End date is last day of that month
    endDate.setMonth(startDate.getMonth() + 1);
    endDate.setDate(0);
  }

  // Format as YYYY-MM-DD
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Calculate MD5 hash of student availability data
 * @param {Array} students - Array of student objects with availability
 * @returns {String} - MD5 hash
 */
export function calculateAvailabilityHash(students) {
  if (!students || students.length === 0) {
    return '';
  }

  // Create consistent string representation of availability
  const availabilityData = students
    .map(student => {
      const availability = student.availability || {};
      return `${student._id}:${JSON.stringify(availability)}`;
    })
    .sort()
    .join('|');

  return crypto.createHash('md5').update(availabilityData).digest('hex');
}

/**
 * Detect if student availability has changed significantly
 * @param {Object} rule - The recurring schedule rule
 * @param {String} currentHash - Current availability hash
 * @returns {Object} - { changed: boolean, percentageChanged: number }
 */
export function detectAvailabilityChange(rule, currentHash) {
  const { lastAvailabilityHash, availabilityChangeThreshold } = rule;

  // If no previous hash, consider it unchanged (first run)
  if (!lastAvailabilityHash) {
    return { changed: false, percentageChanged: 0 };
  }

  // If hashes match, no change
  if (lastAvailabilityHash === currentHash) {
    return { changed: false, percentageChanged: 0 };
  }

  // Hashes differ - calculate simple change indicator
  // For now, just return 100% if different
  // TODO: Implement more granular change detection
  const percentageChanged = 100;

  return {
    changed: percentageChanged >= availabilityChangeThreshold,
    percentageChanged
  };
}

/**
 * Check if schedule period exceeds semester boundary
 * @param {Object} rule - The recurring schedule rule
 * @param {Object} period - The calculated schedule period { startDate, endDate }
 * @returns {Boolean} - true if exceeds boundary
 */
export function checkSemesterBoundary(rule, period) {
  const { semesterEndDate } = rule;

  if (!semesterEndDate) {
    return false; // No boundary set
  }

  const periodEnd = new Date(period.endDate);
  const semesterEnd = new Date(semesterEndDate);

  return periodEnd > semesterEnd;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
export function formatDateForDisplay(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get relative time string (e.g., "in 2 hours", "tomorrow")
 * @param {Date} date - Date to compare
 * @returns {String} - Relative time string
 */
export function getRelativeTimeString(date) {
  if (!date) return '';

  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 0) return 'Past due';
  if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `in ${diffDays} days`;

  return formatDateForDisplay(date);
}
