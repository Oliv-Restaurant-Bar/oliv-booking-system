'use client';

import React, { useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '../user/Button';
import { toast } from 'sonner';
import { useAdminTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface DeleteBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
    isLoading?: boolean;
    bookingTitle?: string;
}

export function DeleteBookingModal({
    isOpen,
    onClose,
    onDelete,
    isLoading = false,
    bookingTitle = ''
}: DeleteBookingModalProps) {
    const t = useAdminTranslation();
    const tCommon = useCommonTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete();
            toast.success(t('deleteBooking.success'));
            onClose();
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error(t('deleteBooking.failedToDelete'));
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-destructive" />
                            </div>
                            <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {t('deleteBooking.title')}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isDeleting || isLoading}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="space-y-4">
                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                {t('deleteBooking.confirmMessage')}
                            </p>

                            {bookingTitle && (
                                <div className="bg-muted/50 border border-border rounded-lg p-3">
                                    <p className="text-sm text-muted-foreground">{t('deleteBooking.bookingLabel')}</p>
                                    <p className="text-foreground font-medium mt-1">{bookingTitle}</p>
                                </div>
                            )}

                            <p className="text-muted-foreground text-sm" style={{ fontSize: 'var(--text-small)' }}>
                                {t('deleteBooking.warningMessage')}
                            </p>

                            <ul className="text-sm text-destructive space-y-1 list-disc list-inside">
                                <li>{t('deleteBooking.consequence1')}</li>
                                <li>{t('deleteBooking.consequence2')}</li>
                                <li>{t('deleteBooking.consequence3')}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-end gap-3">
                        <Button
                            variant="secondary"
                            icon={X}
                            onClick={onClose}
                            disabled={isDeleting || isLoading}
                        >
                            {tCommon('cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            icon={isDeleting ? undefined : Trash2}
                            onClick={handleDelete}
                            disabled={isDeleting || isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? tCommon('loading') : t('deleteBooking.deleteButton')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
