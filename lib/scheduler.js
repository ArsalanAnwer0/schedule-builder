// Main scheduling algorithm - Coverage-first approach
export function generateSchedule(formData) {
  const {
    officeStartTime,
    officeEndTime,
    minShiftLength,
    maxShiftLength,
    workers
  } = formData;

  // Guard against division by zero
  if (!workers || workers.length === 0) {
    return {
      schedule: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      },
      workerHours: {},
      errors: ['No workers available to schedule']
    };
  }

  const warnings = [];
  const workerHours = {};

  workers.forEach(worker => {
    workerHours[worker.id] = 0;
  });

  const schedule = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const officeStartMinutes = timeToMinutes(officeStartTime);
  const officeEndMinutes = timeToMinutes(officeEndTime);

  days.forEach(day => {
    schedule[day] = [];

    // Get all workers available on this day
    const availableWorkers = workers.filter(worker =>
      worker.availability[day].available &&
      worker.availability[day].start &&
      worker.availability[day].end
    ).map(worker => ({
      ...worker,
      dayStart: worker.availability[day].start,
      dayEnd: worker.availability[day].end
    }));

    if (availableWorkers.length === 0) {
      warnings.push(`${day}: No workers available`);
      return;
    }

    // Strategy: Fill the entire office day from start to end
    let currentTime = officeStartMinutes;

    while (currentTime < officeEndMinutes) {
      // Find workers who can work at currentTime
      const eligibleWorkers = availableWorkers.filter(worker => {
        const workerStart = timeToMinutes(worker.dayStart);
        const workerEnd = timeToMinutes(worker.dayEnd);
        return workerStart <= currentTime && workerEnd > currentTime;
      });

      if (eligibleWorkers.length === 0) {
        // No one available at this time - log warning and skip ahead
        const nextAvailableTime = findNextAvailableTime(availableWorkers, currentTime, officeEndMinutes);
        if (nextAvailableTime > currentTime && nextAvailableTime < officeEndMinutes) {
          warnings.push(`${day}: No coverage from ${minutesToTime(currentTime)} to ${minutesToTime(nextAvailableTime)}`);
          currentTime = nextAvailableTime;
        } else {
          warnings.push(`${day}: No coverage from ${minutesToTime(currentTime)} to ${minutesToTime(officeEndMinutes)}`);
          break;
        }
        continue;
      }

      // Sort eligible workers by hours worked (prefer those with fewer hours)
      eligibleWorkers.sort((a, b) => workerHours[a.id] - workerHours[b.id]);

      // Select the worker with least hours
      const selectedWorker = eligibleWorkers[0];
      const workerStart = timeToMinutes(selectedWorker.dayStart);
      const workerEnd = timeToMinutes(selectedWorker.dayEnd);

      // Calculate how long this worker can work from currentTime
      const shiftStartMinutes = Math.max(currentTime, workerStart);
      let shiftEndMinutes = Math.min(workerEnd, officeEndMinutes);

      // Respect max shift length
      const maxShiftMinutes = maxShiftLength * 60;
      if (shiftEndMinutes - shiftStartMinutes > maxShiftMinutes) {
        shiftEndMinutes = shiftStartMinutes + maxShiftMinutes;
      }

      // Calculate shift duration
      const shiftDurationMinutes = shiftEndMinutes - shiftStartMinutes;
      const shiftDurationHours = shiftDurationMinutes / 60;

      // Only create shift if it meets minimum length
      if (shiftDurationHours >= minShiftLength) {
        const shiftStart = minutesToTime(shiftStartMinutes);
        const shiftEnd = minutesToTime(shiftEndMinutes);

        // Add shift to schedule
        schedule[day].push({
          workerId: selectedWorker.id,
          workerName: selectedWorker.name,
          startTime: shiftStart,
          endTime: shiftEnd,
          hours: parseFloat(shiftDurationHours.toFixed(2))
        });

        // Update worker hours
        workerHours[selectedWorker.id] += shiftDurationHours;

        // Move current time to end of this shift
        currentTime = shiftEndMinutes;
      } else {
        // Shift too short, skip to next possible time
        const nextTime = findNextAvailableTime(availableWorkers, currentTime + 1, officeEndMinutes);
        if (nextTime > currentTime && nextTime < officeEndMinutes) {
          warnings.push(`${day}: Gap from ${minutesToTime(currentTime)} to ${minutesToTime(nextTime)} (shift would be too short)`);
          currentTime = nextTime;
        } else {
          break;
        }
      }
    }

    // Sort shifts by start time
    schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  // Check for hour imbalances
  const hourValues = Object.values(workerHours);
  const maxHours = Math.max(...hourValues);
  const minHours = Math.min(...hourValues);
  if (maxHours - minHours > 2) {
    warnings.push(`Hour imbalance: ${minHours.toFixed(1)}h - ${maxHours.toFixed(1)}h (prioritized coverage over balance)`);
  }

  return {
    schedule,
    workerHours,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Helper: Find the next time when any worker becomes available
function findNextAvailableTime(workers, fromTime, maxTime) {
  let nextTime = maxTime;

  workers.forEach(worker => {
    const workerStart = timeToMinutes(worker.dayStart);

    // If worker's start time is after fromTime and before current nextTime
    if (workerStart > fromTime && workerStart < nextTime) {
      nextTime = workerStart;
    }
  });

  return nextTime;
}

// Helper: Convert time string to minutes since midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Convert minutes since midnight to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
