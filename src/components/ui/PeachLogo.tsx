import React from 'react';

interface PeachLogoProps {
  className?: string;
  size?: number;
}

export default function PeachLogo({ className = '', size = 32 }: PeachLogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}peach-logo.png.png`}
      alt="Peachstack logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
