"use client";

import React from 'react';

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  textColor?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({ children, className = '', textColor }) => {
  // 스펙큘러 하이라이트 (inset box-shadow로 프레넬 효과 시뮬레이션)
  const specularHighlight = `
    inset 10px 10px 20px rgba(153, 192, 255, 0.15),
    inset 2px 2px 5px rgba(195, 218, 255, 0.25),
    inset -10px -10px 20px rgba(229, 253, 190, 0.15),
    inset -2px -2px 30px rgba(247, 255, 226, 0.25)
  `;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Glass Container - 블러 + 컬러필터 + 스펙큘러 */}
      <div
        className="relative rounded-2xl"
        style={{
          backdropFilter: 'blur(20px) contrast(80%) saturate(120%)',
          WebkitBackdropFilter: 'blur(20px) contrast(80%) saturate(120%)',
          boxShadow: specularHighlight,
        }}
      >
        {/* Text Layer */}
        <div
          className="relative z-10 select-none"
          style={textColor ? {
            color: textColor,
            WebkitTextStroke: '0.015em rgba(255,255,255,0.4)',
            filter: 'drop-shadow(0 15px 25px rgba(0,60,80,0.3))',
          } : {
            color: 'transparent',
            background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(220,245,255,0.7) 40%, rgba(255,255,255,0.2) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            filter: 'drop-shadow(0 15px 25px rgba(0,60,80,0.3))',
            WebkitTextStroke: '0.025em rgba(255,255,255,0.6)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
