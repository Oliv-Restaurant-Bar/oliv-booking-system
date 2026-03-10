import * as React from 'react';
import { cn } from '@/components/ui/utils';

interface CategoryPillProps {
  label: string;
  color?: string;
  variant?: 'default' | 'badge';
  className?: string;
}

export function CategoryPill({
  label,
  color,
  variant = 'default',
  className,
}: CategoryPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === 'badge' ? "border shadow-sm" : "",
        className
      )}
      style={{
        backgroundColor: color ? `${color}20` : undefined,
        color: color,
        borderColor: variant === 'badge' ? `${color}40` : undefined,
      }}
    >
      {label}
    </span>
  );
}
