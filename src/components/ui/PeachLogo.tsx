import React from 'react';

interface PeachLogoProps {
  className?: string;
  size?: number;
}

export default function PeachLogo({ className = '', size = 32 }: PeachLogoProps) {
  return (
    <picture>
      <source srcSet={`${import.meta.env.BASE_URL}peach-logo.webp`} type="image/webp" />
      <img
        src={`${import.meta.env.BASE_URL}peach-logo.png`}
        alt="Peach Stack logo"
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    </picture>
  );
}
