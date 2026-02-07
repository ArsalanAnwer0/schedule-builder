'use client';

// Helper function to parse time slot strings like "8:00 AM - 9:00 AM" into start hour
const parseTimeSlot = (timeSlot) => {
  const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return null;

  let hour = parseInt(match[1]);
  const ampm = match[3];

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  return hour;
};

// Generate time slots from 8 AM to 5 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    const hour12 = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 12 ? 12 : hour12;
    slots.push({
      hour: hour,
      label: `${displayHour}:00 ${ampm}`
    });
  }
  return slots;
};

export default function AvailabilityGrid({ student }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = generateTimeSlots();

  // Build a map of available hours for each day
  const availabilityMap = {};
  days.forEach(day => {
    availabilityMap[day] = new Set();
    const dayAvail = student.availability?.availability?.[day] || [];
    dayAvail.forEach(slot => {
      const hour = parseTimeSlot(slot);
      if (hour !== null) {
        availabilityMap[day].add(hour);
      }
    });
  });

  return (
    <div style={{
      marginTop: "1rem",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "6px",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "0.75rem 1rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backgroundColor: "rgba(255, 255, 255, 0.03)"
      }}>
        <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "#ffffff", marginBottom: "0.25rem" }}>
          {student.name}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#8b949e" }}>
          Submitted {new Date(student.availability.submittedAt).toLocaleDateString()}
        </div>
        {student.availability.notes && (
          <div style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "4px",
            fontSize: "0.75rem",
            color: "#c9d1d9"
          }}>
            <span style={{ fontWeight: "500", color: "#8b949e" }}>Note: </span>
            {student.availability.notes}
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.75rem"
        }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <th style={{
                padding: "0.625rem 0.75rem",
                textAlign: "left",
                borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "0.7rem",
                fontWeight: "600",
                color: "#8b949e",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                position: "sticky",
                left: 0,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                zIndex: 10,
                minWidth: "70px"
              }}>
                Time
              </th>
              {days.map(day => (
                <th key={day} style={{
                  padding: "0.625rem 0.75rem",
                  textAlign: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "0.7rem",
                  fontWeight: "600",
                  color: "#8b949e",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  minWidth: "60px"
                }}>
                  {day.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(({ hour, label }) => (
              <tr key={hour} style={{
                borderBottom: hour === timeSlots[timeSlots.length - 1].hour ? "none" : "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <td style={{
                  padding: "0.5rem 0.75rem",
                  borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#8b949e",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  zIndex: 5
                }}>
                  {label}
                </td>
                {days.map(day => {
                  const isAvailable = availabilityMap[day].has(hour);
                  return (
                    <td key={day} style={{
                      padding: "0.5rem 0.75rem",
                      textAlign: "center",
                      backgroundColor: isAvailable ? "rgba(16, 185, 129, 0.15)" : "transparent"
                    }}>
                      {isAvailable && (
                        <span style={{
                          color: "#10b981",
                          fontSize: "0.875rem",
                          fontWeight: "600"
                        }}>
                          ✓
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
