"use client";

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  variant?: 'light' | 'dark';  // light: 어두운 배경용, dark: 밝은 배경용
  showText?: boolean;
  text?: string;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  showText = true,
  text = 'Zeroro Console',
  className = '',
  onClick,
}) => {
  const containerStyles = variant === 'light'
    ? 'bg-gradient-to-b from-white/90 via-white/60 to-white/30 backdrop-blur-xl border-white/60 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]'
    : 'bg-slate-900/5 border-slate-900/10';

  const textStyles = variant === 'light'
    ? 'text-slate-900'
    : 'text-slate-900';

  const interactiveStyles = onClick ? 'cursor-pointer hover:bg-white/20 active:scale-95' : '';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 w-fit ${containerStyles} ${interactiveStyles} ${className}`}
    >
      <Image src="/favicon.png" alt="Zeroro Logo" width={32} height={32} className="object-contain" />
      {showText && (
        <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${textStyles}`}>
          {text}
        </span>
      )}
    </div>
  );
};
