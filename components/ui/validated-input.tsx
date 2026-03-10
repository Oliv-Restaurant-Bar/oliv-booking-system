'use client';

import * as React from 'react';
import { cn } from './utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface ValidatedInputProps extends Omit<React.ComponentProps<'input'>, 'maxLength'> {
  label?: string;
  error?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  showPasswordToggle?: boolean;
  helperText?: string;
  required?: boolean;
}

/**
 * Enhanced Input component with validation, character counter, and optional password toggle
 *
 * @example
 * ```tsx
 * <ValidatedInput
 *   label="Name"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   maxLength={50}
 *   showCharacterCount
 *   error={errors.name}
 *   required
 * />
 * ```
 */
export function ValidatedInput({
  label,
  error,
  showCharacterCount = false,
  maxLength,
  showPasswordToggle = false,
  helperText,
  required = false,
  className,
  type,
  value,
  ...props
}: ValidatedInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = showPasswordToggle && type === 'password' && !showPassword ? 'password' :
    showPasswordToggle && type === 'password' && showPassword ? 'text' :
      type;

  const characterCount = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && characterCount >= maxLength * 0.9;
  const isAtLimit = maxLength && characterCount >= maxLength;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-foreground font-medium text-sm">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          value={value}
          maxLength={maxLength}
          data-slot="input"
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground',
            'selection:bg-primary selection:text-primary-foreground',
            'dark:bg-input/30 border-input flex h-9 w-full min-w-0',
            'rounded-md border px-3 py-1 text-base bg-input-background',
            'transition-[color,box-shadow] outline-none',
            'file:inline-flex file:h-7 file:border-0 file:bg-transparent',
            'file:text-sm file:font-medium',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            // Error state styles
            error && 'border-destructive focus-visible:ring-destructive/20',
            // Password toggle padding
            showPasswordToggle && 'pr-10',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />

        {/* Password Toggle Button */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Error Icon */}
        {error && !showPasswordToggle && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Helper Text, Error Message, and Character Count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          {error && (
            <p className="text-destructive text-sm flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}
          {!error && helperText && (
            <p className="text-muted-foreground text-sm">{helperText}</p>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <div className="flex-shrink-0">
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
