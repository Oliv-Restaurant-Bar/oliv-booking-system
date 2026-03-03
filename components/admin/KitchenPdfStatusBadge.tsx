'use client';

/**
 * Kitchen PDF Status Badge
 * Visual indicator showing the send status of a kitchen PDF.
 * States: Not sent (gray), Sent (green), Failed (red).
 */

import { CheckCircle2, XCircle, Clock } from 'lucide-react';

// Format timestamp helper (inline for now, can move to service later)
const formatTimestamp = (isoTimestamp: string): string => {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};

interface KitchenPdfStatusBadgeProps {
  status: 'not_sent' | 'sent' | 'failed';
  lastSentAt?: string;
}

export function KitchenPdfStatusBadge({
  status,
  lastSentAt,
}: KitchenPdfStatusBadgeProps) {
  const config = {
    not_sent: {
      icon: Clock,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: 'Not sent',
    },
    sent: {
      icon: CheckCircle2,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Sent to Kitchen',
    },
    failed: {
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'Failed',
    },
  };

  const { icon: Icon, bg, text, border, label } = config[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${text} ${border}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium" style={{ fontSize: 'var(--text-small)' }}>
        {label}
      </span>
    </div>
  );
}
