/**
 * Shared booking status configuration.
 * Single source of truth for all status badge colours across admin views.
 */

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
}

export const BOOKING_STATUS_CONFIG: Record<string, StatusConfig> = {
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: '#10b981',
  },
  touchbase: {
    label: 'Touchbase',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    dotColor: '#9DAE91',
  },
  new: {
    label: 'New',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: '#8b5cf6',
  },
  declined: {
    label: 'Declined',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dotColor: '#ef4444',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: '#3b82f6',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dotColor: '#eab308',
  },
  no_show: {
    label: 'No Show',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dotColor: '#f97316',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: '#64748b',
  },
};

export function getBookingStatusConfig(status: string): StatusConfig {
  return BOOKING_STATUS_CONFIG[status.toLowerCase()] ?? BOOKING_STATUS_CONFIG.pending;
}

export type KitchenPdfSentStatus = 'not_sent' | 'sent' | 'failed';

export interface PdfStatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const KITCHEN_PDF_STATUS_CONFIG: Record<KitchenPdfSentStatus, PdfStatusConfig> = {
  not_sent: {
    label: 'Not sent',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  sent: {
    label: 'Sent to Kitchen',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};
