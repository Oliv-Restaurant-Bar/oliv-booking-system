'use client';

import React, { ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  icon: Icon, 
  title, 
  children, 
  footer,
  maxWidth = '2xl'
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-card border border-border rounded-xl shadow-xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col`}>
          {/* Header */}
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}