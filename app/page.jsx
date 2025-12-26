"use client";
import { useState, useEffect } from "react";
import { generateSchedule } from "../lib/scheduler";

export default function Home() {
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const [formData, setFormData] = useState({
    officeStartTime: "08:00",
    officeEndTime: "16:30",
    scheduleStartDate: "",
    scheduleEndDate: "",
    semester: "",
    totalHoursPerWeek: 40,
    minShiftLength: 2,
    maxShiftLength: 8,
    workers: [],
  });
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const semesterPresets = {
    fall2025: { name: "Fall 2025", startDate: "2025-08-25", endDate: "2025-12-13" },
    spring2026: { name: "Spring 2026", startDate: "2026-01-12", endDate: "2026-05-08" },
    summer2026: { name: "Summer 2026", startDate: "2026-06-01", endDate: "2026-07-31" },
    fall2026: { name: "Fall 2026", startDate: "2026-08-24", endDate: "2026-12-12" },
    spring2027: { name: "Spring 2027", startDate: "2027-01-11", endDate: "2027-05-07" },
  };

  const handleSemesterChange = (semesterKey) => {
    if (semesterKey && semesterPresets[semesterKey]) {
      const preset = semesterPresets[semesterKey];
      setFormData({
        ...formData,
        semester: semesterKey,
        scheduleStartDate: preset.startDate,
        scheduleEndDate: preset.endDate
      });
    } else {
      setFormData({ ...formData, semester: "" });
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('scheduleBuilderData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Use a flag to avoid setting state during render
        Promise.resolve().then(() => {
          setFormData(parsedData);
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleBuilderData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field, value) => {
    let processedValue = value;
    if (field === 'totalHoursPerWeek' || field === 'minShiftLength' || field === 'maxShiftLength') {
      processedValue = value === '' ? 0 : Number(value);
    }
    setFormData({ ...formData, [field]: processedValue });
  };

  const addWorker = () => {
    if (formData.workers.length >= 10) {
      alert("Maximum 10 workers allowed");
      return;
    }
    const newWorker = {
      id: Date.now(),
      name: "",
      expanded: true,
      availability: {
        Monday: { available: true, start: "", end: "" },
        Tuesday: { available: true, start: "", end: "" },
        Wednesday: { available: true, start: "", end: "" },
        Thursday: { available: true, start: "", end: "" },
        Friday: { available: true, start: "", end: "" },
      },
    };
    setFormData({ ...formData, workers: [...formData.workers, newWorker] });
  };

  const removeWorker = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.filter((worker) => worker.id !== workerId),
    });
  };

  const toggleWorkerExpanded = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId ? { ...worker, expanded: !worker.expanded } : worker
      ),
    });
  };

  const updateWorkerName = (workerId, name) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId ? { ...worker, name: name } : worker
      ),
    });
  };

  const toggleDayAvailability = (workerId, day) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId
          ? {
              ...worker,
              availability: {
                ...worker.availability,
                [day]: {
                  ...worker.availability[day],
                  available: !worker.availability[day].available,
                },
              },
            }
          : worker
      ),
    });
  };

  const updateWorkerTime = (workerId, day, timeType, value) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId
          ? {
              ...worker,
              availability: {
                ...worker.availability,
                [day]: { ...worker.availability[day], [timeType]: value },
              },
            }
          : worker
      ),
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      const resetData = {
        officeStartTime: "08:00",
        officeEndTime: "16:30",
        scheduleStartDate: "",
        scheduleEndDate: "",
        semester: "",
        totalHoursPerWeek: 40,
        minShiftLength: 2,
        maxShiftLength: 8,
        workers: [],
      };
      setFormData(resetData);
      setGeneratedSchedule(null);
      setValidationErrors([]);
      localStorage.removeItem('scheduleBuilderData');
    }
  };

  const validateForm = () => {
    const errors = [];
    if (formData.officeStartTime >= formData.officeEndTime) {
      errors.push("Office start time must be before end time");
    }
    if (formData.scheduleStartDate && formData.scheduleEndDate) {
      if (formData.scheduleStartDate >= formData.scheduleEndDate) {
        errors.push("Schedule start date must be before end date");
      }
    } else {
      errors.push("Please enter both start and end dates");
    }
    if (formData.minShiftLength <= 0) errors.push("Minimum shift length must be greater than 0");
    if (formData.maxShiftLength <= 0) errors.push("Maximum shift length must be greater than 0");
    if (formData.minShiftLength > formData.maxShiftLength) {
      errors.push("Minimum shift length cannot be greater than maximum");
    }
    if (formData.totalHoursPerWeek <= 0) errors.push("Total hours per week must be greater than 0");
    if (formData.workers.length === 0) errors.push("Please add at least one worker");

    formData.workers.forEach((worker, index) => {
      if (!worker.name.trim()) errors.push(`Worker #${index + 1} needs a name`);
      const hasAvailability = Object.values(worker.availability).some(
        (avail) => avail.available && avail.start && avail.end
      );
      if (!hasAvailability) {
        errors.push(`Worker "${worker.name || '#' + (index + 1)}" has no available days set`);
      }
      Object.entries(worker.availability).forEach(([day, avail]) => {
        if (avail.available) {
          if (!avail.start || !avail.end) {
            errors.push(`Worker "${worker.name || '#' + (index + 1)}" - ${day}: Set both start and end times`);
          } else if (avail.start >= avail.end) {
            errors.push(`Worker "${worker.name || '#' + (index + 1)}" - ${day}: Start must be before end`);
          }
        }
      });
    });
    return errors;
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--seamist)' }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--slate)' }}>
            Office Schedule Builder
          </h1>
          <p className="text-lg" style={{ color: 'var(--slate-light)' }}>
            Create schedules in minutes
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="font-semibold text-red-800 mb-3">Please fix these errors:</p>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-700 text-sm">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          
          {/* Office Hours */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--slate)' }}>
              Office Hours
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  className="w-full"
                  value={formData.officeStartTime}
                  onChange={(e) => handleInputChange("officeStartTime", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  End Time
                </label>
                <input
                  type="time"
                  className="w-full"
                  value={formData.officeEndTime}
                  onChange={(e) => handleInputChange("officeEndTime", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Schedule Period */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--slate)' }}>
              Schedule Period
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                Quick Select Semester
              </label>
              <select
                className="w-full"
                value={formData.semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
              >
                <option value="">Custom Dates</option>
                {Object.entries(semesterPresets).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full"
                  value={formData.scheduleStartDate}
                  onChange={(e) => {
                    handleInputChange("scheduleStartDate", e.target.value);
                    if (formData.semester) setFormData({ ...formData, semester: "", scheduleStartDate: e.target.value });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full"
                  value={formData.scheduleEndDate}
                  onChange={(e) => {
                    handleInputChange("scheduleEndDate", e.target.value);
                    if (formData.semester) setFormData({ ...formData, semester: "", scheduleEndDate: e.target.value });
                  }}
                />
              </div>
            </div>
          </section>

          {/* Shift Constraints */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--slate)' }}>
              Shift Constraints
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  Hours/Week
                </label>
                <input
                  type="number"
                  className="w-full"
                  value={formData.totalHoursPerWeek}
                  onChange={(e) => handleInputChange("totalHoursPerWeek", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  Min Shift (hrs)
                </label>
                <input
                  type="number"
                  className="w-full"
                  value={formData.minShiftLength}
                  onChange={(e) => handleInputChange("minShiftLength", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--slate-light)' }}>
                  Max Shift (hrs)
                </label>
                <input
                  type="number"
                  className="w-full"
                  value={formData.maxShiftLength}
                  onChange={(e) => handleInputChange("maxShiftLength", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Workers */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--slate)' }}>
                Workers <span className="text-base font-normal" style={{ color: 'var(--slate-light)' }}>({formData.workers.length}/10)</span>
              </h2>
              <button
                type="button"
                onClick={addWorker}
                className="px-6 py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                style={{ background: 'var(--sage)', fontSize: '15px' }}
              >
                + Add Worker
              </button>
            </div>

            {formData.workers.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p style={{ color: 'var(--slate-light)' }}>
                  No workers yet. Click &quot;Add Worker&quot; to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {formData.workers.map((worker, index) => (
                  <div key={worker.id} className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    {/* Worker Header */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer"
                      style={{ background: 'var(--sage-light)' }}
                      onClick={() => toggleWorkerExpanded(worker.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ background: 'var(--sage)', fontSize: '15px' }}>
                          {index + 1}
                        </span>
                        <span className="font-semibold text-lg" style={{ color: 'var(--slate)' }}>
                          {worker.name || `Worker #${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeWorker(worker.id);
                          }}
                          className="px-4 py-2 font-medium text-red-600 hover:bg-red-50 rounded-lg border-2 border-red-200 transition-all"
                          style={{ fontSize: '14px' }}
                        >
                          Remove
                        </button>
                        <span className="text-gray-400 text-lg font-bold">{worker.expanded ? "▼" : "▶"}</span>
                      </div>
                    </div>

                    {/* Worker Content */}
                    {worker.expanded && (
                      <div className="p-6 bg-white">
                        <div className="mb-6">
                          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--slate)' }}>
                            Worker Name
                          </label>
                          <input
                            type="text"
                            value={worker.name}
                            onChange={(e) => updateWorkerName(worker.id, e.target.value)}
                            className="w-full"
                            placeholder="Enter name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--slate)' }}>
                            Weekly Availability
                          </label>
                          <div className="space-y-3">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <div
                                key={day}
                                className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                                style={{
                                  background: worker.availability[day].available ? 'var(--seamist)' : '#FAFAFA',
                                  borderColor: worker.availability[day].available ? 'var(--sage)' : '#E5E7EB'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={worker.availability[day].available}
                                  onChange={() => toggleDayAvailability(worker.id, day)}
                                />
                                <span className="w-28 font-semibold" style={{ color: worker.availability[day].available ? 'var(--slate)' : 'var(--slate-light)', fontSize: '14px' }}>
                                  {day}
                                </span>
                                {worker.availability[day].available ? (
                                  <div className="flex items-center gap-3 flex-1">
                                    <input
                                      type="time"
                                      value={worker.availability[day].start}
                                      onChange={(e) => updateWorkerTime(worker.id, day, "start", e.target.value)}
                                      className="flex-1"
                                    />
                                    <span className="font-medium" style={{ color: 'var(--slate-light)', fontSize: '14px' }}>to</span>
                                    <input
                                      type="time"
                                      value={worker.availability[day].end}
                                      onChange={(e) => updateWorkerTime(worker.id, day, "end", e.target.value)}
                                      className="flex-1"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm italic" style={{ color: 'var(--slate-light)' }}>Not available</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-8 mt-4">
            <button
              type="button"
              onClick={clearAllData}
              className="px-7 py-3.5 font-semibold rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              style={{ fontSize: '15px' }}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => {
                const errors = validateForm();
                if (errors.length > 0) {
                  setValidationErrors(errors);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                setValidationErrors([]);
                const result = generateSchedule(formData);
                setGeneratedSchedule(result);
                setTimeout(() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
              }}
              className="px-8 py-3.5 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              style={{ background: 'var(--teal)', fontSize: '15px' }}
            >
              Generate Schedule
            </button>
          </div>
        </div>

        {/* Generated Schedule */}
        {generatedSchedule && (
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--slate)' }}>
              Your Schedule
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--sage-light)' }}>
                    <th className="px-4 py-3 text-left font-semibold rounded-tl-lg" style={{ color: 'var(--slate)' }}>Name</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--slate)' }}>Mon</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--slate)' }}>Tue</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--slate)' }}>Wed</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--slate)' }}>Thu</th>
                    <th className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--slate)' }}>Fri</th>
                    <th className="px-4 py-3 text-center font-semibold rounded-tr-lg" style={{ color: 'var(--slate)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.workers.map((worker) => {
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                    const totalHours = generatedSchedule.workerHours[worker.id] || 0;
                    return (
                      <tr key={worker.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium" style={{ color: 'var(--slate)' }}>{worker.name}</td>
                        {days.map(day => {
                          const shift = generatedSchedule.schedule[day].find(s => s.workerId === worker.id);
                          return (
                            <td key={day} className="px-4 py-4 text-center">
                              {shift ? (
                                <div>
                                  <div className="font-medium" style={{ color: 'var(--slate)' }}>
                                    {formatTime12Hour(shift.startTime)}
                                  </div>
                                  <div className="text-xs" style={{ color: 'var(--slate-light)' }}>to</div>
                                  <div className="font-medium" style={{ color: 'var(--slate)' }}>
                                    {formatTime12Hour(shift.endTime)}
                                  </div>
                                  <div className="text-xs mt-1 font-semibold" style={{ color: 'var(--teal)' }}>
                                    ({shift.hours}h)
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--slate-light)' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-4 text-center">
                          <span className="text-lg font-bold" style={{ color: 'var(--teal)' }}>
                            {totalHours}h
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warnings */}
            {generatedSchedule.warnings && generatedSchedule.warnings.length > 0 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="font-semibold text-yellow-800 mb-2">Warnings</p>
                <ul className="space-y-1">
                  {generatedSchedule.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setGeneratedSchedule(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                style={{ color: 'var(--slate)' }}
              >
                Create New Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}