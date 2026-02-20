'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ 
  children, 
  title, 
  position = 'top',
  delay = 200 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Small delay for fade-in animation
      setTimeout(() => setShowTooltip(true), 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
    setTimeout(() => setIsVisible(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Position classes for tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes for tooltip
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 bg-secondary text-white rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-150 ${
            positionClasses[position]
          } ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            fontSize: 'var(--text-small)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {title}
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 border-secondary ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
