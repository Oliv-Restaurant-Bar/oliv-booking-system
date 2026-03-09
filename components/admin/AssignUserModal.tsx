'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

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
    title = "Assign User",
    description = "Select a user to assign.",
    buttonText = "Apply",
    showUnassigned = true,
    icon = <UserPlus className="w-5 h-5 text-primary" />
}: AssignUserModalProps) {
    const [selectedUser, setSelectedUser] = useState(assignedTo);
    const [isSaving, setIsSaving] = useState(false);

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
            toast.success('User assigned successfully');
            onClose();
        } catch (error) {
            console.error('Error assigning user:', error);
            toast.error('Failed to assign user');
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
                                {title}
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
                            {description}
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

                                    {users.map(user => (
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
                            onClick={onClose}
                            disabled={isSaving || isLoading}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {buttonText}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
