'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '../user/Button';
import { toast } from 'sonner';
import { useAdminTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

interface AssignUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    assignedTo: string;
    onAssign: (userId: string) => void;
    isLoading?: boolean;
    title?: string;
    description?: string;
    buttonText?: string;
    showUnassigned?: boolean;
    icon?: React.ReactNode;
}

export function AssignUserModal({
    isOpen,
    onClose,
    users,
    assignedTo,
    onAssign,
    isLoading = false,
    title = undefined,
    description = undefined,
    buttonText = undefined,
    showUnassigned = true,
    icon = <UserPlus className="w-5 h-5 text-primary" />
}: AssignUserModalProps) {
    const t = useAdminTranslation();
    const tCommon = useCommonTranslation();
    const [selectedUser, setSelectedUser] = useState(assignedTo);
    const [isSaving, setIsSaving] = useState(false);

    // Use translation defaults if props are not provided
    const modalTitle = title || t('assignUser.title');
    const modalDescription = description || t('assignUser.description');
    const modalButtonText = buttonText || t('assignUser.buttonText');

    useEffect(() => {
        setSelectedUser(assignedTo);
    }, [assignedTo]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onAssign(selectedUser);
            toast.success(t('assignUser.assignedSuccess'));
            onClose();
        } catch (error) {
            console.error('Error assigning user:', error);
            toast.error(t('assignUser.failedToAssign'));
        } finally {
            setIsSaving(false);
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
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {icon}
                            </div>
                            <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {modalTitle}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSaving || isLoading}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
                            {modalDescription}
                        </p>

                        {isLoading ? (
                            <div className="py-8 flex justify-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-foreground font-medium block" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                                    Select User
                                </label>
                                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                                    {showUnassigned && (
                                        <label
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedUser === ''
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                    -
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">Unassigned</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="assignUser"
                                                value=""
                                                checked={selectedUser === ''}
                                                onChange={(e) => setSelectedUser(e.target.value)}
                                                className="hidden"
                                            />
                                            {selectedUser === '' && <Check className="w-5 h-5 text-primary" />}
                                        </label>
                                    )}

                                    {users.filter(user => user.role !== 'read_only').map(user => (
                                        <label
                                            key={user.id}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedUser === user.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="radio"
                                                name="assignUser"
                                                value={user.id}
                                                checked={selectedUser === user.id}
                                                onChange={(e) => setSelectedUser(e.target.value)}
                                                className="hidden"
                                            />
                                            {selectedUser === user.id && <Check className="w-5 h-5 text-primary" />}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-end gap-3">
                        <Button
                            variant="secondary"
                            icon={X}
                            onClick={onClose}
                            disabled={isSaving || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            icon={isSaving ? undefined : Check}
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                        >
                            {isSaving ? tCommon('loading') : modalButtonText}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
