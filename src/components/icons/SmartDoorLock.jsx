import React from 'react';

export default function SmartDoorLock({ size = 20, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
    >
      {/* ── Outer panel border (rounded rectangle frame) ── */}
      <rect x="2" y="1" width="12" height="26" rx="3" fill={color}/>

      {/* ── Inner panel inset ── */}
      <rect x="3.4" y="2.4" width="9.2" height="23.2" rx="2.2" fill="white" opacity="0.12"/>

      {/* ── Door handle bar (extending right) ── */}
      <rect x="13" y="10.5" width="12" height="3" rx="1.5" fill={color}/>

      {/* ── Handle attachment neck ── */}
      <rect x="11.5" y="9.5" width="2.5" height="5" rx="1.2" fill={color}/>

      {/* ── 2×2 Keypad squares ── */}
      <rect x="4.5" y="5"   width="3.4" height="3.4" rx="0.6" fill="white" opacity="0.90"/>
      <rect x="9.1" y="5"   width="3.4" height="3.4" rx="0.6" fill="white" opacity="0.90"/>
      <rect x="4.5" y="9.5" width="3.4" height="3.4" rx="0.6" fill="white" opacity="0.90"/>
      <rect x="9.1" y="9.5" width="3.4" height="3.4" rx="0.6" fill="white" opacity="0.90"/>

      {/* ── WiFi arcs (bottom of panel) ── */}
      {/* Outer arc */}
      <path d="M4.2 21.8 Q8.5 18.2 12.8 21.8"
        stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* Middle arc */}
      <path d="M5.8 23.2 Q8.5 21.0 11.2 23.2"
        stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.90"/>
      {/* Dot */}
      <circle cx="8.5" cy="25.2" r="0.9" fill="white" opacity="0.90"/>
    </svg>
  );
}
