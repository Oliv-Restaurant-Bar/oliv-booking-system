'use client';

/**
 * Kitchen PDF Status Badge
 * Visual indicator showing the send status of a kitchen PDF.
 * States: Not sent (gray), Sent (green), Failed (red).
 * Built on the shared Badge UI component.
 */

import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KITCHEN_PDF_STATUS_CONFIG, type KitchenPdfSentStatus } from '@/lib/booking-status';
import { cn } from '@/lib/utils';

interface KitchenPdfStatusBadgeProps {
  status: KitchenPdfSentStatus;
  lastSentAt?: string;
  /** compact: small chip style (for list/card views). default: pill with icon+label */
  compact?: boolean;
}

const statusIcons: Record<KitchenPdfSentStatus, React.ElementType> = {
  not_sent: Clock,
  sent: CheckCircle2,
  failed: XCircle,
};

export function KitchenPdfStatusBadge({
  status,
  compact = false,
}: KitchenPdfStatusBadgeProps) {
  const config = KITCHEN_PDF_STATUS_CONFIG[status];
  const Icon = statusIcons[status];

  if (compact) {
    return (
      <Badge
        className={cn(
          'flex items-center gap-1 border',
          config.bg,
          config.text,
          config.border
        )}
      >
        <Icon className="w-2.5 h-2.5" />
        PDF
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        'flex items-center gap-1.5 border px-3 py-1.5 rounded-full',
        config.bg,
        config.text,
        config.border
      )}
    >
      <Icon className="w-4 h-4" />
      <span style={{ fontSize: 'var(--text-small)' }}>{config.label}</span>
    </Badge>
  );
}
