'use client';

export default function ScreenshotGrid({ screenshots, sectionTitle }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Section Title */}
      {sectionTitle && (
        <h3 style={{
          fontSize: "1.5rem",
          fontWeight: "500",
          color: "#ffffff",
          marginBottom: "3rem",
          textAlign: "center",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.01em"
        }}>
          {sectionTitle}
        </h3>
      )}

      {/* Screenshots Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2.5rem",
        width: "100%"
      }}>
        {screenshots.map((screenshot, index) => (
          <div key={index} style={{
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Screenshot Image */}
            <div style={{
              width: "100%",
              height: "500px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
            }}
            >
              <img
                src={screenshot.image}
                alt={screenshot.alt}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "contain"
                }}
              />
            </div>

            {/* Caption below image */}
            <div style={{
              marginTop: "1.25rem",
              textAlign: "center",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem"
            }}>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.6",
                margin: 0,
                fontWeight: "300"
              }}>
                {screenshot.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
