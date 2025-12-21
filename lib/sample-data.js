// Sample data for schedule builder application

export const scheduleInput = {
    // Office Information
    officeHours: {
        days: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
        startTime: '08:00',
        endTime: '16:30'
    },
    schedulePeriod: {
        startDate: '2025-01-12',
        endDate: '2025-05-06'
    },
    totalHoursPerWeek: 40,

    shiftConstraints: {
        minShiftLength: 2,
        maxShiftLength: 8,
        maxHoursBalance: 1
    },

    workers: [
        {
            name: 'Arsalan',
            availability: {
                Monday: null, 
                Tuesday: { start: '08:00', end: '12:00'},
                Wednesday: null,
                Thursday: { start: '11:00', end: '16:30'},
                Friday: null
            }
        },
        {
            name: 'Sara',
            availability: {
                Monday: { start: '08:00', end: '16:30'},
                Tuesday: null, 
                Wednesday: { start: '08:00', end: '16:30'},
                Thursday: null,
                Friday: null
            }
        }
    ]
};

export const scheduleOutput = {
    weeklySchedule: [
        {
            workerName: 'Arsalan',
            schedule: {
                Monday: null,
                Tuesday: { start: '08:00', end: '12:00', hours: 4 },
                Wednesday: null,
                Thursday: { start: '11:00', end: '16:30', hours: 5.5 },
                Friday: null
            },
            totalHours: 9.5
        }
    ]
};
