'use client';

import React from 'react';
import { AlertTriangle, X, Trash2, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: string;
  confirmIcon?: 'delete' | 'check';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmButtonStyle = 'bg-destructive text-destructive-foreground hover:opacity-90',
  confirmIcon = 'delete'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const ConfirmIcon = confirmIcon === 'delete' ? Trash2 : Check;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Body with icon on left, content on right */}
          <div className="p-6 flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                {title}
              </h3>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                {message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <X className="w-4 h-4" />
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition-opacity flex items-center gap-2 ${confirmButtonStyle}`}
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <ConfirmIcon className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}