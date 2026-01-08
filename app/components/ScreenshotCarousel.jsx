'use client';

import { useState } from 'react';

export default function ScreenshotCarousel({ screenshots, sectionTitle }) {
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
      maxWidth: "1100px",
      margin: "0 auto"
    }}>
      {/* Section Title */}
      {sectionTitle && (
        <h3 style={{
          fontSize: "1.5rem",
          fontWeight: "500",
          color: "#ffffff",
          marginBottom: "2.5rem",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.01em"
        }}>
          {sectionTitle}
        </h3>
      )}

      {/* Screenshot Image */}
      <div style={{
        position: "relative",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <img
          src={screenshots[currentIndex].image}
          alt={screenshots[currentIndex].alt}
          style={{
            width: "100%",
            height: "auto",
            display: "block"
          }}
        />

        {/* Navigation Arrows */}
        {screenshots.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              style={{
                position: "absolute",
                left: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                width: "2.5rem",
                height: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "1.5rem",
                transition: "all 0.2s",
                zIndex: 10,
                lineHeight: "1"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.9)";
                e.currentTarget.style.borderColor = "#14b8a6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              style={{
                position: "absolute",
                right: "1.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                width: "2.5rem",
                height: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#ffffff",
                fontSize: "1.5rem",
                transition: "all 0.2s",
                zIndex: 10,
                lineHeight: "1"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.9)";
                e.currentTarget.style.borderColor = "#14b8a6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Caption below the image */}
      <div style={{
        marginTop: "1.5rem",
        textAlign: "center",
        paddingLeft: "2rem",
        paddingRight: "2rem"
      }}>
        <p style={{
          fontSize: "1rem",
          color: "rgba(255, 255, 255, 0.6)",
          lineHeight: "1.7",
          margin: 0,
          fontWeight: "300",
          maxWidth: "800px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          {screenshots[currentIndex].caption}
        </p>
      </div>

      {/* Dots Indicator */}
      {screenshots.length > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "2rem"
        }}>
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? "2rem" : "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                backgroundColor: index === currentIndex ? "#14b8a6" : "rgba(255, 255, 255, 0.3)",
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
