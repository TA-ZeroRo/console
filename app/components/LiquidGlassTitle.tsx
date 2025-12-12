"use client";

import React from 'react';

interface LiquidGlassTitleProps {
  text: string;
  className?: string;
  fontSize?: string;
  margin?: string;
  enableFloat?: boolean;
  enableGlossy?: boolean;
  fontFamily?: string;
  fontWeight?: number;
}

export const LiquidGlassTitle: React.FC<LiquidGlassTitleProps> = ({
  text,
  className = '',
  fontSize = 'text-[9rem] md:text-[15rem]',
  margin = 'mb-24',
  enableFloat = true,
  enableGlossy = true,
  fontFamily = '"Nunito", sans-serif',
  fontWeight = 1000,
}) => {
  // 스펙큘러 하이라이트 (text-shadow로 프레넬 효과 시뮬레이션)
  const specularHighlight = `
    2px 2px 4px rgba(153, 192, 255, 0.4),
    -2px -2px 4px rgba(229, 253, 190, 0.4),
    1px 1px 2px rgba(195, 218, 255, 0.5),
    -1px -1px 2px rgba(247, 255, 226, 0.5),
    0 0 30px rgba(255, 255, 255, 0.3)
  `;

  // 글자별 liquid glass 스타일 (순수 텍스트 스타일만 사용)
  const letterStyle: React.CSSProperties = {
    fontFamily,
    fontWeight,
    color: 'transparent',
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(220,245,255,0.8) 40%, rgba(255,255,255,0.3) 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextStroke: '0.02em rgba(255,255,255,0.5)',
    textShadow: specularHighlight,
    filter: 'drop-shadow(0 12px 20px rgba(0,60,80,0.25))',
  };

  return (
    <div
      className={`animate-in fade-in zoom-in duration-1000 slide-in-from-top-10 ${margin} relative ${className}`}
      style={enableFloat ? { animation: 'float 6s ease-in-out infinite' } : undefined}
    >
      <div className={`${fontSize} leading-none tracking-tight select-none`}>
        {text.split('').map((char, index) => (
          <span key={index} style={letterStyle}>
            {char}
          </span>
        ))}
      </div>

      {enableGlossy && (
        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[70%] h-[30%] bg-gradient-to-b from-white/60 to-transparent rounded-full blur-2xl -z-10"></div>
      )}
    </div>
  );
};
