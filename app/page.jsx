"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSchedule } from "../lib/scheduler";
import TimePicker from "./components/TimePicker";
// import { exportToCSV, downloadCSV } from "../lib/utils/export"; // Archived for later

// Predefined semester dates for US universities
const SEMESTER_PRESETS = {
  "Spring 2026": { start: "2026-01-12", end: "2026-05-08" },
  "Summer 2026": { start: "2026-06-01", end: "2026-08-07" },
  "Fall 2026": { start: "2026-08-24", end: "2026-12-18" },
  "Spring 2027": { start: "2027-01-11", end: "2027-05-07" },
  "Summer 2027": { start: "2027-06-01", end: "2027-08-06" },
  "Fall 2027": { start: "2027-08-23", end: "2027-12-17" },
};

// Convert 24-hour time to 12-hour format
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function Home() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Student management state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentFormData, setStudentFormData] = useState({ name: '', email: '' });
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');

  // Default form data
  const defaultFormData = {
    officeStartTime: "08:00",
    officeEndTime: "16:30",
    scheduleStartDate: "",
    scheduleEndDate: "",
    totalHoursPerWeek: "40",
    hoursPerWorkerPerWeek: "6",
    minShiftLength: "",
    maxShiftLength: "",
    workers: [],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [selectedScheduleOption, setSelectedScheduleOption] = useState(0); // 0, 1, or 2 for the 3 options
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setUser(data.user);
          loadStudents();
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [router]);

  // Load students
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Student management handlers
  const handleAddStudent = () => {
    setStudentFormData({ name: '', email: '' });
    setEditingStudent(null);
    setShowAddStudentModal(true);
    setStudentError('');
    setStudentSuccess('');
  };

  const handleEditStudent = (student) => {
    setStudentFormData({ name: student.name, email: student.email });
    setEditingStudent(student);
    setShowAddStudentModal(true);
    setStudentError('');
    setStudentSuccess('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    setStudentError('');
    setStudentSuccess('');

    try {
      const url = editingStudent
        ? `/api/students/${editingStudent.id}`
        : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        setStudentError(data.error || 'Failed to save student');
        return;
      }

      setStudentSuccess(editingStudent ? 'Student updated successfully' : 'Student added successfully');
      setShowAddStudentModal(false);
      loadStudents();
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setStudentSuccess('Student deleted successfully');
        loadStudents();
        setTimeout(() => setStudentSuccess(''), 3000);
      } else {
        const data = await res.json();
        setStudentError(data.error || 'Failed to delete student');
      }
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('scheduleBuilderData');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        // Merge saved data with defaults to ensure new fields are present
        const mergedData = { ...defaultFormData, ...savedData };
        // Ensure numeric fields are valid (allow empty strings for optional fields)
        if (mergedData.minShiftLength !== "" && isNaN(mergedData.minShiftLength)) {
          mergedData.minShiftLength = defaultFormData.minShiftLength;
        }
        if (mergedData.maxShiftLength !== "" && isNaN(mergedData.maxShiftLength)) {
          mergedData.maxShiftLength = defaultFormData.maxShiftLength;
        }
        setFormData(mergedData);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('scheduleBuilderData', JSON.stringify(formData));
    }
  }, [formData, isHydrated]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSemesterChange = (semester) => {
    setSelectedSemester(semester);
    if (semester && SEMESTER_PRESETS[semester]) {
      setFormData({
        ...formData,
        scheduleStartDate: SEMESTER_PRESETS[semester].start,
        scheduleEndDate: SEMESTER_PRESETS[semester].end,
      });
    }
  };

  const addWorker = () => {
    if (formData.workers.length >= 10) return;
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

    // Scroll to the new worker after it's rendered
    setTimeout(() => {
      const workerElement = document.querySelector(`[data-worker-id="${newWorker.id}"]`);
      if (workerElement) {
        workerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const removeWorker = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.filter((w) => w.id !== workerId),
    });
  };

  const toggleWorkerExpanded = (workerId) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((w) =>
        w.id === workerId ? { ...w, expanded: !w.expanded } : w
      ),
    });
  };

  const updateWorkerName = (workerId, name) => {
    setFormData({
      ...formData,
      workers: formData.workers.map((w) =>
        w.id === workerId ? { ...w, name } : w
      ),
    });
  };

  const toggleDayAvailability = (workerId, day) => {
    setValidationError(null); // Clear validation error when user makes changes
    setFormData({
      ...formData,
      workers: formData.workers.map((w) =>
        w.id === workerId
          ? {
              ...w,
              availability: {
                ...w.availability,
                [day]: {
                  ...w.availability[day],
                  available: !w.availability[day].available,
                },
              },
            }
          : w
      ),
    });
  };

  const updateWorkerTime = (workerId, day, timeType, value) => {
    setValidationError(null); // Clear validation error when user makes changes
    setFormData({
      ...formData,
      workers: formData.workers.map((w) =>
        w.id === workerId
          ? {
              ...w,
              availability: {
                ...w.availability,
                [day]: {
                  ...w.availability[day],
                  [timeType]: value,
                },
              },
            }
          : w
      ),
    });
  };

  const handleGenerateSchedule = () => {
    // Clear any previous validation errors
    setValidationError(null);

    // Validate workers have complete availability data
    const incompleteWorkers = [];

    formData.workers.forEach(worker => {
      const hasValidAvailability = Object.values(worker.availability).some(dayAvail => {
        // Check if day is marked as available AND has both start and end times
        return dayAvail.available && dayAvail.start && dayAvail.end;
      });

      // If worker has no valid availability at all, they're incomplete
      if (!hasValidAvailability) {
        incompleteWorkers.push(worker.name || 'Unnamed Worker');
      } else {
        // Check if any available days are missing times
        Object.entries(worker.availability).forEach(([day, dayAvail]) => {
          if (dayAvail.available && (!dayAvail.start || !dayAvail.end)) {
            if (!incompleteWorkers.includes(worker.name || 'Unnamed Worker')) {
              incompleteWorkers.push(worker.name || 'Unnamed Worker');
            }
          }
        });
      }
    });

    if (incompleteWorkers.length > 0) {
      setValidationError(
        `Please complete availability for: ${incompleteWorkers.join(', ')}. ` +
        `Make sure to either enter both start and end times for available days, or mark all days as unavailable.`
      );
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const result = generateSchedule(formData);
      setScheduleResult(result);
      setIsGenerating(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 500);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0f1b2a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#aab7b8" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f1b2a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Header with User Info and Logout */}
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "400", color: "#ffffff", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
              Schedule Builder
            </h1>
            <p style={{ fontSize: "1rem", color: "#aab7b8", lineHeight: "1.6" }}>
              Welcome back, {user?.name}. Manage your office schedules and students below.
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "#16191f",
              color: "#ffffff",
              border: "1px solid #414d5c",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#252d3d"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#16191f"}
          >
            Logout
          </button>
        </div>

        {/* Student Success/Error Messages */}
        {studentSuccess && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#0d1f17",
            border: "1px solid #1e4d2b",
            borderLeft: "4px solid #047857",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#10b981", margin: 0, fontSize: "0.875rem" }}>✓ {studentSuccess}</p>
          </div>
        )}

        {studentError && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#2d1517",
            border: "1px solid #5c2d30",
            borderLeft: "4px solid #dc2626",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#ff6b6b", margin: 0, fontSize: "0.875rem" }}>{studentError}</p>
          </div>
        )}

        {/* Student Management Section */}
        <div style={{ backgroundColor: "#16191f", border: "1px solid #30363d", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #30363d", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.5rem" }}>
                Students
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
                Manage your student roster and their information
              </p>
            </div>
            <button
              onClick={handleAddStudent}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#0972d3",
                color: "#ffffff",
                border: "1px solid #0972d3",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#0863bf";
                e.currentTarget.style.borderColor = "#0863bf";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#0972d3";
                e.currentTarget.style.borderColor = "#0972d3";
              }}
            >
              + Add Student
            </button>
          </div>

          <div style={{ padding: "2rem" }}>
            {loadingStudents ? (
              <p style={{ color: "#8b949e" }}>Loading students...</p>
            ) : students.length === 0 ? (
              <p style={{ color: "#8b949e" }}>No students yet. Add your first student to get started.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #30363d" }}>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: "1px solid #30363d" }}>
                        <td style={{ padding: "1rem", color: "#ffffff", fontSize: "0.875rem" }}>{student.name}</td>
                        <td style={{ padding: "1rem", color: "#c9d1d9", fontSize: "0.875rem" }}>{student.email}</td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <button
                            onClick={() => handleEditStudent(student)}
                            style={{
                              padding: "0.375rem 0.875rem",
                              fontSize: "0.875rem",
                              backgroundColor: "#0d1117",
                              border: "1px solid #30363d",
                              borderRadius: "4px",
                              color: "#58a6ff",
                              cursor: "pointer",
                              marginRight: "0.5rem",
                              transition: "all 0.15s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#252d3d"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0d1117"}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            style={{
                              padding: "0.375rem 0.875rem",
                              fontSize: "0.875rem",
                              backgroundColor: "#2d1517",
                              border: "1px solid #5c2d30",
                              borderRadius: "4px",
                              color: "#ff6b6b",
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#3d2527"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2d1517"}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Configuration Section */}
        <div style={{ backgroundColor: "#16191f", border: "1px solid #30363d", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #30363d" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.5rem" }}>
              Schedule configuration
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
              Configure your office hours, schedule period, and shift constraints
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            {/* Office Hours */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.375rem" }}>
                  Office hours
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
                  Define the operating hours for your office (Monday - Friday)
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", maxWidth: "540px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    Start time
                  </label>
                  <input
                    type="time"
                    value={formData.officeStartTime}
                    onChange={(e) => handleInputChange("officeStartTime", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    End time
                  </label>
                  <input
                    type="time"
                    value={formData.officeEndTime}
                    onChange={(e) => handleInputChange("officeEndTime", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #21262d", margin: "2.5rem 0" }}></div>

            {/* Schedule Period */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.375rem" }}>
                  Schedule period
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
                  Specify the date range for this schedule (e.g., semester dates)
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                  Semester preset
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: "340px",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "#ffffff",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Custom dates</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Summer 2026">Summer 2026</option>
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2027">Spring 2027</option>
                  <option value="Summer 2027">Summer 2027</option>
                  <option value="Fall 2027">Fall 2027</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", maxWidth: "540px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    Start date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduleStartDate}
                    onChange={(e) => {
                      handleInputChange("scheduleStartDate", e.target.value);
                      setSelectedSemester("");
                    }}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    End date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduleEndDate}
                    onChange={(e) => {
                      handleInputChange("scheduleEndDate", e.target.value);
                      setSelectedSemester("");
                    }}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #21262d", margin: "2.5rem 0" }}></div>

            {/* Hours and Shift Constraints */}
            <div>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.375rem" }}>
                  Hours and shift constraints
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
                  Set weekly hour targets and optional shift length limits. Leave shift constraints empty to use automatic scheduling strategies.
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem", maxWidth: "340px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                  Hours per worker per week
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWorkerPerWeek}
                  onChange={(e) => handleInputChange("hoursPerWorkerPerWeek", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "#ffffff",
                    outline: "none"
                  }}
                  min="2"
                  max="20"
                  step="0.5"
                />
                <p style={{ fontSize: "0.8125rem", color: "#6e7681", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                  Target hours each worker should get
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem", marginTop: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    Minimum shift (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.minShiftLength}
                    onChange={(e) => handleInputChange("minShiftLength", e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="Auto"
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none"
                    }}
                    min="1"
                    max="8"
                    step="0.5"
                  />
                  <p style={{ fontSize: "0.8125rem", color: "#6e7681", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                    Optional: Shortest shift duration (leave empty for auto)
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#c9d1d9", marginBottom: "0.625rem" }}>
                    Maximum shift (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.maxShiftLength}
                    onChange={(e) => handleInputChange("maxShiftLength", e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="Auto"
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none"
                    }}
                    min="1"
                    max="8"
                    step="0.5"
                  />
                  <p style={{ fontSize: "0.8125rem", color: "#6e7681", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                    Optional: Longest shift duration (leave empty for auto)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workers Section */}
        <div style={{ backgroundColor: "#16191f", border: "1px solid #414d5c", borderRadius: "8px", marginBottom: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #414d5c" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "#ffffff", margin: 0 }}>
                Workers
              </h2>
              <button
                type="button"
                onClick={addWorker}
                disabled={formData.workers.length >= 10}
                aria-label={`Add worker (${formData.workers.length}/10)`}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: formData.workers.length >= 10 ? "#1a1f2e" : "#0972d3",
                  color: formData.workers.length >= 10 ? "#4b5563" : "#ffffff",
                  border: "1px solid",
                  borderColor: formData.workers.length >= 10 ? "#2d3748" : "#0972d3",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: formData.workers.length >= 10 ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseOver={(e) => {
                  if (formData.workers.length < 10) {
                    e.currentTarget.style.backgroundColor = "#0863bf";
                    e.currentTarget.style.borderColor = "#0863bf";
                  }
                }}
                onMouseOut={(e) => {
                  if (formData.workers.length < 10) {
                    e.currentTarget.style.backgroundColor = "#0972d3";
                    e.currentTarget.style.borderColor = "#0972d3";
                  }
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", lineHeight: "1" }}>+</span>
                  Add worker
                </span>
              </button>
            </div>
          </div>
          <div style={{ padding: "1.5rem" }}>
            {formData.workers.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                No workers added yet. Click "Add worker" to begin.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                {formData.workers.map((worker, index) => (
                  <div key={worker.id} data-worker-id={worker.id} style={{ border: "1px solid #2d3748", borderRadius: "6px", overflow: "hidden", backgroundColor: "#1a1f2e" }}>

                    {/* Worker Header */}
                    <div
                      onClick={() => toggleWorkerExpanded(worker.id)}
                      style={{
                        padding: "1rem 1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        backgroundColor: "#1f2937",
                        transition: "background-color 0.15s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#252d3d"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1f2937"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          {worker.expanded ? "▼" : "▶"}
                        </span>
                        <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff" }}>
                          Worker {index + 1}: {worker.name || "(No name)"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWorker(worker.id);
                        }}
                        style={{
                          padding: "0.375rem 0.875rem",
                          fontSize: "0.875rem",
                          border: "1px solid #414d5c",
                          borderRadius: "4px",
                          backgroundColor: "#16191f",
                          color: "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = "#252d3d";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = "#16191f";
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Worker Details */}
                    {worker.expanded && (
                      <div style={{ padding: "1.5rem" }}>

                        {/* Name Input */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", marginBottom: "0.5rem" }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={worker.name}
                            onChange={(e) => updateWorkerName(worker.id, e.target.value)}
                            placeholder="Enter worker name"
                            style={{
                              width: "100%",
                              maxWidth: "400px",
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#0d1117",
                              border: "1px solid #414d5c",
                              borderRadius: "4px",
                              fontSize: "0.875rem",
                              color: "#ffffff",
                              outline: "none"
                            }}
                          />
                        </div>

                        <div>
                          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", marginBottom: "0.75rem" }}>
                            Weekly availability
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <div
                                key={day}
                                style={{
                                  padding: "0.875rem",
                                  border: "1px solid #2d3748",
                                  borderRadius: "4px",
                                  backgroundColor: "#16191f",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "1rem",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "160px" }}>
                                  <label
                                    htmlFor={`${worker.id}-${day}`}
                                    style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", cursor: "pointer", userSelect: "none", minWidth: "80px" }}
                                  >
                                    {day}
                                  </label>
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "48px",
                                      height: "24px",
                                      display: "flex",
                                      alignItems: "center",
                                      cursor: "pointer"
                                    }}
                                    onClick={() => toggleDayAvailability(worker.id, day)}
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${worker.id}-${day}`}
                                      checked={!worker.availability[day].available}
                                      onChange={() => toggleDayAvailability(worker.id, day)}
                                      style={{
                                        position: "absolute",
                                        opacity: 0,
                                        width: "100%",
                                        height: "100%",
                                        cursor: "pointer",
                                      }}
                                    />
                                    <div style={{
                                      width: "48px",
                                      height: "24px",
                                      borderRadius: "12px",
                                      backgroundColor: !worker.availability[day].available ? "#dc2626" : "#047857",
                                      border: "2px solid",
                                      borderColor: !worker.availability[day].available ? "#b91c1c" : "#059669",
                                      transition: "all 0.3s ease",
                                      position: "relative",
                                      boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)"
                                    }}>
                                      <div style={{
                                        position: "absolute",
                                        top: "2px",
                                        left: !worker.availability[day].available ? "26px" : "2px",
                                        width: "16px",
                                        height: "16px",
                                        borderRadius: "50%",
                                        backgroundColor: "#ffffff",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)"
                                      }} />
                                    </div>
                                  </div>
                                  <span style={{
                                    fontSize: "0.8125rem",
                                    color: !worker.availability[day].available ? "#ff6b6b" : "#10b981",
                                    fontWeight: "500",
                                    minWidth: "100px"
                                  }}>
                                    {!worker.availability[day].available ? "Not available" : "Available"}
                                  </span>
                                </div>

                                {worker.availability[day].available && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1" }}>
                                    <TimePicker
                                      value={worker.availability[day].start}
                                      onChange={(value) => updateWorkerTime(worker.id, day, "start", value)}
                                      placeholder="Start time"
                                      positionAbove={day === "Friday"}
                                    />
                                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>to</span>
                                    <TimePicker
                                      value={worker.availability[day].end}
                                      onChange={(value) => updateWorkerTime(worker.id, day, "end", value)}
                                      placeholder="End time"
                                      positionAbove={day === "Friday"}
                                      minTime={worker.availability[day].start}
                                    />
                                  </div>
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
          </div>
        </div>

        {/* Generate Button */}
        {/* Validation Error */}
        {validationError && (
          <div style={{
            padding: "1rem 1.25rem",
            backgroundColor: "#2d1517",
            border: "1px solid #5c2d30",
            borderRadius: "6px",
            marginTop: "1.5rem",
            marginBottom: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.25rem", color: "#ff6b6b", lineHeight: "1" }}>⚠</span>
              <p style={{ color: "#ff9999", fontSize: "0.875rem", margin: 0, lineHeight: "1.6" }}>
                {validationError}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: validationError ? "1rem" : "1.5rem", marginBottom: "2rem" }}>
          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating || formData.workers.length === 0}
            aria-label="Generate work schedule based on provided information"
            aria-busy={isGenerating}
            style={{
              padding: "0.625rem 1.5rem",
              backgroundColor: isGenerating || formData.workers.length === 0 ? "#1a1f2e" : "#ec7211",
              color: isGenerating || formData.workers.length === 0 ? "#4b5563" : "#ffffff",
              border: "1px solid",
              borderColor: isGenerating || formData.workers.length === 0 ? "#2d3748" : "#ec7211",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: isGenerating || formData.workers.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.01em",
            }}
            onMouseOver={(e) => {
              if (!isGenerating && formData.workers.length > 0) {
                e.currentTarget.style.backgroundColor = "#d66b14";
                e.currentTarget.style.borderColor = "#d66b14";
              }
            }}
            onMouseOut={(e) => {
              if (!isGenerating && formData.workers.length > 0) {
                e.currentTarget.style.backgroundColor = "#ec7211";
                e.currentTarget.style.borderColor = "#ec7211";
              }
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isGenerating && (
                <span style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ffffff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }} />
              )}
              {isGenerating ? "Generating schedule..." : "Generate schedule"}
            </span>
          </button>
        </div>

        {/* Results */}
        {scheduleResult && scheduleResult.success && scheduleResult.schedules && (
          <div id="results">
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "400", color: "#ffffff", marginBottom: "0.5rem" }}>
                Generated Schedules
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#8b949e", lineHeight: "1.6" }}>
                Three different scheduling strategies have been generated. Review all options below to choose the best fit.
              </p>
            </div>

            {/* Display all 3 schedules */}
            {scheduleResult.schedules.map((currentSchedule, scheduleIndex) => (
              <div key={scheduleIndex} style={{ marginBottom: "3rem" }}>
                {/* Schedule Header */}
                <div style={{
                  backgroundColor: "#16191f",
                  border: "2px solid #0972d3",
                  borderRadius: "8px 8px 0 0",
                  padding: "1.5rem",
                  borderBottom: "1px solid #30363d",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "#ffffff", margin: 0, marginBottom: "0.5rem" }}>
                      {currentSchedule.name}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#8b949e", margin: 0, lineHeight: "1.5" }}>
                      {currentSchedule.description}
                    </p>
                  </div>
                  {/* Export CSV button - Archived for later
                  <button
                    onClick={() => {
                      const csv = exportToCSV(currentSchedule.schedule, currentSchedule.name);
                      const filename = `schedule_${scheduleIndex + 1}_${currentSchedule.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
                      downloadCSV(csv, filename);
                    }}
                    aria-label={`Export ${currentSchedule.name} to CSV`}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "#047857",
                      color: "#ffffff",
                      border: "1px solid #047857",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.01em"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                      e.currentTarget.style.borderColor = "#059669";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#047857";
                      e.currentTarget.style.borderColor = "#047857";
                    }}
                  >
                    Export CSV
                  </button>
                  */}
                </div>

                <div style={{
                  backgroundColor: "#16191f",
                  border: "2px solid #0972d3",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "1.5rem"
                }}>
                  <>
                  {/* Errors */}
                  {currentSchedule.errors && currentSchedule.errors.length > 0 && (
                    <div style={{
                      padding: "1rem 1.5rem",
                      backgroundColor: "#2d1517",
                      border: "1px solid #5c2d30",
                      borderLeft: "4px solid #dc2626",
                      borderRadius: "6px",
                      marginBottom: "1rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "0.125rem"
                        }}>
                          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "0.875rem" }}>×</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500", color: "#ff6b6b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                            Errors
                          </div>
                          <ul style={{ paddingLeft: "0", color: "#ff9999", fontSize: "0.875rem", margin: 0, lineHeight: "1.6", listStyle: "none" }}>
                            {currentSchedule.errors.map((error, i) => (
                              <li key={i} style={{ marginBottom: i < currentSchedule.errors.length - 1 ? "0.5rem" : 0 }}>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Messages */}
                  {currentSchedule.successMessages && currentSchedule.successMessages.length > 0 && (
                    <div style={{
                      padding: "1rem 1.5rem",
                      backgroundColor: "#0d1f17",
                      border: "1px solid #1e4d2b",
                      borderLeft: "4px solid #047857",
                      borderRadius: "6px",
                      marginBottom: "1rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#047857",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "0.125rem"
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500", color: "#10b981", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                            Success
                          </div>
                          <ul style={{ paddingLeft: "0", color: "#6ee7b7", fontSize: "0.875rem", margin: 0, lineHeight: "1.6", listStyle: "none" }}>
                            {currentSchedule.successMessages.map((message, i) => (
                              <li key={i} style={{ marginBottom: i < currentSchedule.successMessages.length - 1 ? "0.25rem" : 0 }}>
                                {message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {currentSchedule.warnings && currentSchedule.warnings.length > 0 && (
                    <div style={{
                      padding: "1rem 1.5rem",
                      backgroundColor: "#1f1b13",
                      border: "1px solid #4d3d1e",
                      borderLeft: "4px solid #f59e0b",
                      borderRadius: "6px",
                      marginBottom: "1rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#f59e0b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "0.125rem"
                        }}>
                          <span style={{ color: "#000", fontWeight: "bold", fontSize: "0.875rem" }}>!</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "500", color: "#fbbf24", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                            Warnings
                          </div>
                          <ul style={{ paddingLeft: "0", color: "#fcd34d", fontSize: "0.875rem", margin: 0, lineHeight: "1.6", listStyle: "none" }}>
                            {currentSchedule.warnings.map((warning, i) => (
                              <li key={i} style={{ marginBottom: i < currentSchedule.warnings.length - 1 ? "0.5rem" : 0 }}>
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generated Successfully Message */}
                  {(!currentSchedule.successMessages || currentSchedule.successMessages.length === 0) && (
                    <div style={{
                      padding: "1rem 1.5rem",
                      backgroundColor: "#0d1f17",
                      border: "1px solid #1e4d2b",
                      borderLeft: "4px solid #047857",
                      borderRadius: "6px",
                      marginBottom: "1.5rem"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#047857",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p style={{ fontWeight: "500", color: "#10b981", margin: 0, fontSize: "0.875rem" }}>
                          Schedule generated successfully
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div style={{ backgroundColor: "#16191f", border: "1px solid #414d5c", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "#ffffff", marginBottom: "1.25rem" }}>Statistics</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                      <div style={{ padding: "1rem", backgroundColor: "#1f2937", borderRadius: "4px", border: "1px solid #2d3748" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Workers Scheduled</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "#ffffff", margin: 0 }}>
                          {currentSchedule.statistics.totalWorkersScheduled} / {currentSchedule.statistics.totalWorkersAvailable}
                        </p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "#1f2937", borderRadius: "4px", border: "1px solid #2d3748" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Total Hours</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "#ffffff", margin: 0 }}>{currentSchedule.statistics.totalHoursScheduled}h</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "#1f2937", borderRadius: "4px", border: "1px solid #2d3748" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Avg Hours/Worker</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "#ffffff", margin: 0 }}>{currentSchedule.statistics.avgHoursPerWorker}h</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "#1f2937", borderRadius: "4px", border: "1px solid #2d3748" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Hour Balance</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", margin: 0, color: currentSchedule.statistics.hoursDifference <= 1 ? "#4ade80" : "#ff9900" }}>
                          ±{currentSchedule.statistics.hoursDifference}h
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Table */}
                  <div style={{ backgroundColor: "#16191f", border: "1px solid #414d5c", borderRadius: "8px", overflow: "hidden", marginBottom: "1.5rem" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #414d5c" }}>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "#ffffff", margin: 0 }}>Weekly schedule</h2>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ backgroundColor: "#1f2937" }}>
                          <tr>
                            <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #2d3748" }}>Worker</th>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <th key={day} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #2d3748" }}>
                                {day}
                              </th>
                            ))}
                            <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #2d3748" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSchedule.schedule.map((worker, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #2d3748", transition: "background-color 0.15s" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1a1f2e"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          >
                            <td style={{ padding: "1rem", fontWeight: "500", color: "#ffffff", fontSize: "0.875rem" }}>{worker.workerName}</td>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <td key={day} style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                {worker.schedule[day] ? (
                                  Array.isArray(worker.schedule[day]) ? (
                                    // Multiple shifts
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                      {worker.schedule[day].map((shift, idx) => (
                                        <div key={idx}>
                                          <div style={{ fontWeight: "400", color: "#ffffff" }}>
                                            {convertTo12Hour(shift.start)} - {convertTo12Hour(shift.end)}
                                          </div>
                                          <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
                                            {shift.hours}h
                                          </div>
                                        </div>
                                      ))}
                                      <div style={{ fontSize: "0.75rem", color: "#047857", marginTop: "0.125rem", fontWeight: "500" }}>
                                        Total: {worker.schedule[day].reduce((sum, s) => sum + s.hours, 0)}h
                                      </div>
                                    </div>
                                  ) : (
                                    // Single shift
                                    <div>
                                      <div style={{ fontWeight: "400", color: "#ffffff" }}>
                                        {convertTo12Hour(worker.schedule[day].start)} - {convertTo12Hour(worker.schedule[day].end)}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
                                        {worker.schedule[day].hours}h
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <span style={{ color: "#4b5563" }}>—</span>
                                )}
                              </td>
                            ))}
                            <td style={{ padding: "1rem", fontWeight: "500", color: "#ffffff", fontSize: "0.875rem" }}>{worker.totalHours}h</td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Coverage Gaps */}
                  {currentSchedule.uncoveredPeriods && Object.keys(currentSchedule.uncoveredPeriods).length > 0 && (
                    <div style={{ backgroundColor: "#16191f", border: "1px solid #414d5c", borderRadius: "8px", padding: "1.5rem" }}>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "#ff6b6b", marginBottom: "1rem" }}>
                        ⚠ Coverage gaps
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {Object.entries(currentSchedule.uncoveredPeriods).map(([day, periods]) => (
                          <div key={day} style={{ padding: "1rem", backgroundColor: "#2d1517", border: "1px solid #5c2d30", borderRadius: "4px" }}>
                            <p style={{ fontWeight: "500", color: "#ff6b6b", marginBottom: "0.5rem", fontSize: "0.875rem" }}>{day}</p>
                            <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#ff9999", margin: 0 }}>
                              {periods.map((period, i) => (
                                <li key={i}>
                                  {convertTo12Hour(period.start)} - {convertTo12Hour(period.end)} (no coverage)
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Student Modal */}
        {showAddStudentModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}>
            <div style={{
              backgroundColor: "#16191f",
              border: "1px solid #30363d",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%"
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "#ffffff", marginBottom: "1.5rem" }}>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>

              <form onSubmit={handleSubmitStudent}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#c9d1d9",
                    marginBottom: "0.625rem"
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#c9d1d9",
                    marginBottom: "0.625rem"
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "#ffffff",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "#0d1117",
                      color: "#ffffff",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#252d3d"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0d1117"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "#0972d3",
                      color: "#ffffff",
                      border: "1px solid #0972d3",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#0863bf";
                      e.currentTarget.style.borderColor = "#0863bf";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#0972d3";
                      e.currentTarget.style.borderColor = "#0972d3";
                    }}
                  >
                    {editingStudent ? 'Update' : 'Add'} Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}