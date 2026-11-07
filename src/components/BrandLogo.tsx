import React from 'react';
export function BrandLogo({className = 'h-10 w-10'}: {className?: string}) {
  return <img src="/assets/branding/godavari-one-logo.png" alt="Godavari One" className={`${className} shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm`} />;
}
