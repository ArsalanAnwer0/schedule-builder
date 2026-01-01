'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Availability state
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  });
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Published schedule state
  const [publishedSchedule, setPublishedSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Edit request state
  const [editRequests, setEditRequests] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Function to fetch user data
  const fetchUserData = () => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  // Poll for user data updates every 5 seconds when availability not requested
  useEffect(() => {
    if (user && !user.availabilityRequested) {
      const interval = setInterval(() => {
        fetch('/api/auth/me')
          .then(res => res.json())
          .then(data => {
            if (data.user && data.user.availabilityRequested) {
              setUser(data.user);
            }
          })
          .catch(err => console.error('Poll error:', err));
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch published schedule
  useEffect(() => {
    if (user) {
      fetch('/api/schedules/published')
        .then(res => res.json())
        .then(data => {
          if (data.schedule) {
            setPublishedSchedule(data.schedule);
          }
        })
        .catch(err => {
          console.error('Error fetching schedule:', err);
        })
        .finally(() => {
          setLoadingSchedule(false);
        });
    }
  }, [user]);

  // State to track if student has submitted availability
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Fetch current availability
  useEffect(() => {
    if (user) {
      fetch('/api/availability')
        .then(res => res.json())
        .then(data => {
          if (data.availability && data.availability.availability) {
            setAvailability(data.availability.availability);
            setAvailabilityNotes(data.availability.notes || '');
            setHasSubmitted(true); // Mark as submitted if availability exists
          }
        })
        .catch(err => {
          console.error('Error fetching availability:', err);
        });
    }
  }, [user]);

  // Fetch edit requests
  useEffect(() => {
    if (user) {
      fetch('/api/availability/edit-requests')
        .then(res => res.json())
        .then(data => {
          if (data.requests) {
            setEditRequests(data.requests);
          }
        })
        .catch(err => {
          console.error('Error fetching edit requests:', err);
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const toggleTimeSlot = (day, timeSlot) => {
    setAvailability(prev => {
      const daySlots = prev[day];
      const slotExists = daySlots.includes(timeSlot);

      return {
        ...prev,
        [day]: slotExists
          ? daySlots.filter(slot => slot !== timeSlot)
          : [...daySlots, timeSlot].sort()
      };
    });
  };

  const handleSubmitAvailability = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    console.log('Submitting availability:', availability);

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability,
          notes: availabilityNotes
        })
      });

      const data = await res.json();
      console.log('Response:', res.status, data);

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit availability');
        return;
      }

      setSubmitSuccess('Availability submitted successfully!');
      setHasSubmitted(true); // Mark as submitted after successful submission
      setTimeout(() => setSubmitSuccess(''), 5000);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditRequest = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setSubmitError('');
    setSubmitSuccess('');

    if (!editReason.trim()) {
      setSubmitError('Please provide a reason for the edit');
      setSubmittingEdit(false);
      return;
    }

    try {
      const res = await fetch('/api/availability/edit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAvailability: availability,
          newNotes: availabilityNotes,
          reason: editReason
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit edit request');
        return;
      }

      setSubmitSuccess(data.message);
      setTimeout(() => setSubmitSuccess(''), 5000);
      setShowEditForm(false);
      setEditReason('');

      // Refresh edit requests
      const editRes = await fetch('/api/availability/edit-requests');
      const editData = await editRes.json();
      if (editData.requests) {
        setEditRequests(editData.requests);
      }
    } catch (err) {
      console.error('Submit edit error:', err);
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    // Generate 30-minute intervals from 8:00 AM to 4:30 PM
    for (let hour = 8; hour <= 16; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

      // Add :00 slot
      slots.push(`${displayHour}:00 ${period}`);

      // Add :30 slot (including 4:30 PM, which is the last slot)
      slots.push(`${displayHour}:30 ${period}`);
    }
    return slots;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0f1b2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ color: "#aab7b8" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0f1b2a",
      padding: "2rem 1.5rem"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h1 style={{
              fontSize: "1.875rem",
              fontWeight: "400",
              color: "#ffffff",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em"
            }}>
              Student Dashboard
            </h1>
            <p style={{
              fontSize: "1rem",
              color: "#aab7b8",
              lineHeight: "1.6"
            }}>
              Welcome, {user?.name}
            </p>
          </div>

          {/* Modern Profile Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{
                padding: "0.625rem 1rem",
                backgroundColor: "#161b22",
                color: "#ffffff",
                border: "1px solid #30363d",
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
                e.currentTarget.style.backgroundColor = "#1c2128";
                e.currentTarget.style.borderColor = "#484f58";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#161b22";
                e.currentTarget.style.borderColor = "#30363d";
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
                color: "#ffffff"
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff" }}>{user?.name}</span>
                <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>Student</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: "0.25rem" }}>
                <path d="M4 6L8 10L12 6" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  backgroundColor: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  zIndex: 50,
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #30363d" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", marginBottom: "0.25rem" }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#8b949e" }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#8b949e", marginTop: "0.25rem" }}>
                      Student
                    </div>
                  </div>
                  <div style={{ padding: "0.5rem" }}>
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
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1c2128"}
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

        {/* Published Schedule Section */}
        {!loadingSchedule && publishedSchedule && (
          <div style={{
            backgroundColor: "#16191f",
            border: "1px solid #0972d3",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem"
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.5rem"
              }}>
                Your Work Schedule
              </h2>
              {publishedSchedule.scheduleConfig && (
                <p style={{
                  fontSize: "0.875rem",
                  color: "#8b949e",
                  margin: 0
                }}>
                  {new Date(publishedSchedule.scheduleConfig.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {' - '}
                  {new Date(publishedSchedule.scheduleConfig.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* Schedule Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #30363d" }}>
                    <th style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#8b949e",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Day</th>
                    <th style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#8b949e",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Worker</th>
                    <th style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#8b949e",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Shift Time</th>
                    <th style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#8b949e",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                    const dayShifts = publishedSchedule.shifts[day] || [];

                    if (dayShifts.length === 0) {
                      return (
                        <tr key={day} style={{ borderBottom: "1px solid #30363d" }}>
                          <td style={{
                            padding: "1rem 0.75rem",
                            color: "#c9d1d9",
                            fontSize: "0.875rem",
                            textTransform: "capitalize"
                          }}>
                            {day}
                          </td>
                          <td colSpan="3" style={{
                            padding: "1rem 0.75rem",
                            color: "#6e7681",
                            fontSize: "0.875rem",
                            fontStyle: "italic"
                          }}>
                            No shifts scheduled
                          </td>
                        </tr>
                      );
                    }

                    return dayShifts.map((shift, index) => (
                      <tr key={`${day}-${index}`} style={{ borderBottom: "1px solid #30363d" }}>
                        {index === 0 && (
                          <td
                            rowSpan={dayShifts.length}
                            style={{
                              padding: "1rem 0.75rem",
                              color: "#c9d1d9",
                              fontSize: "0.875rem",
                              textTransform: "capitalize",
                              verticalAlign: "top"
                            }}
                          >
                            {day}
                          </td>
                        )}
                        <td style={{
                          padding: "1rem 0.75rem",
                          color: shift.studentId === user?.id ? "#58a6ff" : "#c9d1d9",
                          fontSize: "0.875rem",
                          fontWeight: shift.studentId === user?.id ? "600" : "400"
                        }}>
                          {shift.studentName}
                          {shift.studentId === user?.id && (
                            <span style={{
                              marginLeft: "0.5rem",
                              fontSize: "0.75rem",
                              color: "#58a6ff",
                              fontWeight: "400"
                            }}>
                              (You)
                            </span>
                          )}
                        </td>
                        <td style={{
                          padding: "1rem 0.75rem",
                          color: "#c9d1d9",
                          fontSize: "0.875rem"
                        }}>
                          {shift.startTime} - {shift.endTime}
                        </td>
                        <td style={{
                          padding: "1rem 0.75rem",
                          color: "#c9d1d9",
                          fontSize: "0.875rem"
                        }}>
                          {shift.hours}h
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loadingSchedule && !publishedSchedule && (
          <div style={{
            backgroundColor: "#16191f",
            border: "1px solid #30363d",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            <p style={{ color: "#8b949e", fontSize: "0.875rem", margin: 0 }}>
              No schedule has been published yet. You'll see your work schedule here once it's published by your manager.
            </p>
          </div>
        )}

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#0d1f17",
            border: "1px solid #1e4d2b",
            borderLeft: "4px solid #047857",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#10b981", margin: 0, fontSize: "0.875rem" }}>✓ {submitSuccess}</p>
          </div>
        )}

        {submitError && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#2d1517",
            border: "1px solid #5c2d30",
            borderLeft: "4px solid #dc2626",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#ff6b6b", margin: 0, fontSize: "0.875rem" }}>{submitError}</p>
          </div>
        )}

        {/* Pending Edit Requests Section */}
        {editRequests.filter(req => req.status === 'pending').length > 0 && (
          <div style={{
            backgroundColor: "#2d1f17",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "1rem 1.5rem",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: "500",
              color: "#f59e0b",
              margin: 0,
              marginBottom: "0.5rem"
            }}>
              Pending Edit Request
            </h3>
            <p style={{ color: "#e5e7eb", fontSize: "0.875rem", margin: 0 }}>
              You have a pending availability edit request waiting for admin approval.
            </p>
          </div>
        )}

        {/* Availability Submission Section */}
        <div style={{
          backgroundColor: "#16191f",
          border: "1px solid #30363d",
          borderRadius: "8px",
          marginBottom: "2rem",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #30363d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap"
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#ffffff",
                margin: 0,
                marginBottom: "0.5rem"
              }}>
                {showEditForm ? 'Request Availability Edit' : 'Your Availability'}
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "#8b949e",
                margin: 0,
                lineHeight: "1.5"
              }}>
                {showEditForm
                  ? 'Make changes to your availability and submit for admin approval'
                  : 'Select the hours you\'re available to work each day'}
              </p>
            </div>
            {!showEditForm && hasSubmitted && editRequests.filter(req => req.status === 'pending').length === 0 && (
              <button
                onClick={() => setShowEditForm(true)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0d9488",
                  color: "#ffffff",
                  border: "1px solid #0d9488",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0f766e"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0d9488"}
              >
                Request Edit
              </button>
            )}
            {showEditForm && (
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditReason('');
                }}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#374151",
                  color: "#ffffff",
                  border: "1px solid #4b5563",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4b5563"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#374151"}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Show message if availability hasn't been requested */}
          {user && !user.availabilityRequested ? (
            <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
              <div style={{
                backgroundColor: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: "8px",
                padding: "3rem 2rem",
                maxWidth: "600px",
                margin: "0 auto"
              }}>
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: "500",
                  color: "#ffffff",
                  margin: 0,
                  marginBottom: "1rem"
                }}>
                  Availability Not Requested Yet
                </h3>
                <p style={{
                  fontSize: "0.9375rem",
                  color: "#8b949e",
                  lineHeight: "1.6",
                  margin: 0
                }}>
                  Your manager will send an availability request when it's time to submit your work availability. Only then you will have access to submit your availability. You'll receive an email notification when the request has been made.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={showEditForm ? handleSubmitEditRequest : handleSubmitAvailability} style={{ padding: "2rem" }}>
            {/* Time Grid */}
            <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "120px repeat(5, 1fr)",
                gap: "0.5rem",
                minWidth: "800px"
              }}>
                {/* Header Row */}
                <div></div>
                {DAYS_OF_WEEK.map(day => (
                  <div
                    key={day}
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    {day}
                  </div>
                ))}

                {/* Time Rows */}
                {getTimeSlots().map(timeSlot => (
                  <React.Fragment key={timeSlot}>
                    <div
                      style={{
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#c9d1d9",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {timeSlot}
                    </div>
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = availability[day].includes(timeSlot);
                      const isDisabled = hasSubmitted && !showEditForm;
                      return (
                        <button
                          key={`${day}-${timeSlot}`}
                          type="button"
                          onClick={() => !isDisabled && toggleTimeSlot(day, timeSlot)}
                          disabled={isDisabled}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: isSelected ? "#0d4a2d" : "#0d1117",
                            border: `1px solid ${isSelected ? "#1e7a4d" : "#30363d"}`,
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            color: isSelected ? "#86efac" : "#8b949e",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                            fontWeight: isSelected ? "500" : "400",
                            opacity: isDisabled ? 0.6 : 1
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = "#1c2128";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = "#0d1117";
                            }
                          }}
                        >
                          {isSelected ? "✓" : ""}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Reason for Edit (only show in edit mode) */}
            {showEditForm && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#c9d1d9",
                  marginBottom: "0.625rem"
                }}>
                  Reason for Edit Request <span style={{ color: "#f59e0b" }}>*</span>
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Please explain why you need to change your availability..."
                  rows={3}
                  required
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "#ffffff",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                />
              </div>
            )}

            {/* Notes Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#c9d1d9",
                marginBottom: "0.625rem"
              }}>
                Additional Notes (Optional)
              </label>
              <textarea
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="Any schedule preferences, constraints, or notes for your office manager..."
                rows={4}
                disabled={hasSubmitted && !showEditForm}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.875rem",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  opacity: (hasSubmitted && !showEditForm) ? 0.6 : 1,
                  cursor: (hasSubmitted && !showEditForm) ? "not-allowed" : "text"
                }}
              />
            </div>

            {/* Submit Button - Only show if not submitted OR in edit mode */}
            {(!hasSubmitted || showEditForm) && (
              <button
                type="submit"
                disabled={showEditForm ? submittingEdit : submitting}
                style={{
                  padding: "0.625rem 1.25rem",
                  backgroundColor: (showEditForm ? submittingEdit : submitting) ? "#414d5c" : showEditForm ? "#0d9488" : "#0972d3",
                  color: "#ffffff",
                  border: `1px solid ${(showEditForm ? submittingEdit : submitting) ? "#414d5c" : showEditForm ? "#0d9488" : "#0972d3"}`,
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: (showEditForm ? submittingEdit : submitting) ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  if (!(showEditForm ? submittingEdit : submitting)) {
                    e.currentTarget.style.backgroundColor = showEditForm ? "#0f766e" : "#0863bf";
                    e.currentTarget.style.borderColor = showEditForm ? "#0f766e" : "#0863bf";
                  }
                }}
                onMouseOut={(e) => {
                  if (!(showEditForm ? submittingEdit : submitting)) {
                    e.currentTarget.style.backgroundColor = showEditForm ? "#0d9488" : "#0972d3";
                    e.currentTarget.style.borderColor = showEditForm ? "#0d9488" : "#0972d3";
                  }
                }}
              >
                {showEditForm
                  ? (submittingEdit ? 'Submitting...' : 'Submit Edit Request')
                  : (submitting ? 'Submitting...' : 'Submit Availability')}
              </button>
            )}
          </form>
          )}
        </div>

        {/* Schedule Section */}
        <div style={{
          backgroundColor: "#16191f",
          border: "1px solid #30363d",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #30363d"
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: "500",
              color: "#ffffff",
              margin: 0,
              marginBottom: "0.5rem"
            }}>
              Your Schedule
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "#8b949e",
              margin: 0,
              lineHeight: "1.5"
            }}>
              View your assigned work schedule
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            <p style={{ color: "#8b949e", fontSize: "0.875rem" }}>
              No schedule available yet. Your office manager will publish schedules after collecting availability from all students.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
