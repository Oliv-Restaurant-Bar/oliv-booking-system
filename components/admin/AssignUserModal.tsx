import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';

interface AssignUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    adminUsers: Array<{ id: string; name: string; email: string; role: string }>;
    assignedTo: string;
    onAssign: (userId: string) => void;
    isLoadingUsers?: boolean;
}

export function AssignUserModal({ isOpen, onClose, adminUsers, assignedTo, onAssign, isLoadingUsers }: AssignUserModalProps) {
    const [selectedUser, setSelectedUser] = useState(assignedTo);

    if (!isOpen) return null;

    const handleSave = () => {
        onAssign(selectedUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Assign Booking
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
                        Select a system user to assign this booking to. They will be responsible for managing it.
                    </p>

                    {isLoadingUsers ? (
                        <div className="py-8 flex justify-center">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="text-foreground font-medium block" style={{ fontSize: 'var(--text-base)' }}>
                                Assigned User
                            </label>
                            <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
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

                                {adminUsers.map(user => (
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

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-foreground font-medium rounded-lg hover:bg-accent transition-colors"
                        style={{ fontSize: 'var(--text-base)' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoadingUsers}
                        className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        style={{ fontSize: 'var(--text-base)' }}
                    >
                        Apply Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}
