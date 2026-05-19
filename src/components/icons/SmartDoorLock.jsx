import React from 'react';

export default function SmartDoorLock({ size = 20, color = 'currentColor', className = '' }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lock body / panel */}
      <rect x="2" y="1" width="12" height="22" rx="2.5" ry="2.5"/>

      {/* Keypad dots — 3 columns × 4 rows */}
      {[
        [5,4],[8,4],[11,4],
        [5,7],[8,7],[11,7],
        [5,10],[8,10],[11,10],
        [5,13],[8,13],[11,13],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill="white" opacity="0.9"/>
      ))}

      {/* Door handle ring */}
      <circle cx="7" cy="17.5" r="1.8" fill="white" opacity="0.9"/>
      <circle cx="7" cy="17.5" r="0.9" fill={color}/>

      {/* Door handle bar */}
      <rect x="8.5" y="16.8" width="8.5" height="1.4" rx="0.7" ry="0.7" fill="white" opacity="0.9"/>

      {/* Fingerprint / card reader square at bottom */}
      <rect x="5" y="20" width="2.5" height="2" rx="0.4" ry="0.4" fill="white" opacity="0.85"/>
    </svg>
  );
}
