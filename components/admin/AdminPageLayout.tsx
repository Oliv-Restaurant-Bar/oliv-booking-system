import { ReactNode } from 'react';

interface AdminPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AdminPageLayout({ children, className = '' }: AdminPageLayoutProps) {
  return (
    <div className={`px-4 md:px-8 pt-3 pb-8 ${className}`}>
      {children}
    </div>
  );
}
