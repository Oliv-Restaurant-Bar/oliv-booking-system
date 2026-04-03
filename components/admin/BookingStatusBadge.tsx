'use client';

import { Badge } from '@/components/ui/badge';
import { getBookingStatusConfig } from '@/lib/booking-status';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface BookingStatusBadgeProps {
    status: string;
    className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
    const config = getBookingStatusConfig(status);
    const t = useTranslations('bookingStatus');

    // Use translated label if available, fallback to config label
    const label = t.has(status.toLowerCase()) ? t(status.toLowerCase()) : config.label;

    return (
        <Badge
            className={cn(
                'flex items-center gap-1.5 border px-1.5 py-0.5 capitalize',
                config.bg,
                config.text,
                config.border,
                className
            )}
            title={label}
        >
            <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.dotColor }}
            />
            {label}
        </Badge>
    );
}
