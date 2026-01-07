'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from '../components/NotificationBell';
import { useToast } from '../components/Toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function StudentDashboard() {
  const router = useRouter();
  const toast = useToast();
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

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit availability');
        return;
      }

      toast.success('Availability submitted successfully!');
      setHasSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit availability. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditRequest = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);

    if (!editReason.trim()) {
      toast.error('Please provide a reason for the edit');
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
        toast.error(data.error || 'Failed to submit edit request');
        return;
      }

      toast.success(data.message);
      setShowEditForm(false);
      setEditReason('');

      // Refresh edit requests
      const editRes = await fetch('/api/availability/edit-requests');
      const editData = await editRes.json();
      if (editData.requests) {
        setEditRequests(editData.requests);
      }
    } catch (err) {
      toast.error('Failed to submit edit request. Please check your connection and try again.');
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
        backgroundColor: "#0a0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontWeight: "300" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{
      minHeight: "100vh",
      backgroundColor: "#0a0f1a",
      padding: "2rem 1.5rem"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <style jsx>{`
          @media (max-width: 768px) {
            .page-container {
              padding: 1rem 0.75rem !important;
            }
            .page-title {
              font-size: 1.5rem !important;
            }
            .profile-text {
              display: none !important;
            }
            .profile-chevron {
              display: none !important;
            }
          }
          @media (min-width: 769px) and (max-width: 1024px) {
            .page-container {
              padding: 1.5rem 1rem !important;
            }
            .page-title {
              font-size: 1.75rem !important;
            }
          }
        `}</style>
        <div style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h1 className="page-title" style={{
              fontSize: "1.875rem",
              fontWeight: "400",
              color: "#ffffff",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}>
              Student Dashboard
            </h1>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.6",
              fontWeight: "300"
            }}>
              Welcome, {user?.name}
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
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
                color: "#ffffff"
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff" }}>{user?.name}</span>
                <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>Student</span>
              </div>
              <svg className="profile-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: "0.25rem" }}>
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
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(10px)",
                  zIndex: 50,
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
                        router.push('/settings/security');
                      }}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.75rem",
                        backgroundColor: "transparent",
                        color: "#d1d5db",
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
                        <path d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.5 8C13.5 8 11.5 11.5 8 11.5C4.5 11.5 2.5 8 2.5 8C2.5 8 4.5 4.5 8 4.5C11.5 4.5 13.5 8 13.5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Security Settings
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

        {/* Email Verification Banner */}
        {user && !user.emailVerified && (
          <div style={{
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "0.9375rem",
                fontWeight: "500",
                color: "#fbbf24",
                marginBottom: "0.25rem"
              }}>
                Email Not Verified
              </div>
              <div style={{
                fontSize: "0.875rem",
                color: "#fde68a",
                lineHeight: "1.5"
              }}>
                Please verify your email address to secure your account and receive important notifications.
              </div>
            </div>
            <button
              onClick={() => router.push(`/verify-email?email=${encodeURIComponent(user.email)}&type=primary`)}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#fbbf24",
                color: "#1a1a1a",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f59e0b"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fbbf24"}
            >
              Verify Email
            </button>
          </div>
        )}

        {/* Published Schedule Section */}
        {!loadingSchedule && publishedSchedule && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid #14b8a6",
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
            <style jsx>{`
              @media (max-width: 768px) {
                .schedule-table-desktop {
                  display: none !important;
                }
                .schedule-mobile {
                  display: block !important;
                }
              }
              @media (min-width: 769px) {
                .schedule-mobile {
                  display: none !important;
                }
              }
            `}</style>

            {/* Desktop Table */}
            <div className="schedule-table-desktop table-container" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
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
                        <tr key={day} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
                      <tr key={`${day}-${index}`} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
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
                          color: shift.studentId === user?.id ? "#14b8a6" : "#c9d1d9",
                          fontSize: "0.875rem",
                          fontWeight: shift.studentId === user?.id ? "600" : "400"
                        }}>
                          {shift.studentName}
                          {shift.studentId === user?.id && (
                            <span style={{
                              marginLeft: "0.5rem",
                              fontSize: "0.75rem",
                              color: "#14b8a6",
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

            {/* Mobile Cards */}
            <div className="schedule-mobile">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => {
                const dayShifts = publishedSchedule.shifts[day] || [];

                return (
                  <div key={day} style={{
                    marginBottom: "1.5rem",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    padding: "1rem"
                  }}>
                    <h3 style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      color: "#ffffff",
                      textTransform: "capitalize",
                      margin: 0,
                      marginBottom: "1rem"
                    }}>
                      {day}
                    </h3>

                    {dayShifts.length === 0 ? (
                      <p style={{
                        color: "#6e7681",
                        fontSize: "0.875rem",
                        fontStyle: "italic",
                        margin: 0
                      }}>
                        No shifts scheduled
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {dayShifts.map((shift, index) => (
                          <div key={`${day}-${index}-mobile`} style={{
                            padding: "0.875rem",
                            backgroundColor: shift.studentId === user?.id ? "rgba(20, 184, 166, 0.1)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${shift.studentId === user?.id ? "rgba(20, 184, 166, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: "6px"
                          }}>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "0.5rem"
                            }}>
                              <span style={{
                                color: shift.studentId === user?.id ? "#14b8a6" : "#c9d1d9",
                                fontSize: "0.9375rem",
                                fontWeight: "600"
                              }}>
                                {shift.studentName}
                                {shift.studentId === user?.id && (
                                  <span style={{
                                    marginLeft: "0.5rem",
                                    fontSize: "0.75rem",
                                    color: "#14b8a6",
                                    fontWeight: "400"
                                  }}>
                                    (You)
                                  </span>
                                )}
                              </span>
                              <span style={{
                                color: "#8b949e",
                                fontSize: "0.875rem",
                                fontWeight: "500"
                              }}>
                                {shift.hours}h
                              </span>
                            </div>
                            <div style={{
                              color: "#c9d1d9",
                              fontSize: "0.875rem"
                            }}>
                              {shift.startTime} - {shift.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loadingSchedule && !publishedSchedule && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
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
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          marginBottom: "2rem",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0d9488"}
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
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
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
            <style jsx>{`
              @media (max-width: 768px) {
                .availability-grid-container {
                  display: block !important;
                }
                .day-section {
                  margin-bottom: 2rem;
                }
                .day-header {
                  font-size: 1rem !important;
                  margin-bottom: 1rem;
                  padding: 0.75rem;
                  background: rgba(255, 255, 255, 0.05);
                  border-radius: 6px;
                  text-align: center;
                }
                .time-slots-mobile {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 0.5rem;
                }
              }
              @media (min-width: 769px) {
                .day-section {
                  display: none;
                }
              }
              @media (max-width: 768px) {
                .desktop-grid {
                  display: none !important;
                }
              }
            `}</style>

            {/* Desktop Grid */}
            <div className="desktop-grid table-container" style={{ overflowX: "auto", marginBottom: "2rem" }}>
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
                            backgroundColor: isSelected ? "#0d4a2d" : "rgba(255, 255, 255, 0.05)",
                            border: `1px solid ${isSelected ? "#1e7a4d" : "rgba(255, 255, 255, 0.1)"}`,
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
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
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

            {/* Mobile View - Day by Day */}
            <div className="availability-grid-container">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="day-section">
                  <h3 className="day-header" style={{
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: 0,
                    marginBottom: "1rem"
                  }}>
                    {day}
                  </h3>
                  <div className="time-slots-mobile">
                    {getTimeSlots().map(timeSlot => {
                      const isSelected = availability[day].includes(timeSlot);
                      const isDisabled = hasSubmitted && !showEditForm;
                      return (
                        <button
                          key={`${day}-${timeSlot}-mobile`}
                          type="button"
                          onClick={() => !isDisabled && toggleTimeSlot(day, timeSlot)}
                          disabled={isDisabled}
                          style={{
                            padding: "0.875rem",
                            backgroundColor: isSelected ? "#0d4a2d" : "rgba(255, 255, 255, 0.05)",
                            border: `1px solid ${isSelected ? "#1e7a4d" : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                            color: isSelected ? "#86efac" : "#c9d1d9",
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                            fontWeight: isSelected ? "500" : "400",
                            opacity: isDisabled ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected && !isDisabled) {
                              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                            }
                          }}
                        >
                          <span>{timeSlot}</span>
                          {isSelected && <span style={{ fontSize: "1rem" }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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
                  backgroundColor: (showEditForm ? submittingEdit : submitting) ? "#414d5c" : showEditForm ? "#0d9488" : "#14b8a6",
                  color: "#ffffff",
                  border: `1px solid ${(showEditForm ? submittingEdit : submitting) ? "#414d5c" : showEditForm ? "#0d9488" : "#14b8a6"}`,
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: (showEditForm ? submittingEdit : submitting) ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => {
                  if (!(showEditForm ? submittingEdit : submitting)) {
                    e.currentTarget.style.backgroundColor = showEditForm ? "#0d9488" : "#0d9488";
                    e.currentTarget.style.borderColor = showEditForm ? "#0d9488" : "#0d9488";
                  }
                }}
                onMouseOut={(e) => {
                  if (!(showEditForm ? submittingEdit : submitting)) {
                    e.currentTarget.style.backgroundColor = showEditForm ? "#0d9488" : "#14b8a6";
                    e.currentTarget.style.borderColor = showEditForm ? "#0d9488" : "#14b8a6";
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

      </div>
    </div>
  );
}
