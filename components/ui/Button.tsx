import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        outline: "border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "px-6 py-3.5",
        sm: "px-4 py-2.5",
        lg: "px-8 py-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  href?: string;
  to?: string;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant,
  size,
  icon: Icon,
  iconPosition = 'left',
  href,
  to,
  fullWidth,
  ...props
}: ButtonProps) {
  const IconComponent = Icon;
  
  const content = (
    <>
      {IconComponent && iconPosition === 'left' && <IconComponent className="w-4 h-4" />}
      <span>{props.children}</span>
      {IconComponent && iconPosition === 'right' && <IconComponent className="w-4 h-4" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}>
        {content}
      </a>
    );
  }

  if (to) {
    return (
      <Link href={to} className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
      {...props}
    >
      {content}
    </button>
  );
}

export { buttonVariants };
