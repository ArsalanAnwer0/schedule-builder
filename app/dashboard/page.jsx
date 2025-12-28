'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
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
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const toggleTimeSlot = (day, hour) => {
    setAvailability(prev => {
      const daySlots = prev[day];
      const slotExists = daySlots.includes(hour);

      return {
        ...prev,
        [day]: slotExists
          ? daySlots.filter(h => h !== hour)
          : [...daySlots, hour].sort((a, b) => a - b)
      };
    });
  };

  const handleSubmitAvailability = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

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
        setSubmitError(data.error || 'Failed to submit availability');
        return;
      }

      setSubmitSuccess('Availability submitted successfully!');
      setTimeout(() => setSubmitSuccess(''), 5000);
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeSlot = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(hour);
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
            borderBottom: "1px solid #30363d"
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: "500",
              color: "#ffffff",
              margin: 0,
              marginBottom: "0.5rem"
            }}>
              Submit Your Availability
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "#8b949e",
              margin: 0,
              lineHeight: "1.5"
            }}>
              Select the hours you're available to work each day
            </p>
          </div>

          <form onSubmit={handleSubmitAvailability} style={{ padding: "2rem" }}>
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
                {getTimeSlots().map(hour => (
                  <>
                    <div
                      key={`label-${hour}`}
                      style={{
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#c9d1d9",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {formatTimeSlot(hour)}
                    </div>
                    {DAYS_OF_WEEK.map(day => {
                      const isSelected = availability[day].includes(hour);
                      return (
                        <button
                          key={`${day}-${hour}`}
                          type="button"
                          onClick={() => toggleTimeSlot(day, hour)}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: isSelected ? "#0d4a2d" : "#0d1117",
                            border: `1px solid ${isSelected ? "#1e7a4d" : "#30363d"}`,
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            color: isSelected ? "#86efac" : "#8b949e",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            fontWeight: isSelected ? "500" : "400"
                          }}
                          onMouseOver={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = "#1c2128";
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = "#0d1117";
                            }
                          }}
                        >
                          {isSelected ? "✓" : ""}
                        </button>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: submitting ? "#414d5c" : "#0972d3",
                color: "#ffffff",
                border: `1px solid ${submitting ? "#414d5c" : "#0972d3"}`,
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseOver={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#0863bf";
                  e.currentTarget.style.borderColor = "#0863bf";
                }
              }}
              onMouseOut={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#0972d3";
                  e.currentTarget.style.borderColor = "#0972d3";
                }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Availability'}
            </button>
          </form>
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
