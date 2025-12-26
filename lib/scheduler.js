/**
 * Coverage-First Schedule Generator v3
 *
 * MAIN OBJECTIVE (in priority order):
 * 1. Cover ALL office hours (M-F 8-4:30) - NO GAPS
 * 2. Schedule ALL workers - NO ONE MISSED
 * 3. Equal hours for everyone - FAIR DISTRIBUTION
 */

// Helper functions
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function calculateHours(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return (end - start) / 60;
}

// Get total available hours for a worker
function getTotalAvailableHours(worker) {
  let total = 0;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  for (const day of days) {
    const avail = worker.availability[day];
    if (avail && avail.available && avail.start && avail.end) {
      total += calculateHours(avail.start, avail.end);
    }
  }

  return total;
}

// Get worker availability for a day
function getWorkerAvailability(worker, day) {
  const avail = worker.availability[day];
  if (!avail || !avail.available || !avail.start || !avail.end) {
    return null;
  }

  return {
    startMinutes: timeToMinutes(avail.start),
    endMinutes: timeToMinutes(avail.end),
    hours: calculateHours(avail.start, avail.end)
  };
}

// Check if worker can work a shift
function canWorkerWorkShift(workerAvail, shiftStart, shiftEnd) {
  if (!workerAvail) return false;
  return workerAvail.startMinutes <= shiftStart && workerAvail.endMinutes >= shiftEnd;
}

// Create shift pattern to cover full day
function createShiftPattern(officeStartMinutes, officeEndMinutes, minShiftMinutes, maxShiftMinutes, strategy) {
  const totalMinutes = officeEndMinutes - officeStartMinutes;
  const shifts = [];

  if (strategy === 'long') {
    // Strategy 1: Longer shifts (2 workers per day)
    const shiftLength = Math.floor(totalMinutes / 2);
    shifts.push(
      { startMinutes: officeStartMinutes, endMinutes: officeStartMinutes + shiftLength },
      { startMinutes: officeStartMinutes + shiftLength, endMinutes: officeEndMinutes }
    );
  } else if (strategy === 'medium') {
    // Strategy 2: Medium shifts (3 workers per day)
    const shiftLength = Math.floor(totalMinutes / 3);
    shifts.push(
      { startMinutes: officeStartMinutes, endMinutes: officeStartMinutes + shiftLength },
      { startMinutes: officeStartMinutes + shiftLength, endMinutes: officeStartMinutes + (shiftLength * 2) },
      { startMinutes: officeStartMinutes + (shiftLength * 2), endMinutes: officeEndMinutes }
    );
  } else {
    // Strategy 3: Shorter shifts (4 workers per day)
    const shiftLength = Math.floor(totalMinutes / 4);
    shifts.push(
      { startMinutes: officeStartMinutes, endMinutes: officeStartMinutes + shiftLength },
      { startMinutes: officeStartMinutes + shiftLength, endMinutes: officeStartMinutes + (shiftLength * 2) },
      { startMinutes: officeStartMinutes + (shiftLength * 2), endMinutes: officeStartMinutes + (shiftLength * 3) },
      { startMinutes: officeStartMinutes + (shiftLength * 3), endMinutes: officeEndMinutes }
    );
  }

  return shifts;
}

// Assign workers to shifts for a day
function assignWorkersToDay(workers, day, shifts, currentHours, targetHours) {
  const assignments = [];
  const usedWorkers = new Set();

  // For each shift, find best available worker
  for (const shift of shifts) {
    const shiftHours = (shift.endMinutes - shift.startMinutes) / 60;
    let bestWorker = null;
    let bestScore = -Infinity;

    // Try all workers
    for (const worker of workers) {
      if (usedWorkers.has(worker.id)) continue;

      const workerAvail = getWorkerAvailability(worker, day);
      if (!canWorkerWorkShift(workerAvail, shift.startMinutes, shift.endMinutes)) {
        continue;
      }

      // Calculate score: prioritize workers who need more hours
      const currentWorkerHours = currentHours[worker.id] || 0;
      const hoursDeficit = targetHours - currentWorkerHours;
      const totalAvail = getTotalAvailableHours(worker);

      // Higher score = higher priority
      const score = hoursDeficit * 1000 - totalAvail;

      if (score > bestScore) {
        bestScore = score;
        bestWorker = worker;
      }
    }

    if (bestWorker) {
      assignments.push({
        worker: bestWorker,
        startMinutes: shift.startMinutes,
        endMinutes: shift.endMinutes,
        hours: shiftHours
      });
      usedWorkers.add(bestWorker.id);
      currentHours[bestWorker.id] = (currentHours[bestWorker.id] || 0) + shiftHours;
    } else {
      // NO WORKER AVAILABLE - GAP!
      assignments.push({
        worker: null,
        startMinutes: shift.startMinutes,
        endMinutes: shift.endMinutes,
        hours: shiftHours
      });
    }
  }

  return assignments;
}

