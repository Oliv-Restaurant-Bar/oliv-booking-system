'use client';

import * as React from 'react';
import { cn } from './utils';
import { AlertCircle } from 'lucide-react';

interface ValidatedTextareaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  error?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  helperText?: string;
  required?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical' | 'block';
}

/**
 * Enhanced Textarea component with validation and character counter
 *
 * @example
 * ```tsx
 * <ValidatedTextarea
 *   label="Notes"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   maxLength={1000}
 *   showCharacterCount
 *   rows={3}
 *   required
 * />
 * ```
 */
export function ValidatedTextarea({
  label,
  error,
  showCharacterCount = true,
  maxLength,
  helperText,
  required = false,
  resize = 'none',
  className,
  value,
  rows = 3,
  ...props
}: ValidatedTextareaProps) {
  const characterCount = (value && typeof value === 'string') ? value.length : 0;
  const isNearLimit = maxLength && characterCount >= maxLength * 0.9;
  const isAtLimit = maxLength && characterCount >= maxLength;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-foreground font-medium text-sm first-letter:uppercase">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          value={value}
          maxLength={maxLength}
          rows={rows}
          data-slot="textarea"
          className={cn(
            'resize-none border-input placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-ring/50',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
            'aria-invalid:border-destructive dark:bg-input/30',
            'flex field-sizing-content min-h-16 w-full rounded-md border',
            'bg-input-background px-3 py-2 text-base',
            'transition-[color,box-shadow] outline-none',
            'focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'md:text-sm',
            "w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary",
            error && 'border-destructive focus-visible:ring-destructive/20',
            resize === 'none' && 'resize-none',
            resize === 'both' && 'resize',
            resize === 'horizontal' && 'resize-x',
            resize === 'vertical' && 'resize-y',
            resize === 'block' && 'resize',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>

      {/* Helper Text, Error Message, and Character Count */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {error && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          )}
          {!error && helperText && (
            <p className="text-muted-foreground text-sm">{helperText}</p>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <div className="flex-shrink-0" translate="no">
            <p
              className={cn(
                'text-xs font-medium tabular-nums',
                isAtLimit
                  ? 'text-destructive'
                  : isNearLimit
                    ? 'text-yellow-600 dark:text-yellow-500'
                    : 'text-muted-foreground'
              )}
            >
              {characterCount} / {maxLength}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
