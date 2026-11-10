import React from 'react';

interface ForgeLogoProps {
  collapsed?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ForgeLogo: React.FC<ForgeLogoProps> = ({ collapsed = false, className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;

  return (
    <div className={`flex items-center gap-2.5 transition-all select-none ${className}`}>
      {/* Precision Geometric SVG Icon */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer faceted hull */}
          <polygon
            points="32,4 58,18 58,46 32,60 6,46 6,18"
            stroke="#7c3aed"
            strokeWidth="3.5"
            fill="#f5f3ff"
          />
          {/* Inner core */}
          <polygon
            points="32,13 49,23 49,41 32,51 15,41 15,23"
            stroke="#6366f1"
            strokeWidth="2"
            fill="#ede9fe"
          />
          {/* Facets */}
          <path d="M32 17 L44 24 L32 32 L20 24 Z" fill="#7c3aed" />
          <path d="M20 24 L32 32 L32 47 L20 39 Z" fill="#6d28d9" />
          <path d="M44 24 L32 32 L32 47 L44 39 Z" fill="#4f46e5" />
          <circle cx="32" cy="32" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Wordmark (hidden if collapsed) */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-charcoal-900 font-sans">
              FORGE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-primary bg-primary-subtle border border-primary-border">
              AI
            </span>
          </div>
          <span className="text-[10px] text-charcoal-500 font-normal tracking-normal mt-0.5">
            Software Workforce
          </span>
        </div>
      )}
    </div>
  );
};
