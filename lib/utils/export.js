/**
 * Export utility functions for schedule data
 */

// Convert 24-hour time to 12-hour format
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

/**
 * Export schedule to CSV format
 * @param {Object} schedule - The schedule object containing worker schedules
 * @param {string} scheduleName - Name of the schedule option
 * @returns {string} CSV formatted string
 */
export function exportToCSV(schedule, scheduleName = 'Schedule') {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Create CSV header
  const headers = ['Worker', ...days, 'Total Hours'];
  let csv = headers.join(',') + '\n';

  // Add each worker's schedule
  schedule.forEach(worker => {
    const row = [worker.workerName];

    days.forEach(day => {
      if (worker.schedule[day]) {
        if (Array.isArray(worker.schedule[day])) {
          // Multiple shifts
          const shifts = worker.schedule[day]
            .map(shift => `${convertTo12Hour(shift.start)}-${convertTo12Hour(shift.end)} (${shift.hours}h)`)
            .join('; ');
          row.push(`"${shifts}"`);
        } else {
          // Single shift
          const shift = worker.schedule[day];
          row.push(`"${convertTo12Hour(shift.start)}-${convertTo12Hour(shift.end)} (${shift.hours}h)"`);
        }
      } else {
        row.push('');
      }
    });

    row.push(worker.totalHours + 'h');
    csv += row.join(',') + '\n';
  });

  return csv;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(csvContent, filename = 'schedule.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export all schedules to CSV
 * @param {Array} schedules - Array of schedule objects
 * @param {Object} formData - Form data containing office hours and dates
 */
export function exportAllSchedulesToCSV(schedules, formData) {
  schedules.forEach((scheduleOption, index) => {
    const csv = exportToCSV(scheduleOption.schedule, scheduleOption.name);
    const filename = `schedule_option_${index + 1}_${scheduleOption.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    downloadCSV(csv, filename);
  });
}
