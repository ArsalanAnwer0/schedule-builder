// Time conversion utilities for Schedule Builder

/**
 * Convert 12-hour time format to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "8:00 AM", "12:00 PM")
 * @returns {string} Time in 24-hour format (e.g., "08:00", "12:00")
 */
export function convertTo24Hour(time12h) {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert 24-hour time format to 12-hour format
 * @param {string} time24h - Time in 24-hour format (e.g., "08:00", "17:00")
 * @returns {string} Time in 12-hour format (e.g., "8:00 AM", "5:00 PM")
 */
export function convertTo12Hour(time24h) {
  let [hours, minutes] = time24h.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Normalize day name to have first letter capitalized
 * @param {string} day - Day name in any case (e.g., "monday", "Monday", "MONDAY")
 * @returns {string} Day name with first letter capitalized (e.g., "Monday")
 */
export function normalizeDay(day) {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

/**
 * Convert time to minutes since midnight for easy comparison
 * @param {string} time24h - Time in 24-hour format (e.g., "08:00", "14:30")
 * @returns {number} Minutes since midnight (e.g., 480 for "08:00", 870 for "14:30")
 */
export function timeToMinutes(time24h) {
  const [hours, minutes] = time24h.split(':').map(Number);
  return hours * 60 + minutes;
}
