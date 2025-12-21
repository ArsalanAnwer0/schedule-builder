"use client";
import Image from "next/image";

import { useState } from "react";

export default function Home() {
  // State for form data
  const [formData, setFormData] = useState({
    officeStartTime: "08:00",
    officeEndTime: "16:30",
    scheduleStartDate: "",
    scheduleEndDate: "",
    totalHoursPerWeek: "40",
    minShiftLength: 2,
    maxShiftLength: 8,
    workers: [],
  });

  // This function will run when inputs change

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData, // Keep all existing data
      [field]: value, // Update only the changed field
    });
  };
  // Function to add a new worker
  const addWorker = () => {
    if (formData.workers.length >= 10) {
      alert("Maximum 10 workers allowed");
      return;
    }

    const newWorker = {
      id: Date.now(), // Unique ID using timestamp
      name: "",
      expanded: true, // Start expanded so user can fill it out
      availability: {
        Monday: { available: true, start: "", end: "" },
        Tuesday: { available: true, start: "", end: "" },
        Wednesday: { available: true, start: "", end: "" },
        Thursday: { available: true, start: "", end: "" },
        Friday: { available: true, start: "", end: "" },
      },
    };

    setFormData({
      ...formData,
      workers: [...formData.workers, newWorker],
    });
  };

  // Function to remove a worker
  const removeWorker = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.filter((worker) => worker.id !== workerId),
    });
  };

  // Function to toggle worker expanded/collapsed
  const toggleWorkerExpanded = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId
          ? { ...worker, expanded: !worker.expanded }
          : worker
      ),
    });
  };

  // Function to update worker name
  const updateWorkerName = (workerId, name) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((worker) =>
        worker.id === workerId ? { ...worker, name: name } : worker
      ),
    });
  };

  // Function to toggle day availability
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

  // Function to update time for a specific day
  const updateWorkerTime = (workerId, day, timeType, value) => {
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
                  [timeType]: value,
                },
              },
            }
          : worker
      ),
    });
  };

  console.log("Current form data:", formData);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Office Schedule Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Create your semester schedule in minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            {/* Section 1: Office Hours */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1. Office Hours
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.officeStartTime}
                    onChange={(e) =>
                      handleInputChange("officeStartTime", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.officeEndTime}
                    onChange={(e) =>
                      handleInputChange("officeEndTime", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Schedule Period */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Schedule Period
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.scheduleStartDate}
                    onChange={(e) =>
                      handleInputChange("scheduleStartDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.scheduleEndDate}
                    onChange={(e) =>
                      handleInputChange("scheduleEndDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hours & Constraints */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                3. Hours & Shift Constraints
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Hours/Week
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.totalHoursPerWeek}
                    onChange={(e) =>
                      handleInputChange("totalHoursPerWeek", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Shift (hours)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.minShiftLength}
                    onChange={(e) =>
                      handleInputChange("minShiftLength", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Shift (hours)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                    value={formData.maxShiftLength}
                    onChange={(e) =>
                      handleInputChange("maxShiftLength", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Workers */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  4. Workers ({formData.workers.length}/10)
                </h2>
                  <button
                    type="button"
                    onClick={addWorker}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    + Add Worker
                  </button>
              </div>

              {/* Show message if no workers */}
              {formData.workers.length === 0 && (
                <p className="text-gray-500 italic">
                  Click "Add Worker" to add front desk workers and their
                  availability
                </p>
              )}

              {/* List of workers */}
              <div className="space-y-4">
                {formData.workers.map((worker, index) => (
                  <div
                    key={worker.id}
                    className="border-2 border-gray-300 focus:border-black rounded-lg p-4"
                  >
                    {/* Worker Header - Click to expand/collapse */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleWorkerExpanded(worker.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium">
                          {worker.expanded ? "▼" : "▶"}
                        </span>
                        <span className="font-medium">
                          Worker #{index + 1}: {worker.name || "(No name)"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWorker(worker.id);
                        }}
                        className="bg-white text-black border-2 border-black px-3 py-1 rounded-md hover:bg-gray-100 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Worker Details - Show only if expanded */}
                    {worker.expanded && (
                      <div className="mt-4 pl-7">
                        {/* Worker Name Input */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={worker.name}
                            onChange={(e) =>
                              updateWorkerName(worker.id, e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black rounded-md"
                            placeholder="Enter worker name"
                          />
                        </div>

                        {/* Availability */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            Availability
                          </p>

                          {/* Days of the week */}
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                          ].map((day) => (
                            <div
                              key={day}
                              className="mb-3 flex items-center gap-4"
                            >
                              {/* Day checkbox */}
                              <div className="flex items-center gap-2 w-32">
                                <input
                                  type="checkbox"
                                  checked={!worker.availability[day].available}
                                  onChange={() =>
                                    toggleDayAvailability(worker.id, day)
                                  }
                                  className="w-4 h-4"
                                />
                                <label className="text-sm font-medium">
                                  {day}
                                </label>
                              </div>

                              {/* Time inputs - only show if available */}
                              {worker.availability[day].available ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="time"
                                    value={worker.availability[day].start}
                                    onChange={(e) =>
                                      updateWorkerTime(
                                        worker.id,
                                        day,
                                        "start",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 border-2 border-gray-300 focus:border-black rounded-md text-sm"
                                  />
                                  <span className="text-sm text-gray-600">
                                    to
                                  </span>
                                  <input
                                    type="time"
                                    value={worker.availability[day].end}
                                    onChange={(e) =>
                                      updateWorkerTime(
                                        worker.id,
                                        day,
                                        "end",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-1 border-2 border-gray-300 focus:border-black rounded-md text-sm"
                                  />
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 italic">
                                  Not available
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log('=== FINAL FORM DATA ===');
                  console.log(JSON.stringify(formData, null, 2));
                  alert('Check the console to see your data!');
                }}
                className="bg-white text-black border-2 border-black px-6 py-3 rounded-md hover:bg-gray-100 font-medium transition-colors"
              >
                Preview Data (Console)
              </button>

              <button
                type="button"
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 font-medium transition-colors"
              >
                Generate Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
