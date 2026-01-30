"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function TextHoverEffect({
  text,
  fontSize = 90,
}) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  useGSAP(
    () => {
      const revealMask = svgRef.current?.querySelector("#text-reveal-mask");
      if (!revealMask) return;

      gsap.to(revealMask, {
        attr: { r: hovered ? "80%" : "0%" },
        duration: 0.5,
        ease: "power2.out",
      });
    },
    { scope: svgRef, dependencies: [hovered] }
  );

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1200 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      style={{ cursor: "default" }}
    >
      <defs>
        <radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
          r="20%"
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {/* Always visible text -- white outline */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.5"
        style={{
          fill: "transparent",
          stroke: "rgba(0,0,0,0.15)",
          fontSize: `${fontSize}px`,
          fontWeight: "bold",
          fontFamily: "inherit",
        }}
      >
        {text}
      </text>

      {/* Hover reveal text -- green outline */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="2"
        mask="url(#textMask)"
        style={{
          fill: "transparent",
          stroke: "#14b8a6",
          fontSize: `${fontSize}px`,
          fontWeight: "bold",
          fontFamily: "inherit",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        {text}
      </text>
    </svg>
  );
}
