import React from 'react';

interface PeachLogoProps {
  className?: string;
  size?: number;
}

export default function PeachLogo({ className = '', size = 32 }: PeachLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Peachstack logo"
    >
      {/* Peach body */}
      <path
        d="M20 5C11.716 5 5 11.716 5 20C5 27.18 9.52 33.28 15.9 35.42C16.9 35.76 17.94 35.96 19 35.98V36H20H21V35.98C22.06 35.96 23.1 35.76 24.1 35.42C30.48 33.28 35 27.18 35 20C35 11.716 28.284 5 20 5Z"
        fill="#fb923c"
      />
      {/* Shine highlight */}
      <ellipse cx="14" cy="13" rx="4" ry="2.5" fill="white" fillOpacity="0.25" transform="rotate(-20 14 13)" />
      {/* Stack layers (like code/stack bars) */}
      <rect x="11" y="17" width="18" height="3" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="11" y="22" width="18" height="3" rx="1.5" fill="white" fillOpacity="0.95" />
      <rect x="11" y="27" width="12" height="3" rx="1.5" fill="white" fillOpacity="0.95" />
      {/* Leaf stem */}
      <path d="M20 5C20 5 21.5 1.5 25 2.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 5C20 5 18.5 1.5 16 2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
      {/* Small leaf */}
      <ellipse cx="23.5" cy="3.5" rx="2" ry="1.2" fill="#22c55e" transform="rotate(30 23.5 3.5)" />
    </svg>
  );
}
