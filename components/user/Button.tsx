import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  href?: string;
  to?: string; // Next.js link
  fullWidth?: boolean;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'sm',
  children,
  icon: Icon,
  iconPosition = 'left',
  href,
  to,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base styles with proper spacing and transitions
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  // Size variants - using padding for flexible height (52px for md)
  const sizeStyles = {
    sm: 'px-4 py-2.5',      // ~40px total height
    md: 'px-6 py-3.5',      // ~52px total height (default CTA size)
    lg: 'px-8 py-4',        // ~56px total height
  };

  // Variant styles with proper hover effects using design system colors
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground active:scale-[0.98]',
    outline: 'border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary active:scale-[0.98]',
  };

  // Icon size - 20px (w-5 h-5) is optimal for 52px buttons
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', // 20px icon for 52px button
    lg: 'w-5 h-5',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${disabledClass} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
      <span style={{ fontFamily: 'var(--font-family)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={buttonClasses}
        style={{
          textDecoration: 'none',
          fontFamily: 'var(--font-family)',
        }}
      >
        {content}
      </a>
    );
  }

  if (to && !disabled) {
    return (
      <Link
        href={to}
        className={buttonClasses}
        style={{
          textDecoration: 'none',
          fontFamily: 'var(--font-family)',
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      style={{
        fontFamily: 'var(--font-family)',
      }}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
}
