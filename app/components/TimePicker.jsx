"use client";

import { useState, useEffect, useRef } from "react";

// Generate time options in 30-minute increments only (:00 and :30)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`;
      times.push({ value: time24, label: time12 });
    }
  }
  return times;
};

// Convert 24-hour time to 12-hour format
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Custom Time Picker Component
export default function TimePicker({ value, onChange, placeholder, positionAbove = false, minTime = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const allTimeOptions = generateTimeOptions();
  const dropdownRef = useRef(null);
  const selectedRef = useRef(null);

  // Filter time options based on minTime
  const timeOptions = minTime
    ? allTimeOptions.filter(time => timeToMinutes(time.value) > timeToMinutes(minTime))
    : allTimeOptions;

  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: "#0d1117",
          border: "1px solid #414d5c",
          borderRadius: "4px",
          fontSize: "0.875rem",
          color: value ? "#ffffff" : "#6b7280",
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem"
        }}
      >
        <span>{value ? convertTo12Hour(value) : placeholder}</span>
        <span style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: "1" }}>▼</span>
      </div>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Time options"
          style={{
            position: 'absolute',
            ...(positionAbove ? { bottom: '100%', marginBottom: '0.25rem' } : { top: 0 }),
            left: 0,
            backgroundColor: "#16191f",
            border: "1px solid #414d5c",
            borderRadius: "4px",
            maxHeight: "300px",
            overflowY: "auto",
            width: "100%",
            minWidth: "180px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)"
          }}
        >
          {timeOptions.map((time) => {
            const isSelected = time.value === value;
            return (
              <div
                key={time.value}
                role="option"
                aria-selected={isSelected}
                ref={isSelected ? selectedRef : null}
                onClick={() => {
                  onChange(time.value);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(time.value);
                    setIsOpen(false);
                  }
                }}
                tabIndex={0}
                style={{
                  padding: "0.625rem 0.875rem",
                  fontSize: "0.875rem",
                  color: isSelected ? "#ffffff" : "#d1d5db",
                  backgroundColor: isSelected ? "#047857" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "background-color 0.1s"
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "#1f2937";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {isSelected && <span style={{ color: "#ffffff", fontSize: "0.75rem" }}>✓</span>}
                <span>{time.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
