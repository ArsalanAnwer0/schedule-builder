'use client';

import { useState } from 'react';

export default function ScreenshotCarousel({ screenshots, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto"
    }}>
      {/* Title */}
      <h3 style={{
        fontSize: "1.875rem",
        fontWeight: "500",
        color: "#ffffff",
        marginBottom: "2rem",
        textAlign: "center",
        fontFamily: "Georgia, 'Times New Roman', serif"
      }}>
        {title}
      </h3>

      {/* Carousel Container */}
      <div style={{
        position: "relative",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "2rem",
        overflow: "hidden"
      }}>
        {/* Image */}
        <div style={{
          position: "relative",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.2)"
        }}>
          <img
            src={screenshots[currentIndex].image}
            alt={screenshots[currentIndex].alt}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "8px"
            }}
          />
        </div>

        {/* Caption */}
        <div style={{
          marginTop: "1.5rem",
          textAlign: "center",
          minHeight: "3rem"
        }}>
          <p style={{
            fontSize: "0.9375rem",
            color: "rgba(255, 255, 255, 0.7)",
            lineHeight: "1.6",
            margin: 0,
            fontWeight: "300"
          }}>
            {screenshots[currentIndex].caption}
          </p>
        </div>

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: "3rem",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "1.5rem",
                transition: "all 0.2s",
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.8)";
                e.currentTarget.style.borderColor = "#14b8a6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: "3rem",
                height: "3rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "1.5rem",
                transition: "all 0.2s",
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.8)";
                e.currentTarget.style.borderColor = "#14b8a6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {screenshots.length > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.75rem",
          marginTop: "1.5rem"
        }}>
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? "2.5rem" : "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: index === currentIndex ? "#14b8a6" : "rgba(255, 255, 255, 0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
