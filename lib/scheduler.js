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

// Round minutes to nearest :00 or :30 boundary
function roundToHalfHour(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Round to nearest 0 or 30
  const roundedMins = mins < 15 ? 0 : mins < 45 ? 30 : 0;
  const roundedHours = mins >= 45 ? hours + 1 : hours;

  return roundedHours * 60 + roundedMins;
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

// Subtract break times from available time blocks
function subtractBreakTimes(startMinutes, endMinutes, breakTimes, day) {
  // Get applicable breaks for this day
  const applicableBreaks = breakTimes.filter(breakTime => {
    return breakTime.day === day.toLowerCase() || breakTime.day === 'all';
  });

  if (applicableBreaks.length === 0) {
    return [[startMinutes, endMinutes]];
  }

  // Convert break times to minutes
  const breaks = applicableBreaks.map(b => ({
    start: timeToMinutes(b.startTime),
    end: timeToMinutes(b.endTime)
  })).sort((a, b) => a.start - b.start);

  const blocks = [];
  let currentStart = startMinutes;

  for (const breakPeriod of breaks) {
    // If break is completely outside our range, skip it
    if (breakPeriod.end <= startMinutes || breakPeriod.start >= endMinutes) {
      continue;
    }

    // If there's time before the break, add that block
    if (currentStart < breakPeriod.start) {
      blocks.push([currentStart, Math.min(breakPeriod.start, endMinutes)]);
    }

    // Move past the break
    currentStart = Math.max(currentStart, breakPeriod.end);
  }

  // Add remaining time after all breaks
  if (currentStart < endMinutes) {
    blocks.push([currentStart, endMinutes]);
  }

  return blocks.length > 0 ? blocks : [[startMinutes, endMinutes]];
}

// Get business hours for a specific day from configuration
function getBusinessHoursForDay(config, day) {
  const dayKey = day.toLowerCase();
  const businessHours = config.businessHours[dayKey];

  if (!businessHours || !businessHours.isOpen) {
    return null;
  }

  return {
    startMinutes: timeToMinutes(businessHours.startTime),
    endMinutes: timeToMinutes(businessHours.endTime),
    startTime: businessHours.startTime,
    endTime: businessHours.endTime
  };
}

// Check if a shift overlaps with a priority slot
function shiftOverlapsPrioritySlot(shiftStart, shiftEnd, prioritySlot) {
  const slotStart = timeToMinutes(prioritySlot.startTime);
  const slotEnd = timeToMinutes(prioritySlot.endTime);

  // Check for any overlap
  return shiftStart < slotEnd && shiftEnd > slotStart;
}

// Apply priority slots to shift pattern (ensure minimum workers during priority periods)
function applyPrioritySlots(shifts, prioritySlots, day) {
  if (!prioritySlots || prioritySlots.length === 0) {
    return shifts;
  }

  // Get applicable priority slots for this day
  const applicableSlots = prioritySlots.filter(
    slot => slot.day === day.toLowerCase() || slot.day === 'all'
  );

  if (applicableSlots.length === 0) {
    return shifts;
  }

  // Mark shifts that overlap with priority slots
  const enhancedShifts = shifts.map(shift => {
    let minWorkers = 1;

    for (const slot of applicableSlots) {
      if (shiftOverlapsPrioritySlot(shift.startMinutes, shift.endMinutes, slot)) {
        minWorkers = Math.max(minWorkers, slot.minWorkers);
      }
    }

    return {
      ...shift,
      minWorkers,
      isPriority: minWorkers > 1
    };
  });

  return enhancedShifts;
}

// Validate overtime rules for a worker
function validateOvertimeRules(currentHours, overtimeRules, day, shiftHours) {
  if (!overtimeRules) {
    return { allowed: true, warnings: [] };
  }

  const warnings = [];
  const { maxHoursPerDay, maxHoursPerWeek, warnOnOvertime, allowOvertime } = overtimeRules;

  // Calculate current weekly hours
  const weeklyHours = Object.values(currentHours).reduce((sum, hours) => sum + hours, 0);

  // Check daily overtime
  if (maxHoursPerDay && shiftHours > maxHoursPerDay) {
    if (!allowOvertime) {
      return { allowed: false, warnings: [`Shift exceeds daily maximum of ${maxHoursPerDay} hours`] };
    }
    if (warnOnOvertime) {
      warnings.push(`Shift exceeds daily maximum of ${maxHoursPerDay} hours`);
    }
  }

  // Check weekly overtime
  if (maxHoursPerWeek && weeklyHours + shiftHours > maxHoursPerWeek) {
    if (!allowOvertime) {
      return { allowed: false, warnings: [`Would exceed weekly maximum of ${maxHoursPerWeek} hours`] };
    }
    if (warnOnOvertime) {
      warnings.push(`Would exceed weekly maximum of ${maxHoursPerWeek} hours`);
    }
  }

  return { allowed: true, warnings };
}

// Create shift pattern from configuration for a specific day
function createShiftPatternFromConfig(config, day) {
  // Get business hours for this day
  const businessHours = getBusinessHoursForDay(config, day);

  if (!businessHours) {
    // Day is closed
    return [];
  }

  // Subtract break times from business hours
  const timeBlocks = subtractBreakTimes(
    businessHours.startMinutes,
    businessHours.endMinutes,
    config.breakTimes || [],
    day
  );

  // Convert time blocks into shifts
  const shifts = [];
  const { minShiftLength, maxShiftLength, idealShiftLength } = config.shiftPreferences;
  const minShiftMinutes = minShiftLength * 60;
  const maxShiftMinutes = maxShiftLength * 60;
  const idealShiftMinutes = idealShiftLength * 60;

  for (const [blockStart, blockEnd] of timeBlocks) {
    const blockDuration = blockEnd - blockStart;

    // Skip blocks that are too short
    if (blockDuration < minShiftMinutes) {
      continue;
    }

    let currentTime = blockStart;

    while (currentTime < blockEnd) {
      const remainingMinutes = blockEnd - currentTime;

      let shiftLength;
      if (remainingMinutes <= maxShiftMinutes && remainingMinutes >= minShiftMinutes) {
        // Last shift in block - use all remaining time
        shiftLength = remainingMinutes;
      } else if (remainingMinutes < minShiftMinutes) {
        // Too little time left, skip
        break;
      } else {
        // Use ideal shift length, capped at max
        shiftLength = Math.min(idealShiftMinutes, maxShiftMinutes, remainingMinutes);
      }

      const shiftEnd = Math.min(currentTime + shiftLength, blockEnd);
      const roundedEnd = (shiftEnd === blockEnd) ? blockEnd : roundToHalfHour(shiftEnd);

      shifts.push({
        startMinutes: currentTime,
        endMinutes: roundedEnd
      });

      currentTime = roundedEnd;
    }
  }

  // Apply priority slots to shifts
  return applyPrioritySlots(shifts, config.prioritySlots || [], day);
}

// Create shift pattern to cover full day (legacy function for backward compatibility)
// IMPORTANT: All shifts must start/end at :00 or :30, and first shift MUST start at office opening time
function createShiftPattern(officeStartMinutes, officeEndMinutes, minShiftMinutes, maxShiftMinutes, strategy) {
  const totalMinutes = officeEndMinutes - officeStartMinutes;
  const shifts = [];

  // If user has specified custom shift constraints, use those
  // Check if minShiftMinutes and maxShiftMinutes are provided (not null)
  const hasCustomConstraints = minShiftMinutes !== null && maxShiftMinutes !== null;

  if (hasCustomConstraints) {
    // Create shifts based on user's min/max constraints
    // First shift MUST start at office opening time (no rounding)
    let currentTime = officeStartMinutes;

    while (currentTime < officeEndMinutes) {
      const remainingMinutes = officeEndMinutes - currentTime;

      // Try to create a shift within min/max bounds
      let shiftLength;

      if (remainingMinutes <= maxShiftMinutes) {
        // Last shift - use all remaining time if it's >= minShiftMinutes
        shiftLength = remainingMinutes >= minShiftMinutes ? remainingMinutes : minShiftMinutes;
      } else {
        // Use max shift length, or whatever fits
        shiftLength = Math.min(maxShiftMinutes, remainingMinutes);
      }

      const shiftEnd = Math.min(currentTime + shiftLength, officeEndMinutes);

      // Round shift end to :00 or :30 (but not if it's the office end time)
      const roundedEnd = (shiftEnd === officeEndMinutes) ? officeEndMinutes : roundToHalfHour(shiftEnd);

      shifts.push({
        startMinutes: currentTime,
        endMinutes: roundedEnd
      });

      // Next shift starts where this one ends (already rounded to :00 or :30)
      currentTime = roundedEnd;
    }
  } else {
    // Use default strategy-based approach
    // All shifts must align to :00 or :30 boundaries
    if (strategy === 'long') {
      // Strategy 1: Longer shifts (2 workers per day)
      const shiftLength = Math.floor(totalMinutes / 2);
      const midPoint = roundToHalfHour(officeStartMinutes + shiftLength);

      shifts.push(
        { startMinutes: officeStartMinutes, endMinutes: midPoint },
        { startMinutes: midPoint, endMinutes: officeEndMinutes }
      );
    } else if (strategy === 'medium') {
      // Strategy 2: Medium shifts (3 workers per day)
      const shiftLength = Math.floor(totalMinutes / 3);
      const point1 = roundToHalfHour(officeStartMinutes + shiftLength);
      const point2 = roundToHalfHour(officeStartMinutes + (shiftLength * 2));

      shifts.push(
        { startMinutes: officeStartMinutes, endMinutes: point1 },
        { startMinutes: point1, endMinutes: point2 },
        { startMinutes: point2, endMinutes: officeEndMinutes }
      );
    } else {
      // Strategy 3: Shorter shifts (4 workers per day)
      const shiftLength = Math.floor(totalMinutes / 4);
      const point1 = roundToHalfHour(officeStartMinutes + shiftLength);
      const point2 = roundToHalfHour(officeStartMinutes + (shiftLength * 2));
      const point3 = roundToHalfHour(officeStartMinutes + (shiftLength * 3));

      shifts.push(
        { startMinutes: officeStartMinutes, endMinutes: point1 },
        { startMinutes: point1, endMinutes: point2 },
        { startMinutes: point2, endMinutes: point3 },
        { startMinutes: point3, endMinutes: officeEndMinutes }
      );
    }
  }

  return shifts;
}

// Assign workers to shifts for a day
function assignWorkersToDay(workers, day, shifts, currentHours, targetHours, overtimeRules = null) {
  const assignments = [];
  const usedWorkers = new Set();

  // For each shift, find best available worker(s)
  for (const shift of shifts) {
    const shiftHours = (shift.endMinutes - shift.startMinutes) / 60;
    const minWorkers = shift.minWorkers || 1;
    const assignedToThisShift = [];

    // Try to assign the required number of workers
    for (let i = 0; i < minWorkers; i++) {
      let bestWorker = null;
      let bestScore = -Infinity;

      // Try all workers
      for (const worker of workers) {
        if (usedWorkers.has(worker.id)) continue;

        const workerAvail = getWorkerAvailability(worker, day);
        if (!canWorkerWorkShift(workerAvail, shift.startMinutes, shift.endMinutes)) {
          continue;
        }

        // Validate overtime rules if provided
        if (overtimeRules) {
          const validation = validateOvertimeRules(
            { [worker.id]: currentHours[worker.id] || 0 },
            overtimeRules,
            day,
            shiftHours
          );
          if (!validation.allowed) {
            continue;
          }
        }

        // Calculate score: prioritize workers who need more hours for better balance
        const currentWorkerHours = currentHours[worker.id] || 0;
        const hoursDeficit = targetHours - currentWorkerHours;
        const totalAvail = getTotalAvailableHours(worker);

        // Higher score = higher priority
        // Heavily favor workers further from target (10000x multiplier for tighter balance)
        // Use squared deficit to strongly prioritize catching up workers who are behind
        const score = (hoursDeficit * hoursDeficit * Math.sign(hoursDeficit)) * 10000 - totalAvail;

        if (score > bestScore) {
          bestScore = score;
          bestWorker = worker;
        }
      }

      if (bestWorker) {
        assignedToThisShift.push({
          worker: bestWorker,
          startMinutes: shift.startMinutes,
          endMinutes: shift.endMinutes,
          hours: shiftHours,
          isPriority: shift.isPriority || false
        });
        usedWorkers.add(bestWorker.id);
        currentHours[bestWorker.id] = (currentHours[bestWorker.id] || 0) + shiftHours;
      } else {
        // NO WORKER AVAILABLE - GAP!
        assignedToThisShift.push({
          worker: null,
          startMinutes: shift.startMinutes,
          endMinutes: shift.endMinutes,
          hours: shiftHours,
          isPriority: shift.isPriority || false
        });
      }
    }

    // Add all assignments for this shift
    assignments.push(...assignedToThisShift);
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

// Schedule one week using custom configuration
function scheduleWeekWithConfig(workers, config, targetHours) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentHours = {};
  const daySchedules = {};
  const allGaps = {};

  // Initialize hours
  workers.forEach(w => currentHours[w.id] = 0);

  // Schedule each day
  for (const day of days) {
    // Get business hours for this day
    const businessHours = getBusinessHoursForDay(config, day);

    if (!businessHours) {
      // Day is closed, skip
      continue;
    }

    // Create shift pattern for this day
    const shifts = createShiftPatternFromConfig(config, day);

    if (shifts.length === 0) {
      // No valid shifts (e.g., all time is break time)
      continue;
    }

    // Assign workers to shifts (with overtime rules)
    const assignments = assignWorkersToDay(
      workers,
      day,
      shifts,
      currentHours,
      targetHours,
      config.overtimeRules || null
    );

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
    const gaps = findCoverageGaps(assignments, businessHours.startTime, businessHours.endTime);

    daySchedules[day] = { assignments: covered, gaps };
    if (gaps.length > 0) {
      allGaps[day] = gaps;
    }
  }

  return { daySchedules, allGaps, currentHours };
}

// Build weekly schedule
function buildWeeklySchedule(daySchedules, workers, includeSaturday = false, includeSunday = false) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  if (includeSaturday) days.push('Saturday');
  if (includeSunday) days.push('Sunday');
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

  // Check hour balance (stricter thresholds for better fairness)
  if (statistics.hoursDifference <= 0.5) {
    successMessages.push('Perfect balance - hours within ±0.5 hours.');
  } else if (statistics.hoursDifference <= 1) {
    successMessages.push('Excellent balance - hours within ±1 hour.');
  } else if (statistics.hoursDifference <= 1.5) {
    successMessages.push('Good balance - hours within ±1.5 hours.');
  } else if (statistics.hoursDifference > 2) {
    warnings.push(
      `Hour imbalance: ${statistics.hoursDifference.toFixed(1)} hours difference between workers. Consider adjusting availability or constraints.`
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
    configuration,  // NEW: Custom configuration object
  } = formData;

  // Check if using custom configuration
  if (configuration) {
    return generateScheduleWithConfig(formData, configuration);
  }

  // Legacy validation
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

  // Only use custom constraints if both are provided (not empty/null)
  const minShiftMinutes = (minShiftLength !== "" && minShiftLength != null) ? minShiftLength * 60 : null;
  const maxShiftMinutes = (maxShiftLength !== "" && maxShiftLength != null) ? maxShiftLength * 60 : null;

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

// Generate schedule using custom configuration
function generateScheduleWithConfig(formData, configuration) {
  const { workers, hoursPerWorkerPerWeek } = formData;

  // Validation
  if (!configuration) {
    return { success: false, errors: ['Configuration is required'], warnings: [] };
  }

  if (workers.length === 0) {
    return { success: false, errors: ['At least one worker is required'], warnings: [] };
  }

  // Calculate weekly office hours from configuration
  let weeklyOfficeHours = 0;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    const businessHours = configuration.businessHours[day];
    if (businessHours && businessHours.isOpen) {
      const dailyHours = calculateHours(businessHours.startTime, businessHours.endTime);

      // Subtract break times
      const breakTimes = (configuration.breakTimes || []).filter(
        bt => bt.day === day || bt.day === 'all'
      );

      let breakHours = 0;
      for (const breakTime of breakTimes) {
        breakHours += calculateHours(breakTime.startTime, breakTime.endTime);
      }

      weeklyOfficeHours += Math.max(0, dailyHours - breakHours);
    }
  }

  // Calculate target hours
  const targetHours = hoursPerWorkerPerWeek
    ? parseFloat(hoursPerWorkerPerWeek)
    : weeklyOfficeHours / workers.length;

  // Generate single schedule using configuration
  const result = scheduleWeekWithConfig(workers, configuration, targetHours);

  // Determine which days to include
  const includeSaturday = configuration.businessHours.saturday?.isOpen || false;
  const includeSunday = configuration.businessHours.sunday?.isOpen || false;

  const weeklySchedule = buildWeeklySchedule(
    result.daySchedules,
    workers,
    includeSaturday,
    includeSunday
  );

  const statistics = calculateStatistics(weeklySchedule, workers, targetHours, weeklyOfficeHours);
  const messages = generateMessages(weeklySchedule, result.allGaps, workers, statistics);

  // Return single schedule (not multiple options)
  return {
    success: true,
    schedules: [{
      name: 'Custom Configuration',
      description: configuration.description || 'Schedule generated with custom configuration',
      schedule: weeklySchedule,
      statistics,
      uncoveredPeriods: result.allGaps,
      warnings: messages.warnings,
      successMessages: messages.successMessages,
      errors: messages.errors
    }]
  };
}