// Find all coverage gaps in a day's schedule
function findCoverageGaps(assignments, officeStartTime, officeEndTime) {
  const officeStartMinutes = timeToMinutes(officeStartTime);
  const officeEndMinutes = timeToMinutes(officeEndTime);
  const gaps = [];

  if (assignments.length === 0) {
    return [{ start: officeStartTime, end: officeEndTime }];
  }

  // Convert to covered ranges
  const covered = assignments
    .filter(a => a.worker !== null)
    .map(a => ({
      start: a.startMinutes,
      end: a.endMinutes
    }))
    .sort((a, b) => a.start - b.start);

  if (covered.length === 0) {
    return [{ start: officeStartTime, end: officeEndTime }];
  }

  // Check for gap at start
  if (covered[0].start > officeStartMinutes) {
    gaps.push({
      start: officeStartTime,
      end: minutesToTime(covered[0].start)
    });
  }

  // Check for gaps between shifts
  for (let i = 0; i < covered.length - 1; i++) {
    if (covered[i + 1].start > covered[i].end) {
      gaps.push({
        start: minutesToTime(covered[i].end),
        end: minutesToTime(covered[i + 1].start)
      });
    }
  }

  // Check for gap at end
  if (covered[covered.length - 1].end < officeEndMinutes) {
    gaps.push({
      start: minutesToTime(covered[covered.length - 1].end),
      end: officeEndTime
    });
  }

  return gaps;
}

// Schedule one week
function scheduleWeek(workers, officeStartTime, officeEndTime, minShiftMinutes, maxShiftMinutes, targetHours, strategy) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentHours = {};
  const daySchedules = {};
  const allGaps = {};

  // Initialize hours
  workers.forEach(w => currentHours[w.id] = 0);

  const officeStartMinutes = timeToMinutes(officeStartTime);
  const officeEndMinutes = timeToMinutes(officeEndTime);

  // Schedule each day
  for (const day of days) {
    const shifts = createShiftPattern(officeStartMinutes, officeEndMinutes, minShiftMinutes, maxShiftMinutes, strategy);
    const assignments = assignWorkersToDay(workers, day, shifts, currentHours, targetHours);

    // Convert to schedule format
    const covered = [];
    for (const assignment of assignments) {
      if (assignment.worker) {
        covered.push({
          worker: assignment.worker,
          start: minutesToTime(assignment.startMinutes),
          end: minutesToTime(assignment.endMinutes),
          hours: assignment.hours
        });
      }
    }

    // Find all gaps
    const gaps = findCoverageGaps(assignments, officeStartTime, officeEndTime);

    daySchedules[day] = { assignments: covered, gaps };
    if (gaps.length > 0) {
      allGaps[day] = gaps;
    }
  }

  return { daySchedules, allGaps, currentHours };
}

// Build weekly schedule
function buildWeeklySchedule(daySchedules, workers) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const schedule = [];

  // Initialize all workers
  workers.forEach(worker => {
    schedule.push({
      workerId: worker.id,
      workerName: worker.name || 'Unnamed Worker',
      schedule: {},
      totalHours: 0
    });
  });

  // Fill in shifts
  days.forEach(day => {
    const daySchedule = daySchedules[day];
    if (daySchedule && daySchedule.assignments) {
      daySchedule.assignments.forEach(assignment => {
        const ws = schedule.find(s => s.workerId === assignment.worker.id);
        if (ws) {
          ws.schedule[day] = {
            start: assignment.start,
            end: assignment.end,
            hours: assignment.hours
          };
          ws.totalHours += assignment.hours;
        }
      });
    }
  });

  // Round hours
  schedule.forEach(ws => {
    ws.totalHours = Math.round(ws.totalHours * 100) / 100;
  });

  return schedule;
}

// Calculate statistics
function calculateStatistics(weeklySchedule, workers, targetHours, weeklyOfficeHours) {
  const scheduled = weeklySchedule.filter(ws => ws.totalHours > 0);
  const hours = scheduled.map(ws => ws.totalHours);

  return {
    totalWorkersScheduled: scheduled.length,
    totalWorkersAvailable: workers.length,
    avgHoursPerWorker: hours.length > 0 ? Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 100) / 100 : 0,
    minHours: hours.length > 0 ? Math.round(Math.min(...hours) * 100) / 100 : 0,
    maxHours: hours.length > 0 ? Math.round(Math.max(...hours) * 100) / 100 : 0,
    hoursDifference: hours.length > 0 ? Math.round((Math.max(...hours) - Math.min(...hours)) * 100) / 100 : 0,
    totalHoursScheduled: Math.round(hours.reduce((a, b) => a + b, 0) * 100) / 100,
    targetHoursPerWeek: Math.round(targetHours * 100) / 100,
    weeklyOfficeHours
  };
}

