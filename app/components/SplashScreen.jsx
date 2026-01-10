'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [fadeState, setFadeState] = useState('fade-in'); // 'fade-in', 'visible', 'fade-out', 'hidden'

  useEffect(() => {
    // Fade in for 0.8s
    const fadeInTimer = setTimeout(() => {
      setFadeState('visible');
    }, 800);

    // Stay visible for 3 seconds
    const visibleTimer = setTimeout(() => {
      setFadeState('fade-out');
    }, 3800); // 800ms fade-in + 3000ms visible

    // Start fade out, then call onComplete
    const fadeOutTimer = setTimeout(() => {
      setFadeState('hidden');
      if (onComplete) {
        onComplete();
      }
    }, 4600); // 800ms fade-in + 3000ms visible + 800ms fade-out

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(visibleTimer);
      clearTimeout(fadeOutTimer);
    };
  }, [onComplete]);

  if (fadeState === 'hidden') {
    return null;
  }

  const opacity = fadeState === 'fade-in' ? 0 : fadeState === 'visible' ? 1 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0a0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: opacity,
        transition: 'opacity 800ms ease-in-out',
        pointerEvents: fadeState === 'hidden' ? 'none' : 'auto'
      }}
    >
      <div style={{
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '300',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          fontFamily: "Georgia, 'Times New Roman', serif",
          margin: 0
        }}>
          Schedule Builder
        </h1>
      </div>
    </div>
  );
}
