"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateSchedule } from "../../lib/scheduler";
import TimePicker from "../components/TimePicker";
import NotificationBell from "../components/NotificationBell";
import ScheduleHistoryModal from "./components/ScheduleHistoryModal";
import { exportToCSV, downloadCSV } from "../../lib/utils/export";
import AvailabilityGrid from "../components/AvailabilityGrid";
import SaveTemplateModal from "./components/SaveTemplateModal";
import TemplateLibraryModal from "./components/TemplateLibraryModal";
import ConflictWarningModal from "./components/ConflictWarningModal";
import ConfigurationWizard from "./components/ConfigurationWizard";
import ConfigurationLibrary from "./components/ConfigurationLibrary";
import "./admin.css";

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
  const [studentFormData, setStudentFormData] = useState({ name: '', email: '', secondaryEmail: '' });
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showInviteAdminModal, setShowInviteAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', secondaryEmail: '' });
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

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
    configurationId: null,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [selectedScheduleOption, setSelectedScheduleOption] = useState(0); // 0, 1, or 2 for the 3 options
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [savedScheduleIds, setSavedScheduleIds] = useState([]); // Store schedule IDs after saving to DB
  const [publishingScheduleId, setPublishingScheduleId] = useState(null); // Track which schedule is being published
  const [editRequests, setEditRequests] = useState([]); // Pending edit requests
  const [processingRequestId, setProcessingRequestId] = useState(null); // Track which request is being processed
  const [passwordResetRequests, setPasswordResetRequests] = useState([]); // Pending password reset requests
  const [loadingPasswordResets, setLoadingPasswordResets] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDangerous: false
  });

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Template modal states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState('');

  // Schedule history modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Conflict modal state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingPublishScheduleId, setPendingPublishScheduleId] = useState(null);

  // Configuration modal states
  const [showConfigWizard, setShowConfigWizard] = useState(false);
  const [showConfigLibrary, setShowConfigLibrary] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [configSuccess, setConfigSuccess] = useState('');

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setUser(data.user);
          loadStudents();
          loadEditRequests();
          loadPasswordResetRequests();
          loadAdmins();
          loadConfigurations();
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

  // Load students with availability
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/students/availability');
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

  // Load edit requests
  const loadEditRequests = async () => {
    try {
      const res = await fetch('/api/availability/edit-requests');
      const data = await res.json();
      if (res.ok && data.requests) {
        setEditRequests(data.requests.filter(req => req.status === 'pending'));
      }
    } catch (err) {
      console.error('Failed to load edit requests:', err);
    }
  };

  // Load password reset requests
  const loadPasswordResetRequests = async () => {
    setLoadingPasswordResets(true);
    try {
      const res = await fetch('/api/password-reset-requests');
      const data = await res.json();
      if (res.ok && data.requests) {
        setPasswordResetRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to load password reset requests:', err);
    } finally {
      setLoadingPasswordResets(false);
    }
  };

  // Load admins
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch('/api/auth/admins');
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Load configurations
  const loadConfigurations = async () => {
    try {
      const res = await fetch('/api/schedules/configurations');
      const data = await res.json();
      if (res.ok) {
        setConfigurations(data.configurations || []);
        // Auto-select default configuration if exists
        const defaultConfig = data.configurations?.find(c => c.isDefault);
        if (defaultConfig) {
          setSelectedConfigId(defaultConfig._id);
        }
      }
    } catch (err) {
      console.error('Failed to load configurations:', err);
    }
  };

  // Configuration handlers
  const handleSaveConfiguration = async (config) => {
    try {
      const method = editingConfig ? 'PUT' : 'POST';
      const url = editingConfig
        ? `/api/schedules/configurations/${editingConfig._id}`
        : '/api/schedules/configurations';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      setConfigSuccess(editingConfig ? 'Configuration updated successfully!' : 'Configuration created successfully!');
      setShowConfigWizard(false);
      setEditingConfig(null);
      await loadConfigurations();

      // Auto-clear success message after 3 seconds
      setTimeout(() => setConfigSuccess(''), 3000);
    } catch (error) {
      throw error; // Re-throw so the wizard can handle it
    }
  };

  const handleSelectConfig = (config) => {
    setSelectedConfigId(config._id);
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setShowConfigWizard(true);
  };

  const handleDeleteConfig = async (configId) => {
    await loadConfigurations();
  };

  const handleCreateNewConfig = () => {
    setEditingConfig(null);
    setShowConfigWizard(true);
  };

  // Admin management handlers
  const handleInviteAdmin = () => {
    setAdminFormData({ name: '', email: '' });
    setShowInviteAdminModal(true);
    setAdminError('');
    setAdminSuccess('');
  };

  const handleSubmitAdminInvite = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');
    setSubmittingAdmin(true);

    try {
      const res = await fetch('/api/auth/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        setAdminError(data.error || 'Failed to send invitation');
        setSubmittingAdmin(false);
        return;
      }

      setAdminSuccess(data.message);
      setShowInviteAdminModal(false);
      setAdminFormData({ name: '', email: '', secondaryEmail: '' });
      loadAdmins();
      setTimeout(() => setAdminSuccess(''), 5000);
    } catch (err) {
      setAdminError('Something went wrong. Please try again.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  // Helper function to show custom confirmation modal
  const showConfirm = (title, message, onConfirm, isDangerous = false) => {
    return new Promise((resolve) => {
      setConfirmModal({
        show: true,
        title,
        message,
        onConfirm: () => {
          resolve(true);
          onConfirm();
          setConfirmModal(prev => ({ ...prev, show: false }));
        },
        onCancel: () => {
          resolve(false);
          setConfirmModal(prev => ({ ...prev, show: false }));
        },
        confirmText: isDangerous ? 'Delete' : 'Confirm',
        cancelText: 'Cancel',
        isDangerous
      });
    });
  };

  const handleRemoveAdmin = async (adminId) => {
    setConfirmModal({
      show: true,
      title: 'Remove Admin',
      message: 'Are you sure you want to remove this admin? They will lose access immediately.',
      isDangerous: true,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setAdminError('');
        setAdminSuccess('');

        try {
          const res = await fetch('/api/auth/remove-admin', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId }),
          });

          const data = await res.json();

          if (!res.ok) {
            setAdminError(data.error || 'Failed to remove admin');
            return;
          }

          setAdminSuccess(data.message);
          loadAdmins();
          setTimeout(() => setAdminSuccess(''), 5000);
        } catch (err) {
          setAdminError('Something went wrong. Please try again.');
        }
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Student management handlers
  const handleAddStudent = () => {
    setStudentFormData({ name: '', email: '', secondaryEmail: '' });
    setEditingStudent(null);
    setShowAddStudentModal(true);
    setStudentError('');
    setStudentSuccess('');
  };

  const handleEditStudent = (student) => {
    setStudentFormData({ name: student.name, email: student.email, secondaryEmail: student.secondaryEmail || '' });
    setEditingStudent(student);
    setShowAddStudentModal(true);
    setStudentError('');
    setStudentSuccess('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    setStudentError('');
    setStudentSuccess('');
    setSubmittingStudent(true);

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
        setSubmittingStudent(false);
        return;
      }

      // Use custom message from API if available (includes set-password link)
      const successMessage = data.message || (editingStudent ? 'Student updated successfully' : 'Student added successfully');
      setStudentSuccess(successMessage);
      setShowAddStudentModal(false);
      setStudentFormData({ name: '', email: '', secondaryEmail: '' });
      loadStudents();
      setTimeout(() => setStudentSuccess(''), 8000); // Longer timeout for the set-password message
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    setConfirmModal({
      show: true,
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      isDangerous: true,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
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
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleRequestSingleAvailability = async (studentId) => {
    setStudentError('');
    setStudentSuccess('');

    try {
      const res = await fetch('/api/availability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: [studentId] }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStudentError(data.error || 'Failed to send availability request');
        return;
      }

      setStudentSuccess(data.message);
      setTimeout(() => setStudentSuccess(''), 5000);
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    }
  };

  const handleRequestAllAvailability = async () => {
    if (students.length === 0) {
      setStudentError('No students available');
      return;
    }

    setStudentError('');
    setStudentSuccess('');

    try {
      const allStudentIds = students.map(s => s.id);
      const res = await fetch('/api/availability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: allStudentIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStudentError(data.error || 'Failed to send availability requests');
        return;
      }

      setStudentSuccess(data.message);
      setTimeout(() => setStudentSuccess(''), 5000);
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    }
  };

  const handleResetSingleAvailability = async (studentId) => {
    setConfirmModal({
      show: true,
      title: 'Reset Availability',
      message: 'Are you sure you want to reset this student\'s availability? This will delete their submitted availability and lock their access. You must request availability again for them to resubmit.',
      isDangerous: true,
      confirmText: 'Reset',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setStudentError('');
        setStudentSuccess('');

        try {
          console.log('Resetting availability for student:', studentId);
          const res = await fetch('/api/availability/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId }),
          });

          const data = await res.json();
          console.log('Reset response:', { status: res.status, data });

          if (!res.ok) {
            console.error('Reset failed:', data);
            setStudentError(data.error || 'Failed to reset availability');
            return;
          }

          setStudentSuccess(data.message);
          setTimeout(() => setStudentSuccess(''), 5000);

          // Refresh the students list to update the UI
          await fetchStudents();
        } catch (err) {
          console.error('Reset availability exception:', err);
          setStudentError('Failed to reset availability. Please try again.');
        }
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const handleResetAllAvailability = async () => {
    if (students.length === 0) {
      setStudentError('No students available');
      return;
    }

    setConfirmModal({
      show: true,
      title: 'Reset All Availability',
      message: `Are you sure you want to reset availability for all ${students.length} student(s)? This will delete all submitted availability and lock their access. You must request availability again for them to resubmit.`,
      isDangerous: true,
      confirmText: 'Reset All',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
        setStudentError('');
        setStudentSuccess('');

        try {
          const allStudentIds = students.map(s => s.id);
          console.log('Resetting availability for all students:', allStudentIds);
          const res = await fetch('/api/availability/reset-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentIds: allStudentIds }),
          });

          const data = await res.json();
          console.log('Reset all response:', { status: res.status, data });

          if (!res.ok) {
            console.error('Reset all failed:', data);
            setStudentError(data.error || 'Failed to reset availability');
            return;
          }

          setStudentSuccess(data.message);
          setTimeout(() => setStudentSuccess(''), 5000);

          // Refresh the students list to update the UI
          await fetchStudents();
        } catch (err) {
          console.error('Reset all availability exception:', err);
          setStudentError('Something went wrong. Please try again.');
        }
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
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
        // Failed to load saved data from localStorage - not critical
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

  // Removed manual worker management functions - workers are now students with submitted availability

  // Import centralized time conversion utility
  const { convertTo24Hour } = require('../../lib/utils/timeConversion');

  // Helper function to add 30 minutes to a time slot
  const addThirtyMinutes = (time12h) => {
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Add 30 minutes
    minutes += 30;
    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }

    // Handle 12-hour rollover and AM/PM transition
    let newPeriod = period;

    // If we went from 11:XX to 12:XX in AM, switch to PM
    if (period === 'AM' && hours === 12 && minutes > 0) {
      newPeriod = 'PM';
      hours = 12;
    }
    // If we went past 12 in PM (13+), wrap around but stay in PM
    else if (hours > 12) {
      hours -= 12;
    }
    // If exactly 12:00, keep the period as is

    return `${hours}:${String(minutes).padStart(2, '0')} ${newPeriod}`;
  };

  const handleGenerateSchedule = () => {
    // Clear any previous validation errors
    setValidationError(null);

    // Check if we have students with submitted availability
    const studentsWithAvailability = students.filter(s => s.hasSubmitted);

    if (studentsWithAvailability.length === 0) {
      setValidationError(
        'No students have submitted their availability yet. Please request availability from students first.'
      );
      return;
    }

    // Convert student availability to the format expected by the scheduler
    const workers = studentsWithAvailability.map(student => {
      const availability = {};
      const studentAvail = student.availability.availability;

      // Convert the student's submitted availability to the scheduler format
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        if (studentAvail[day] && studentAvail[day].length > 0) {
          // Student has selected time slots for this day (e.g., ["8:00 AM", "8:30 AM", "9:00 AM"])
          // We need to find the earliest and latest times to create a range
          const timeSlots = studentAvail[day];

          // Find the earliest (first) and latest (last) time slots
          const sortedSlots = [...timeSlots].sort((a, b) => {
            // Convert to 24-hour for sorting
            const timeA = convertTo24Hour(a);
            const timeB = convertTo24Hour(b);
            return timeA.localeCompare(timeB);
          });

          const startTime12h = sortedSlots[0]; // Earliest time in 12-hour format
          const lastSlot12h = sortedSlots[sortedSlots.length - 1]; // Latest time in 12-hour format

          // Add 30 minutes to the last slot to get the end time
          const endTime12h = addThirtyMinutes(lastSlot12h);

          // Convert to 24-hour format for the scheduler
          const startTime24h = convertTo24Hour(startTime12h);
          const endTime24h = convertTo24Hour(endTime12h);

          availability[day] = {
            available: true,
            start: startTime24h,
            end: endTime24h
          };
        } else {
          availability[day] = { available: false, start: '', end: '' };
        }
      });

      return {
        id: student.id,
        name: student.name,
        availability: availability
      };
    });

    // Get selected configuration if any
    const selectedConfig = selectedConfigId
      ? configurations.find(c => c._id === selectedConfigId)
      : null;

    // Update formData with workers from students and configuration
    const scheduleData = {
      ...formData,
      workers: workers,
      configuration: selectedConfig // Pass full configuration object to scheduler
    };

    setIsGenerating(true);
    setTimeout(async () => {
      const result = generateSchedule(scheduleData);
      setScheduleResult(result);

      // Save schedules to database
      if (result.success && result.schedules) {
        try {
          const saveResponse = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schedules: result.schedules,
              scheduleConfig: {
                scheduleStartDate: formData.scheduleStartDate,
                scheduleEndDate: formData.scheduleEndDate,
                officeStartTime: formData.officeStartTime,
                officeEndTime: formData.officeEndTime,
                configSnapshot: selectedConfig || null // Store full config snapshot
              },
              configurationId: selectedConfigId || null
            }),
          });

          const saveData = await saveResponse.json();

          if (saveData.success) {
            // Store the schedule IDs so we can publish them later
            setSavedScheduleIds(saveData.schedules.map(s => s.id));
          }
        } catch (error) {
          // Schedule generation succeeded but saving failed - user can still see results
        }
      }

      setIsGenerating(false);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 500);
  };

  const handleScheduleReverted = () => {
    // Refresh the page to show the reverted schedule
    setStudentSuccess('Schedule reverted successfully!');
    // Clear schedule results to show fresh state
    setScheduleResult(null);
    setSavedScheduleIds([]);
    // Reload students to show updated data
    loadStudentsWithAvailability();
  };

  const handlePublishSchedule = async (scheduleIndex, force = false) => {
    const scheduleId = savedScheduleIds[scheduleIndex];

    if (!scheduleId) {
      setStudentError('Schedule not saved yet. Please regenerate the schedule.');
      return;
    }

    setPublishingScheduleId(scheduleId);

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })  // NEW: Send force flag
      });

      const data = await response.json();

      // NEW: Handle 409 conflict response
      if (response.status === 409 && data.requiresConfirmation) {
        setPendingPublishScheduleId(scheduleId);
        setConflictData(data);
        setShowConflictModal(true);
        setPublishingScheduleId(null);
        return;
      }

      // Existing error handling
      if (!response.ok) {
        setStudentError(data.error || 'Failed to publish schedule');
        return;
      }

      // Existing success handling
      setStudentSuccess(data.message);
      setTimeout(() => setStudentSuccess(''), 5000);

      // Reload students to refresh the UI
      await loadStudents();
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    } finally {
      setPublishingScheduleId(null);
    }
  };

  const handleSaveTemplate = (template) => {
    setShowSaveTemplateModal(false);
    setTemplateSuccess(`Template "${template.name}" saved successfully!`);
    setTimeout(() => setTemplateSuccess(''), 5000);
  };

  const handleSelectTemplate = (config) => {
    setFormData(prev => ({
      ...prev,
      officeStartTime: config.officeStartTime,
      officeEndTime: config.officeEndTime,
      totalHoursPerWeek: config.totalHoursPerWeek,
      hoursPerWorkerPerWeek: config.hoursPerWorkerPerWeek,
      minShiftLength: config.minShiftLength || '',
      maxShiftLength: config.maxShiftLength || ''
    }));
    setShowTemplateLibrary(false);
    setTemplateSuccess('Template loaded! Adjust dates and generate schedule.');
    setTimeout(() => setTemplateSuccess(''), 5000);
  };

  const handleConflictCancel = () => {
    setShowConflictModal(false);
    setConflictData(null);
    setPendingPublishScheduleId(null);
  };

  const handleConflictConfirm = async () => {
    setShowConflictModal(false);
    // Get index of pending schedule
    const scheduleIndex = savedScheduleIds.indexOf(pendingPublishScheduleId);
    // Retry publish with force=true
    await handlePublishSchedule(scheduleIndex, true);
    // Clean up
    setConflictData(null);
    setPendingPublishScheduleId(null);
  };

  const handleProcessEditRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    setStudentError('');
    setStudentSuccess('');

    try {
      const response = await fetch(`/api/availability/edit-requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }) // 'approve' or 'reject'
      });

      const data = await response.json();

      if (!response.ok) {
        setStudentError(data.error || `Failed to ${action} request`);
        return;
      }

      setStudentSuccess(data.message);
      setTimeout(() => setStudentSuccess(''), 5000);

      // Reload both students and edit requests
      await loadStudents();
      await loadEditRequests();
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle password reset approval
  const handleApprovePasswordReset = async (requestId) => {
    setProcessingRequestId(requestId);
    setStudentError('');
    setStudentSuccess('');

    try {
      const response = await fetch(`/api/password-reset-requests/${requestId}/approve`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        setStudentError(data.error || 'Failed to approve password reset');
        return;
      }

      setStudentSuccess('Password reset request approved successfully');
      setTimeout(() => setStudentSuccess(''), 5000);

      // Reload password reset requests
      await loadPasswordResetRequests();
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle password reset denial
  const handleDenyPasswordReset = async (requestId) => {
    setProcessingRequestId(requestId);
    setStudentError('');
    setStudentSuccess('');

    try {
      const response = await fetch(`/api/password-reset-requests/${requestId}/deny`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        setStudentError(data.error || 'Failed to deny password reset');
        return;
      }

      setStudentSuccess('Password reset request denied');
      setTimeout(() => setStudentSuccess(''), 5000);

      // Reload password reset requests
      await loadPasswordResetRequests();
    } catch (err) {
      setStudentError('Something went wrong. Please try again.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(0, 0, 0, 0.5)", fontWeight: "300" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ minHeight: "100vh", backgroundColor: "#ffffff", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Header with User Info and Profile Dropdown */}
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", marginBottom: "0.5rem", letterSpacing: "-0.02em", fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Schedule Builder
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.5)", lineHeight: "1.6", fontWeight: "300" }}>
              Welcome back, {user?.name}. Manage your office schedules and students below.
            </p>
          </div>

          {/* Notification Bell and Profile Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <NotificationBell />

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{
                  padding: "0.625rem 1rem",
                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                  color: "rgba(0, 0, 0, 0.87)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "#484f58";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.87)"
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)" }}>{user?.name}</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.45)" }}>
                  {user?.adminType === 'primary' ? 'Primary Admin' : 'Secondary Admin'}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: "0.25rem" }}>
                <path d="M4 6L8 10L12 6" stroke="rgba(0, 0, 0, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <>
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40
                  }}
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  right: 0,
                  minWidth: "240px",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(10px)",
                  zIndex: 50,
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", marginBottom: "0.25rem" }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.45)" }}>
                      {user?.email}
                    </div>
                    {user?.organizationName && (
                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.45)", marginTop: "0.25rem" }}>
                        {user.organizationName}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        window.location.href = '/profile';
                      }}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.75rem",
                        backgroundColor: "transparent",
                        color: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: "400",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 14C3 11.7909 5.23858 10 8 10C10.7614 10 13 11.7909 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.75rem",
                        backgroundColor: "transparent",
                        color: "#f87171",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        fontWeight: "400",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Student Success/Error Messages */}
        {studentSuccess && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderLeft: "4px solid #10b981",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#047857", margin: 0, fontSize: "0.875rem" }}>✓ {studentSuccess}</p>
          </div>
        )}

        {studentError && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderLeft: "4px solid #dc2626",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{studentError}</p>
          </div>
        )}

        {templateSuccess && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderLeft: "4px solid #8b5cf6",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#6b21a8", margin: 0, fontSize: "0.875rem" }}>✓ {templateSuccess}</p>
          </div>
        )}

        {/* Admin Success/Error Messages */}
        {adminSuccess && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderLeft: "4px solid #10b981",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#047857", margin: 0, fontSize: "0.875rem" }}>✓ {adminSuccess}</p>
          </div>
        )}

        {adminError && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderLeft: "4px solid #dc2626",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{adminError}</p>
          </div>
        )}

        {/* Admin Management Section - Only show for primary admin */}
        {(!user?.adminType || user?.adminType === 'primary') && (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
                  Admin Team
                </h2>
                <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                  Manage administrators for {user?.organizationName || 'your organization'} (max 3 total)
                </p>
              </div>
              {user?.adminType === 'primary' && (
                <button
                  onClick={handleInviteAdmin}
                  disabled={admins.length >= 3}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: "transparent",
                    color: admins.length >= 3 ? "rgba(0, 0, 0, 0.3)" : "#14b8a6",
                    border: "1px solid",
                    borderColor: admins.length >= 3 ? "rgba(0, 0, 0, 0.1)" : "rgba(20, 184, 166, 0.4)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: admins.length >= 3 ? "not-allowed" : "pointer",
                    opacity: admins.length >= 3 ? 0.6 : 1,
                    transition: "all 0.15s ease"
                  }}
                  onMouseOver={(e) => {
                    if (admins.length < 3) {
                      e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.borderColor = "#14b8a6";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (admins.length < 3) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                    }
                  }}
                >
                  + Invite Admin
                </button>
              )}
            </div>

            <div style={{ padding: "2rem" }}>
              {loadingAdmins ? (
                <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>Loading admins...</p>
              ) : (
                <div className="table-container" style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                        <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                        <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                        <th style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                          <td style={{ padding: "1rem", color: "rgba(0, 0, 0, 0.87)", fontSize: "0.875rem" }}>
                            {admin.name}
                            {admin.id === user?._id && <span style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>(You)</span>}
                          </td>
                          <td style={{ padding: "1rem", color: "rgba(0, 0, 0, 0.6)", fontSize: "0.875rem" }}>{admin.email}</td>
                          <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                            <span style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor: admin.adminType === 'primary' ? "#1e3a5f" : "#1e293b",
                              color: admin.adminType === 'primary' ? "#60a5fa" : "#94a3b8"
                            }}>
                              {admin.adminType === 'primary' ? 'Primary Admin' : 'Secondary Admin'}
                            </span>
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right" }}>
                            {user?.adminType === 'primary' && admin.adminType === 'secondary' && admin.id !== user?._id && (
                              <button
                                onClick={() => handleRemoveAdmin(admin.id)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  backgroundColor: "transparent",
                                  color: "#dc2626",
                                  border: "1px solid rgba(220, 38, 38, 0.3)",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                                  e.currentTarget.style.borderColor = "#dc2626";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student Management Section */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
                Students
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                Manage your student roster and their information
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={handleRequestAllAvailability}
                disabled={students.length === 0}
                style={{
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "transparent",
                  color: students.length === 0 ? "rgba(0, 0, 0, 0.3)" : "#10b981",
                  border: "1px solid",
                  borderColor: students.length === 0 ? "rgba(0, 0, 0, 0.1)" : "rgba(16, 185, 129, 0.4)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: students.length === 0 ? "not-allowed" : "pointer",
                  opacity: students.length === 0 ? 0.6 : 1,
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  if (students.length > 0) {
                    e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                    e.currentTarget.style.borderColor = "#10b981";
                  }
                }}
                onMouseOut={(e) => {
                  if (students.length > 0) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                  }
                }}
              >
                Request All Availability
              </button>
              <button
                onClick={handleResetAllAvailability}
                disabled={students.length === 0}
                style={{
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "transparent",
                  color: students.length === 0 ? "rgba(0, 0, 0, 0.3)" : "#ca8a04",
                  border: "1px solid",
                  borderColor: students.length === 0 ? "rgba(0, 0, 0, 0.1)" : "rgba(202, 138, 4, 0.4)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: students.length === 0 ? "not-allowed" : "pointer",
                  opacity: students.length === 0 ? 0.6 : 1,
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  if (students.length > 0) {
                    e.currentTarget.style.backgroundColor = "rgba(202, 138, 4, 0.08)";
                    e.currentTarget.style.borderColor = "#ca8a04";
                  }
                }}
                onMouseOut={(e) => {
                  if (students.length > 0) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "rgba(202, 138, 4, 0.4)";
                  }
                }}
              >
                Reset All Availability
              </button>
              <button
                onClick={handleAddStudent}
                style={{
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "transparent",
                  color: "#14b8a6",
                  border: "1px solid rgba(20, 184, 166, 0.4)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                  e.currentTarget.style.borderColor = "#14b8a6";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                }}
              >
                + Add Student
              </button>
            </div>
          </div>

          <div style={{ padding: "2rem" }}>
            {loadingStudents ? (
              <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>Loading students...</p>
            ) : students.length === 0 ? (
              <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>No students yet. Add your first student to get started.</p>
            ) : (
              <div className="table-container" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ padding: "0.875rem 1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: "500", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <td style={{ padding: "1rem", color: "rgba(0, 0, 0, 0.87)", fontSize: "0.875rem" }}>{student.name}</td>
                        <td style={{ padding: "1rem", color: "rgba(0, 0, 0, 0.6)", fontSize: "0.875rem" }}>{student.email}</td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            {!student.hasSubmitted && (
                              <button
                                onClick={() => handleRequestSingleAvailability(student.id)}
                                style={{
                                  padding: "0.375rem 0.875rem",
                                  fontSize: "0.875rem",
                                  backgroundColor: "transparent",
                                  border: "1px solid rgba(20, 184, 166, 0.4)",
                                  borderRadius: "4px",
                                  color: "#14b8a6",
                                  cursor: "pointer",
                                  transition: "all 0.15s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                                  e.currentTarget.style.borderColor = "#14b8a6";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                                }}
                              >
                                Request Availability
                              </button>
                            )}
                            {student.hasSubmitted && (
                              <button
                                onClick={() => handleResetSingleAvailability(student.id)}
                                style={{
                                  padding: "0.375rem 0.875rem",
                                  fontSize: "0.875rem",
                                  backgroundColor: "transparent",
                                  border: "1px solid rgba(202, 138, 4, 0.4)",
                                  borderRadius: "4px",
                                  color: "#ca8a04",
                                  cursor: "pointer",
                                  transition: "all 0.15s"
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(202, 138, 4, 0.08)";
                                  e.currentTarget.style.borderColor = "#ca8a04";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                  e.currentTarget.style.borderColor = "rgba(202, 138, 4, 0.4)";
                                }}
                              >
                                Reset Availability
                              </button>
                            )}
                            <button
                              onClick={() => handleEditStudent(student)}
                              style={{
                                padding: "0.375rem 0.875rem",
                                fontSize: "0.875rem",
                                backgroundColor: "transparent",
                                border: "1px solid rgba(0, 0, 0, 0.2)",
                                borderRadius: "4px",
                                color: "#14b8a6",
                                cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              style={{
                                padding: "0.375rem 0.875rem",
                                fontSize: "0.875rem",
                                backgroundColor: "transparent",
                                border: "1px solid rgba(220, 38, 38, 0.3)",
                                borderRadius: "4px",
                                color: "#dc2626",
                                cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                                e.currentTarget.style.borderColor = "#dc2626";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
                              }}
                            >
                              Delete
                            </button>
                          </div>
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
        <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
              Schedule configuration
            </h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
              Configure your office hours, schedule period, and shift constraints
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            {/* Configuration Selector */}
            <div style={{ marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.375rem" }}>
                  Schedule Configuration
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                  Select a pre-configured schedule template or use manual settings below
                </p>
              </div>

              {configSuccess && (
                <div style={{
                  background: 'rgba(20, 184, 166, 0.1)',
                  border: '1px solid #14b8a6',
                  color: '#0d9488',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {configSuccess}
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "1", minWidth: "250px" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
                    Configuration
                  </label>
                  <select
                    value={selectedConfigId}
                    onChange={(e) => setSelectedConfigId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="">Manual Configuration (Use form below)</option>
                    {configurations.map(config => (
                      <option key={config._id} value={config._id}>
                        {config.name} {config.isDefault && '(Default)'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCreateNewConfig}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: "#14b8a6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#0d9488"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#14b8a6"}
                >
                  ⚙️ Create Configuration
                </button>

                <button
                  onClick={() => setShowConfigLibrary(true)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                >
                  📚 Manage Configurations
                </button>
              </div>

              {selectedConfigId && (
                <div style={{
                  marginTop: "1rem",
                  padding: "12px",
                  background: "rgba(20, 184, 166, 0.05)",
                  borderLeft: "3px solid #14b8a6",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.6)"
                }}>
                  ✓ Using custom configuration. Manual settings below will be ignored.
                </div>
              )}
            </div>

            {/* Office Hours */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.375rem" }}>
                  Office hours
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                  Define the operating hours for your office (Monday - Friday)
                </p>
              </div>
              <div className="grid-2-cols" style={{ display: "grid", gap: "1.25rem", maxWidth: "540px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
                    Start time
                  </label>
                  <input
                    type="time"
                    value={formData.officeStartTime}
                    onChange={(e) => handleInputChange("officeStartTime", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
                    End time
                  </label>
                  <input
                    type="time"
                    value={formData.officeEndTime}
                    onChange={(e) => handleInputChange("officeEndTime", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "2.5rem 0" }}></div>

            {/* Schedule Period */}
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.375rem" }}>
                  Schedule period
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                  Specify the date range for this schedule (e.g., semester dates)
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
                  Semester preset
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: "340px",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.87)",
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

              <div className="grid-2-cols" style={{ display: "grid", gap: "1.25rem", maxWidth: "540px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
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
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
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
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none",
                      colorScheme: "dark"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "2.5rem 0" }}></div>

            {/* Hours and Shift Constraints */}
            <div>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.375rem" }}>
                  Hours and shift constraints
                </h3>
                <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                  Set weekly hour targets and optional shift length limits. Leave shift constraints empty to use automatic scheduling strategies.
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem", maxWidth: "340px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
                  Hours per worker per week
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWorkerPerWeek}
                  onChange={(e) => handleInputChange("hoursPerWorkerPerWeek", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.87)",
                    outline: "none"
                  }}
                  min="2"
                  max="20"
                  step="0.5"
                />
                <p style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.5)", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                  Target hours each worker should get
                </p>
              </div>

              <div className="grid-2-cols" style={{ display: "grid", gap: "1.5rem", marginTop: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
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
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                    min="1"
                    max="8"
                    step="0.5"
                  />
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.5)", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                    Optional: Shortest shift duration (leave empty for auto)
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", marginBottom: "0.625rem" }}>
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
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                    min="1"
                    max="8"
                    step="0.5"
                  />
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0, 0, 0, 0.5)", marginTop: "0.5rem", marginBottom: 0, lineHeight: "1.4" }}>
                    Optional: Longest shift duration (leave empty for auto)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Edit Requests Section */}
        {editRequests.length > 0 && (
          <div style={{ backgroundColor: "#2d1f17", border: "1px solid #f59e0b", borderRadius: "8px", marginBottom: "1.5rem", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f59e0b" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#f59e0b", margin: 0, marginBottom: "0.5rem" }}>
                Pending Availability Edit Requests ({editRequests.length})
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#e5e7eb", lineHeight: "1.5", margin: 0 }}>
                Review and approve/reject student requests to update their availability
              </p>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {editRequests.map((request) => (
                <div key={request.id} style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", overflow: "hidden" }}>
                  {/* Request Header */}
                  <div style={{ padding: "1rem 1.25rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.25rem" }}>
                        {request.userName}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0 }}>
                        {request.userEmail}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleProcessEditRequest(request.id, 'approve')}
                        disabled={processingRequestId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "transparent",
                          color: processingRequestId === request.id ? "rgba(0, 0, 0, 0.3)" : "#10b981",
                          border: "1px solid",
                          borderColor: processingRequestId === request.id ? "rgba(0, 0, 0, 0.1)" : "rgba(16, 185, 129, 0.4)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: processingRequestId === request.id ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                            e.currentTarget.style.borderColor = "#10b981";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                          }
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleProcessEditRequest(request.id, 'reject')}
                        disabled={processingRequestId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "transparent",
                          color: processingRequestId === request.id ? "rgba(0, 0, 0, 0.3)" : "#dc2626",
                          border: "1px solid",
                          borderColor: processingRequestId === request.id ? "rgba(0, 0, 0, 0.1)" : "rgba(220, 38, 38, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: processingRequestId === request.id ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                            e.currentTarget.style.borderColor = "#dc2626";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
                          }
                        }}
                      >
                        × Reject
                      </button>
                    </div>
                  </div>

                  {/* Request Content */}
                  <div style={{ padding: "1.25rem" }}>
                    {/* Reason */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", margin: 0, marginBottom: "0.5rem" }}>
                        Reason for Edit:
                      </h4>
                      <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, padding: "0.75rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        {request.reason}
                      </p>
                    </div>

                    {/* Comparison */}
                    <div>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.6)", margin: 0, marginBottom: "0.75rem" }}>
                        Changes by Day
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                          const oldSlots = request.oldAvailability[day] || [];
                          const newSlots = request.newAvailability[day] || [];

                          // Check if there are changes for this day
                          const hasChanges = JSON.stringify(oldSlots.sort()) !== JSON.stringify(newSlots.sort());

                          // Only show days with changes
                          if (!hasChanges) return null;

                          // Find added and removed slots
                          const removedSlots = oldSlots.filter(slot => !newSlots.includes(slot));
                          const addedSlots = newSlots.filter(slot => !oldSlots.includes(slot));
                          const unchangedSlots = oldSlots.filter(slot => newSlots.includes(slot));

                          return (
                            <div key={day} style={{
                              backgroundColor: "rgba(0, 0, 0, 0.02)",
                              border: "1px solid rgba(0, 0, 0, 0.1)",
                              borderRadius: "6px",
                              padding: "0.75rem"
                            }}>
                              <div style={{
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: "#14b8a6",
                                marginBottom: "0.5rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                              }}>
                                {day}
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {/* Removed slots */}
                                {removedSlots.length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "500", marginRight: "0.25rem" }}>
                                      Removed:
                                    </span>
                                    {removedSlots.map((slot, idx) => (
                                      <span key={idx} style={{
                                        fontSize: "0.7rem",
                                        color: "#ef4444",
                                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                                        padding: "0.125rem 0.375rem",
                                        borderRadius: "3px",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        textDecoration: "line-through"
                                      }}>
                                        {slot}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Added slots */}
                                {addedSlots.length > 0 && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "500", marginRight: "0.25rem" }}>
                                      Added:
                                    </span>
                                    {addedSlots.map((slot, idx) => (
                                      <span key={idx} style={{
                                        fontSize: "0.7rem",
                                        color: "#10b981",
                                        backgroundColor: "rgba(20, 184, 166, 0.1)",
                                        padding: "0.125rem 0.375rem",
                                        borderRadius: "3px",
                                        border: "1px solid #1e4d2b",
                                        fontWeight: "600"
                                      }}>
                                        {slot}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Unchanged slots (if any exist and we want to show them) */}
                                {unchangedSlots.length > 0 && (addedSlots.length > 0 || removedSlots.length > 0) && (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.5)", fontWeight: "500", marginRight: "0.25rem" }}>
                                      Unchanged:
                                    </span>
                                    {unchangedSlots.slice(0, 5).map((slot, idx) => (
                                      <span key={idx} style={{
                                        fontSize: "0.7rem",
                                        color: "rgba(0, 0, 0, 0.5)",
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                        padding: "0.125rem 0.375rem",
                                        borderRadius: "3px",
                                        border: "1px solid rgba(255, 255, 255, 0.08)"
                                      }}>
                                        {slot}
                                      </span>
                                    ))}
                                    {unchangedSlots.length > 5 && (
                                      <span style={{ fontSize: "0.7rem", color: "rgba(0, 0, 0, 0.5)" }}>
                                        +{unchangedSlots.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Show message if no days have changes */}
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].every((day) => {
                        const oldSlots = request.oldAvailability[day] || [];
                        const newSlots = request.newAvailability[day] || [];
                        return JSON.stringify(oldSlots.sort()) === JSON.stringify(newSlots.sort());
                      }) && (
                        <div style={{
                          padding: "1rem",
                          textAlign: "center",
                          color: "rgba(0, 0, 0, 0.5)",
                          fontSize: "0.875rem",
                          fontStyle: "italic"
                        }}>
                          No changes detected in availability
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Password Reset Requests Section */}
        {passwordResetRequests.length > 0 && (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", marginBottom: "2rem", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
                Password Reset Requests ({passwordResetRequests.length})
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                Review and approve password reset requests from students
              </p>
            </div>

            <div style={{ padding: "1.5rem" }}>
              {passwordResetRequests.map((request) => (
                <div key={request.id} style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                  {/* Request Header */}
                  <div style={{ padding: "1rem 1.25rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.25rem" }}>
                        {request.userName}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0 }}>
                        {request.userEmail}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleApprovePasswordReset(request.id)}
                        disabled={processingRequestId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "transparent",
                          color: processingRequestId === request.id ? "rgba(0, 0, 0, 0.3)" : "#10b981",
                          border: "1px solid",
                          borderColor: processingRequestId === request.id ? "rgba(0, 0, 0, 0.1)" : "rgba(16, 185, 129, 0.4)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: processingRequestId === request.id ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                            e.currentTarget.style.borderColor = "#10b981";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                          }
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleDenyPasswordReset(request.id)}
                        disabled={processingRequestId === request.id}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "transparent",
                          color: processingRequestId === request.id ? "rgba(0, 0, 0, 0.3)" : "#dc2626",
                          border: "1px solid",
                          borderColor: processingRequestId === request.id ? "rgba(0, 0, 0, 0.1)" : "rgba(220, 38, 38, 0.3)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          cursor: processingRequestId === request.id ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease"
                        }}
                        onMouseOver={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                            e.currentTarget.style.borderColor = "#dc2626";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingRequestId !== request.id) {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.3)";
                          }
                        }}
                      >
                        × Deny
                      </button>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)" }}>
                      <div>
                        <strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                      <div>
                        <strong>Expires:</strong> {new Date(request.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Workers Availability Section */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #414d5c", borderRadius: "8px", marginBottom: "1rem", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #414d5c" }}>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
                Student Availability
              </h2>
              <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", lineHeight: "1.5" }}>
                Read-only view of student-submitted availability. {students.filter(s => s.hasSubmitted).length} of {students.length} students have submitted.
              </p>
            </div>
          </div>
          <div style={{ padding: "1.5rem" }}>
            {students.filter(s => s.hasSubmitted).length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                <p style={{ margin: 0, marginBottom: "1rem" }}>No students have submitted their availability yet.</p>
                <p style={{ margin: 0, color: "rgba(0, 0, 0, 0.45)" }}>Request availability from students using the Admin Dashboard or wait for them to submit.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {students.filter(s => s.hasSubmitted).map((student) => (
                  <AvailabilityGrid key={student.id} student={student} />
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
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "6px",
            marginTop: "1.5rem",
            marginBottom: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.25rem", color: "#dc2626", lineHeight: "1" }}>⚠</span>
              <p style={{ color: "#ff9999", fontSize: "0.875rem", margin: 0, lineHeight: "1.6" }}>
                {validationError}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: validationError ? "1rem" : "1.5rem", marginBottom: "2rem" }}>
          <button
            onClick={() => setShowTemplateLibrary(true)}
            type="button"
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "transparent",
              color: "#6b7280",
              border: "1px solid rgba(107, 114, 128, 0.3)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.01em",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(107, 114, 128, 0.05)";
              e.currentTarget.style.borderColor = "#6b7280";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "rgba(107, 114, 128, 0.3)";
            }}
          >
            📚 Load from Template
          </button>

          <button
            onClick={handleGenerateSchedule}
            disabled={isGenerating || students.filter(s => s.hasSubmitted).length === 0}
            aria-label="Generate work schedule based on provided information"
            aria-busy={isGenerating}
            style={{
              padding: "0.625rem 1.5rem",
              backgroundColor: "transparent",
              color: isGenerating || students.filter(s => s.hasSubmitted).length === 0 ? "rgba(0, 0, 0, 0.3)" : "#ec7211",
              border: "1px solid",
              borderColor: isGenerating || students.filter(s => s.hasSubmitted).length === 0 ? "rgba(0, 0, 0, 0.1)" : "rgba(236, 114, 17, 0.4)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: isGenerating || students.filter(s => s.hasSubmitted).length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "0.01em",
            }}
            onMouseOver={(e) => {
              if (!isGenerating && students.filter(s => s.hasSubmitted).length > 0) {
                e.currentTarget.style.backgroundColor = "rgba(236, 114, 17, 0.08)";
                e.currentTarget.style.borderColor = "#ec7211";
              }
            }}
            onMouseOut={(e) => {
              if (!isGenerating && students.filter(s => s.hasSubmitted).length > 0) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(236, 114, 17, 0.4)";
              }
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isGenerating && (
                <span style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  border: "2px solid #ec7211",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", marginBottom: "0.5rem" }}>
                    Generated Schedules
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", lineHeight: "1.6", margin: 0 }}>
                    Three different scheduling strategies have been generated. Review all options below to choose the best fit.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setShowSaveTemplateModal(true)}
                    type="button"
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: "#8b5cf6",
                      border: "1px solid rgba(139, 92, 246, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      letterSpacing: "0.01em",
                      whiteSpace: "nowrap",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(139, 92, 246, 0.08)";
                      e.currentTarget.style.borderColor = "#8b5cf6";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                    }}
                  >
                    💾 Save as Template
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(true)}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: "#14b8a6",
                      border: "1px solid rgba(20, 184, 166, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.borderColor = "#14b8a6";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                    }}
                  >
                    📜 View Schedule History
                  </button>
                </div>
              </div>
            </div>

            {/* Display all 3 schedules */}
            {scheduleResult.schedules.map((currentSchedule, scheduleIndex) => (
              <div key={scheduleIndex} style={{ marginBottom: "3rem" }}>
                {/* Schedule Header */}
                <div style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #14b8a6",
                  borderRadius: "8px 8px 0 0",
                  padding: "1.5rem",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: 0, marginBottom: "0.5rem" }}>
                      {currentSchedule.name}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", margin: 0, lineHeight: "1.5" }}>
                      {currentSchedule.description}
                    </p>
                  </div>

                  {/* Publish Button */}
                  <button
                    onClick={() => handlePublishSchedule(scheduleIndex)}
                    disabled={publishingScheduleId === savedScheduleIds[scheduleIndex]}
                    aria-label={`Publish ${currentSchedule.name}`}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: publishingScheduleId === savedScheduleIds[scheduleIndex] ? "rgba(0, 0, 0, 0.3)" : "#10b981",
                      border: "1px solid",
                      borderColor: publishingScheduleId === savedScheduleIds[scheduleIndex] ? "rgba(0, 0, 0, 0.1)" : "rgba(16, 185, 129, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: publishingScheduleId === savedScheduleIds[scheduleIndex] ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.01em",
                      opacity: publishingScheduleId === savedScheduleIds[scheduleIndex] ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (publishingScheduleId !== savedScheduleIds[scheduleIndex]) {
                        e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                        e.currentTarget.style.borderColor = "#10b981";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (publishingScheduleId !== savedScheduleIds[scheduleIndex]) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                      }
                    }}
                  >
                    {publishingScheduleId === savedScheduleIds[scheduleIndex] ? 'Publishing...' : 'Publish Schedule'}
                  </button>

                  <button
                    onClick={() => {
                      const csv = exportToCSV(currentSchedule.schedule, currentSchedule.name);
                      const filename = `schedule_${scheduleIndex + 1}_${currentSchedule.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
                      downloadCSV(csv, filename);
                    }}
                    aria-label={`Export ${currentSchedule.name} to CSV`}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: "#047857",
                      border: "1px solid rgba(4, 120, 87, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.01em"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(4, 120, 87, 0.08)";
                      e.currentTarget.style.borderColor = "#047857";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "rgba(4, 120, 87, 0.4)";
                    }}
                  >
                    Export CSV
                  </button>
                </div>

                <div style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #14b8a6",
                  borderTop: "none",
                  borderRadius: "0 0 8px 8px",
                  padding: "1.5rem"
                }}>
                  <>
                  {/* Errors */}
                  {currentSchedule.errors && currentSchedule.errors.length > 0 && (
                    <div style={{
                      padding: "1rem 1.5rem",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
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
                          <div style={{ fontWeight: "500", color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
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
                      backgroundColor: "rgba(20, 184, 166, 0.1)",
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
                      backgroundColor: "rgba(20, 184, 166, 0.1)",
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
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid #414d5c", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", marginBottom: "1.25rem" }}>Statistics</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                      <div style={{ padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Workers Scheduled</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                          {currentSchedule.statistics.totalWorkersScheduled} / {currentSchedule.statistics.totalWorkersAvailable}
                        </p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Total Hours</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>{currentSchedule.statistics.totalHoursScheduled}h</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Avg Hours/Worker</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>{currentSchedule.statistics.avgHoursPerWorker}h</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: "4px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
                        <p style={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: "500", letterSpacing: "0.05em" }}>Hour Balance</p>
                        <p style={{ fontSize: "1.5rem", fontWeight: "400", margin: 0, color: currentSchedule.statistics.hoursDifference <= 1 ? "#4ade80" : "#ff9900" }}>
                          ±{currentSchedule.statistics.hoursDifference}h
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Table */}
                  <div style={{ backgroundColor: "#ffffff", border: "1px solid #414d5c", borderRadius: "8px", overflow: "hidden", marginBottom: "1.5rem" }}>
                    <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #414d5c" }}>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>Weekly schedule</h2>
                    </div>
                    <div className="table-container" style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
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
                            <td style={{ padding: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", fontSize: "0.875rem" }}>{worker.workerName}</td>
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                              <td key={day} style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                {worker.schedule[day] ? (
                                  Array.isArray(worker.schedule[day]) ? (
                                    // Multiple shifts
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                      {worker.schedule[day].map((shift, idx) => (
                                        <div key={idx}>
                                          <div style={{ fontWeight: "400", color: "rgba(0, 0, 0, 0.87)" }}>
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
                                      <div style={{ fontWeight: "400", color: "rgba(0, 0, 0, 0.87)" }}>
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
                            <td style={{ padding: "1rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", fontSize: "0.875rem" }}>{worker.totalHours}h</td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Coverage Gaps */}
                  {currentSchedule.uncoveredPeriods && Object.keys(currentSchedule.uncoveredPeriods).length > 0 && (
                    <div style={{ backgroundColor: "#ffffff", border: "1px solid #414d5c", borderRadius: "8px", padding: "1.5rem" }}>
                      <h2 style={{ fontSize: "1.125rem", fontWeight: "400", color: "#dc2626", marginBottom: "1rem" }}>
                        ⚠ Coverage gaps
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {Object.entries(currentSchedule.uncoveredPeriods).map(([day, periods]) => (
                          <div key={day} style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "4px" }}>
                            <p style={{ fontWeight: "500", color: "#dc2626", marginBottom: "0.5rem", fontSize: "0.875rem" }}>{day}</p>
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

        {/* Invite Admin Modal */}
        {showInviteAdminModal && (
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
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%"
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", marginBottom: "0.5rem" }}>
                Invite Secondary Admin
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.45)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
                Send an invitation email with login credentials to a new admin for {user?.organizationName}.
              </p>

              {adminError && (
                <div style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  marginBottom: "1rem"
                }}>
                  <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>
                    {adminError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitAdminInvite}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.6)",
                    marginBottom: "0.625rem"
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                    required
                    placeholder="Full name of the admin"
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.6)",
                    marginBottom: "0.625rem"
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    required
                    placeholder="admin@example.com"
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                  />
                  <p style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.45)", marginTop: "0.5rem", marginBottom: 0 }}>
                    An invitation email with temporary credentials will be sent to this address.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteAdminModal(false);
                      setAdminError('');
                    }}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdmin}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: submittingAdmin ? "rgba(0, 0, 0, 0.3)" : "#14b8a6",
                      border: "1px solid",
                      borderColor: submittingAdmin ? "rgba(0, 0, 0, 0.1)" : "rgba(20, 184, 166, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: submittingAdmin ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      opacity: submittingAdmin ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!submittingAdmin) {
                        e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                        e.currentTarget.style.borderColor = "#14b8a6";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submittingAdmin) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                      }
                    }}
                  >
                    {submittingAdmin ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
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
              backgroundColor: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%"
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", marginBottom: "1.5rem" }}>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>

              {studentError && (
                <div style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderLeft: "4px solid #dc2626",
                  borderRadius: "6px",
                  marginBottom: "1.5rem"
                }}>
                  <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{studentError}</p>
                </div>
              )}

              <form onSubmit={handleSubmitStudent}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.6)",
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
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.6)",
                    marginBottom: "0.625rem"
                  }}>
                    Primary Email
                  </label>
                  <input
                    type="email"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                    placeholder="personal@email.com"
                  />
                  <small style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.45)",
                    marginTop: "0.25rem"
                  }}>
                    At least one email is required
                  </small>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.6)",
                    marginBottom: "0.625rem"
                  }}>
                    Secondary Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={studentFormData.secondaryEmail}
                    onChange={(e) => setStudentFormData({ ...studentFormData, secondaryEmail: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.875rem",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.87)",
                      outline: "none"
                    }}
                    placeholder="school@university.edu"
                  />
                  <small style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.45)",
                    marginTop: "0.25rem"
                  }}>
                    Notifications will be sent to both emails
                  </small>
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStudent}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: "transparent",
                      color: submittingStudent ? "rgba(0, 0, 0, 0.3)" : "#14b8a6",
                      border: "1px solid",
                      borderColor: submittingStudent ? "rgba(0, 0, 0, 0.1)" : "rgba(20, 184, 166, 0.4)",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: submittingStudent ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      opacity: submittingStudent ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!submittingStudent) {
                        e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                        e.currentTarget.style.borderColor = "#14b8a6";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submittingStudent) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                      }
                    }}
                  >
                    {submittingStudent ? 'Saving...' : (editingStudent ? 'Update' : 'Add') + ' Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.show && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }}
            onClick={() => confirmModal.onCancel && confirmModal.onCancel()}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(0, 0, 0, 0.1)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "1.5rem" }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: confirmModal.isDangerous ? "#dc2626" : "rgba(0, 0, 0, 0.87)",
                  marginBottom: "0.75rem"
                }}>
                  {confirmModal.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.6)",
                  lineHeight: "1.5"
                }}>
                  {confirmModal.message}
                </p>
              </div>

              <div style={{
                padding: "1rem 1.5rem",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
                borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px"
              }}>
                <button
                  onClick={() => confirmModal.onCancel && confirmModal.onCancel()}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={() => confirmModal.onConfirm && confirmModal.onConfirm()}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: confirmModal.isDangerous ? "#dc2626" : "#14b8a6",
                    border: "1px solid",
                    borderColor: confirmModal.isDangerous ? "rgba(220, 38, 38, 0.4)" : "rgba(20, 184, 166, 0.4)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = confirmModal.isDangerous ? "rgba(220, 38, 38, 0.08)" : "rgba(20, 184, 166, 0.08)";
                    e.currentTarget.style.borderColor = confirmModal.isDangerous ? "#dc2626" : "#14b8a6";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = confirmModal.isDangerous ? "rgba(220, 38, 38, 0.4)" : "rgba(20, 184, 166, 0.4)";
                  }}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Modals */}
        <SaveTemplateModal
          isOpen={showSaveTemplateModal}
          currentConfig={{
            officeStartTime: formData.officeStartTime,
            officeEndTime: formData.officeEndTime,
            totalHoursPerWeek: formData.totalHoursPerWeek,
            hoursPerWorkerPerWeek: formData.hoursPerWorkerPerWeek,
            minShiftLength: formData.minShiftLength,
            maxShiftLength: formData.maxShiftLength
          }}
          onSave={handleSaveTemplate}
          onCancel={() => setShowSaveTemplateModal(false)}
        />

        <TemplateLibraryModal
          isOpen={showTemplateLibrary}
          onSelectTemplate={handleSelectTemplate}
          onCancel={() => setShowTemplateLibrary(false)}
        />

        {/* Schedule History Modal */}
        <ScheduleHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          onRevert={handleScheduleReverted}
        />

        {/* Conflict Warning Modal */}
        <ConflictWarningModal
          isOpen={showConflictModal}
          onClose={handleConflictCancel}
          onConfirm={handleConflictConfirm}
          conflicts={conflictData?.conflicts || []}
          conflictCount={conflictData?.conflictCount || 0}
          scheduleId={pendingPublishScheduleId}
        />

        {/* Configuration Modals */}
        <ConfigurationWizard
          isOpen={showConfigWizard}
          initialConfig={editingConfig}
          mode={editingConfig ? 'edit' : 'create'}
          onSave={handleSaveConfiguration}
          onCancel={() => {
            setShowConfigWizard(false);
            setEditingConfig(null);
          }}
        />

        <ConfigurationLibrary
          isOpen={showConfigLibrary}
          onSelectConfig={handleSelectConfig}
          onEditConfig={handleEditConfig}
          onDeleteConfig={handleDeleteConfig}
          onClose={() => setShowConfigLibrary(false)}
        />
      </div>
    </div>
  );
}