// Generate messages
function generateMessages(weeklySchedule, gaps, workers, statistics) {
  const warnings = [];
  const successMessages = [];
  const errors = [];

  // Check coverage gaps - CRITICAL
  const totalGaps = Object.keys(gaps).length;
  if (totalGaps > 0) {
    const gapDetails = Object.entries(gaps)
      .map(([day, periods]) => `${day}: ${periods.map(p => `${p.start}-${p.end}`).join(', ')}`)
      .join('; ');
    errors.push(
      `COVERAGE GAPS DETECTED: ${gapDetails}. All office hours must be covered.`
    );
  } else {
    successMessages.push('Full coverage achieved - all office hours covered.');
  }

  // Check if all workers scheduled - CRITICAL
  const workersWithAvailability = workers.filter(w =>
    Object.values(w.availability).some(day => day.available && day.start && day.end)
  );

  const scheduledIds = new Set(
    weeklySchedule.filter(ws => ws.totalHours > 0).map(ws => ws.workerId)
  );

  const unscheduled = workersWithAvailability.filter(w => !scheduledIds.has(w.id));

  if (unscheduled.length > 0) {
    errors.push(
      `WORKERS NOT SCHEDULED: ${unscheduled.map(w => w.name || 'Unnamed').join(', ')}. All workers must be scheduled.`
    );
  } else if (workersWithAvailability.length > 0) {
    successMessages.push(`All ${workersWithAvailability.length} workers successfully scheduled.`);
  }

  // Check hour balance
  if (statistics.hoursDifference <= 1) {
    successMessages.push('Excellent balance - hours within ±1 hour.');
  } else if (statistics.hoursDifference <= 2) {
    successMessages.push('Good balance - hours within ±2 hours.');
  } else if (statistics.hoursDifference > 3) {
    warnings.push(
      `Hour imbalance: ${statistics.hoursDifference.toFixed(1)} hours difference between workers.`
    );
  }

  return { warnings, successMessages, errors };
}

// Main function
export function generateSchedule(formData) {
  const {
    officeStartTime,
    officeEndTime,
    workers,
    minShiftLength,
    maxShiftLength,
    hoursPerWorkerPerWeek,
  } = formData;

  // Validation
  if (!officeStartTime || !officeEndTime) {
    return { success: false, errors: ['Office hours must be specified'], warnings: [] };
  }

  if (workers.length === 0) {
    return { success: false, errors: ['At least one worker is required'], warnings: [] };
  }

  // Calculate target hours
  const dailyHours = calculateHours(officeStartTime, officeEndTime);
  const weeklyOfficeHours = dailyHours * 5;
  const targetHours = hoursPerWorkerPerWeek
    ? parseFloat(hoursPerWorkerPerWeek)
    : weeklyOfficeHours / workers.length;

  const minShiftMinutes = (minShiftLength || 2) * 60;
  const maxShiftMinutes = (maxShiftLength || 8) * 60;

  // Generate 3 DIFFERENT schedules
  const strategies = [
    { name: 'long', title: 'Option 1: Longer Shifts', desc: 'Fewer workers per day with longer shifts (2 workers/day)' },
    { name: 'medium', title: 'Option 2: Balanced Shifts', desc: 'Balanced coverage with medium shifts (3 workers/day)' },
    { name: 'short', title: 'Option 3: Shorter Shifts', desc: 'More workers per day with shorter shifts (4 workers/day)' }
  ];

  const schedules = [];

  for (const strat of strategies) {
    const result = scheduleWeek(
      workers,
      officeStartTime,
      officeEndTime,
      minShiftMinutes,
      maxShiftMinutes,
      targetHours,
      strat.name
    );

    const weeklySchedule = buildWeeklySchedule(result.daySchedules, workers);
    const statistics = calculateStatistics(weeklySchedule, workers, targetHours, weeklyOfficeHours);
    const messages = generateMessages(weeklySchedule, result.allGaps, workers, statistics);

    schedules.push({
      name: strat.title,
      description: strat.desc,
      schedule: weeklySchedule,
      statistics,
      uncoveredPeriods: result.allGaps,
      warnings: messages.warnings,
      successMessages: messages.successMessages,
      errors: messages.errors
    });
  }

  return {
    success: true,
    schedules
  };
}
