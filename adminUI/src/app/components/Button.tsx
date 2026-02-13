import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  href?: string;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  icon: Icon,
  iconPosition = 'left',
  href,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-secondary hover:text-white',
    secondary: 'bg-accent text-foreground hover:bg-accent/80',
    outline: 'border-2 border-border bg-transparent text-foreground hover:bg-accent',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${widthClass} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={buttonClasses}
      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
      {...props}
    >
      {content}
    </button>
  );
}