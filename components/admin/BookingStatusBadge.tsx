'use client';

import { Badge } from '@/components/ui/badge';
import { getBookingStatusConfig } from '@/lib/booking-status';
import { cn } from '@/lib/utils';

interface BookingStatusBadgeProps {
    status: string;
    className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
    const config = getBookingStatusConfig(status);

    return (
        <Badge
            className={cn(
                'flex items-center gap-1.5 border capitalize',
                config.bg,
                config.text,
                config.border,
                className
            )}
        >
            <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.dotColor }}
            />
            {config.label}
        </Badge>
    );
}
