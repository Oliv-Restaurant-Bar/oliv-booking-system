'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, CalendarDays, UtensilsCrossed, MessageSquare, Link, Lock, Unlock, History, FileText, RefreshCw, UserPlus, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusDropdown } from './StatusDropdown';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import { KitchenPdfActionModal } from './KitchenPdfActionModal';
import { KitchenPdfService, type KitchenPdfStatus } from '@/services/kitchen-pdf.service';
import { VenueService } from '@/services/venue.service';
import { toast } from 'sonner';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { AssignUserModal } from './AssignUserModal';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonBookingDetail } from '@/components/ui/skeleton-loaders';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { bookingKitchenNotesSchema, bookingCommentSchema } from '@/lib/validation/schemas';

export interface Booking {
    id: string;
    customer: {
        name: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatar: string;
        avatarColor: string;
        address: string;
        business?: string;
    };
    event: {
        date: string;
        time: string;
        occasion: string;
        location?: string;
    };
    guests: number;
    amount: string;
    status: string;
    notes?: string;
    allergies?: string | string[];
    contactHistory?: Array<{ by: string; time: string; date: string; action: string; type?: 'system' | 'manual' }>;
    isLocked?: boolean;
    kitchenPdf?: KitchenPdfStatus;
    menuItems?: Array<{ item: string; category: string; quantity: string; price: string }>;
    assignedTo?: { id: string; name: string; email: string } | null;
    kitchenNotes?: string;
    createdAt?: string;
}

interface AuditLog {
    id: string;
    actor_type: string;
    actor_label: string;
    admin_name: string | null;
    admin_email: string | null;
    created_at: string;
    changes: Array<{
        field: string;
        from: any;
        to: any;
    }>;
}

interface BookingDetailPageProps {
    bookingId: string;
    booking?: Booking | null;
    onBack?: () => void;
    user?: any;
}

export function BookingDetailPage({ bookingId, booking: initialBooking, onBack, user }: BookingDetailPageProps) {
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
    const [loading, setLoading] = useState(!initialBooking);
    const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string; type?: 'system' | 'manual' }>>(
        initialBooking?.contactHistory || []
    );
    const [newComment, setNewComment] = useState('');
    const [localStatus, setLocalStatus] = useState(initialBooking?.status || 'pending');
    const [allergies, setAllergies] = useState('');
    const [notes, setNotes] = useState(initialBooking?.notes || '');
    const [kitchenNotes, setKitchenNotes] = useState(initialBooking?.kitchenNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(initialBooking?.isLocked || false);
    const [lockLoading, setLockLoading] = useState(false);
    const [showAuditHistory, setShowAuditHistory] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [editLink, setEditLink] = useState<string | null>(null);

    const userRole = user?.role;
    const canEditBooking = hasPermission(userRole, Permission.EDIT_BOOKING);
    const canUpdateStatus = hasPermission(userRole, Permission.UPDATE_BOOKING_STATUS);
    const canViewAudit = hasPermission(userRole, Permission.VIEW_BOOKING_DETAILS);

    // Kitchen PDF state
    const [kitchenPdfStatus, setKitchenPdfStatus] = useState<KitchenPdfStatus | undefined>(
        initialBooking?.kitchenPdf
    );
    const [isPdfActionModalOpen, setIsPdfActionModalOpen] = useState(false);
    const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
    const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);

    const [venueLocations, setVenueLocations] = useState<string[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string>(initialBooking?.event?.location || '');
    const [assignedTo, setAssignedTo] = useState<string>((initialBooking as any)?.assignedTo?.id || '');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<{
        kitchenNotes?: string;
        comment?: string;
    }>({});

    // Update local state when booking prop changes
    useEffect(() => {
        if (initialBooking) {
            setBooking(initialBooking);
            setComments(initialBooking.contactHistory || []);
            setLocalStatus(initialBooking.status || 'pending');
            const allergiesVal = initialBooking.allergies;
            setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
            setNotes(initialBooking.notes || '');
            setKitchenNotes(initialBooking.kitchenNotes || '');
            setIsLocked(initialBooking.isLocked || false);
            setSelectedVenue(initialBooking.event?.location || '');
            setKitchenPdfStatus(initialBooking.kitchenPdf);
            setAssignedTo((initialBooking as any).assignedTo?.id || '');
        }
    }, [initialBooking]);

    // Always fetch fresh booking data from API to avoid stale list data
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await fetch(`/api/bookings/${bookingId}`);
                if (response.ok) {
                    const data = await response.json();
                    setBooking(data);
                    setComments(data.contactHistory || []);
                    setLocalStatus(data.status || 'pending');
                    const allergiesVal = data.allergies;
                    setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
                    setNotes(data.notes || '');
                    setKitchenNotes(data.kitchenNotes || '');
                    setIsLocked(data.isLocked || false);
                    setSelectedVenue(data.event?.location || data.location || '');
                    setAssignedTo(data.assignedTo?.id || '');
                    setKitchenPdfStatus(data.kitchenPdf);
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Fetch venue locations on mount
    useEffect(() => {
        const fetchVenues = async () => {
            const locations = await VenueService.getLocations();
            setVenueLocations(locations);
        };
        fetchVenues();
    }, []);

    // Fetch kitchen PDF status if not provided via prop
    useEffect(() => {
        if (bookingId && !initialBooking?.kitchenPdf) {
            const fetchKitchenPdfStatus = async () => {
                try {
                    const status = await KitchenPdfService.getSendHistory(bookingId);
                    if (status && status.length > 0) {
                        const latestStatus = status[0];
                        setKitchenPdfStatus({
                            documentName: latestStatus.documentName,
                            sentStatus: latestStatus.status === 'sent' ? 'sent' : 'failed',
                            lastSentAt: latestStatus.sentAt,
                            sentBy: latestStatus.sentBy,
                            sendAttempts: status.length,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching kitchen PDF status:', error);
                }
            };
            fetchKitchenPdfStatus();
        }
    }, [bookingId, initialBooking]);

    // Fetch admin users
    useEffect(() => {
        if (canEditBooking && adminUsers.length === 0 && !isAdminUsersLoading) {
            const fetchAdminUsers = async () => {
                setIsAdminUsersLoading(true);
                try {
                    const response = await fetch('/api/admin/users');
                    if (response.ok) {
                        const users = await response.json();
                        // Transform users to the format expected by the modal
                        const formattedUsers = users.map((u: any) => ({
                            id: u.id,
                            name: u.name || u.email?.split('@')[0],
                            email: u.email,
                            role: u.role || 'Admin',
                        }));
                        setAdminUsers(formattedUsers);
                    }
                } catch (error) {
                    console.error('Error fetching admin users:', error);
                } finally {
                    setIsAdminUsersLoading(false);
                }
            };
            fetchAdminUsers();
        }
    }, [canEditBooking, adminUsers.length, isAdminUsersLoading]);

    // Fetch audit history when shown
    useEffect(() => {
        if (showAuditHistory && bookingId) {
            fetchAuditHistory();
        }
    }, [showAuditHistory, bookingId]);

    const fetchAuditHistory = async () => {
        setAuditLoading(true);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/audit`);
            if (response.ok) {
                const data = await response.json();
                setAuditLogs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching audit history:', error);
        } finally {
            setAuditLoading(false);
        }
    };

    const handleToggleLock = async () => {
        if (!booking) return;
        setLockLoading(true);
        try {
            const action = isLocked ? 'unlock' : 'lock';
            const response = await fetch(`/api/bookings/${booking.id}/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                setIsLocked(!isLocked);
                if (showAuditHistory) fetchAuditHistory();
                toast.success(`Booking ${!isLocked ? 'locked' : 'unlocked'} successfully!`);
            } else {
                const errorData = await response.json();
                toast.error(`Failed to ${action} booking: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error toggling lock:', error);
            toast.error('Failed to toggle lock. Please try again.');
        } finally {
            setLockLoading(false);
        }
    };

    const handleCopyEditLink = async () => {
        if (!booking) return;

        const copyToClipboard = async (text: string) => {
            try {
                if (navigator?.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    throw new Error('Clipboard API not available');
                }
            } catch (error) {
                console.log('Using fallback clipboard approach', error);
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback clipboard copy failed:', err);
                } finally {
                    textArea.remove();
                }
            }
        };

        try {
            const response = await fetch(`/api/bookings/${booking.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.editSecret) {
                    const baseUrl = window.location.origin;
                    const editLink = `${baseUrl}/booking/${booking.id}/edit/${data.editSecret}`;
                    await copyToClipboard(editLink);
                    toast.success('Edit link copied to clipboard!');
                    return;
                }

                const generateResponse = await fetch(`/api/bookings/${booking.id}/generate-secret`, { method: 'POST' });
                if (generateResponse.ok) {
                    const generateData = await generateResponse.json();
                    if (generateData.success && generateData.editSecret) {
                        const baseUrl = window.location.origin;
                        const editLink = `${baseUrl}/booking/${booking.id}/edit/${generateData.editSecret}`;
                        await copyToClipboard(editLink);
                        toast.success('Edit link generated and copied to clipboard!');
                        return;
                    }
                }
            }
            toast.error('Unable to generate edit link. Please try again.');
        } catch (error) {
            console.error('Error copying edit link:', error);
            toast.error('Failed to copy edit link. Please try again.');
        }
    };

    const statusOptions = [
        { value: 'new', label: 'New', dotColor: '#8b5cf6' },
        { value: 'touchbase', label: 'Touchbase', dotColor: '#9DAE91' },
        { value: 'pending', label: 'Pending', dotColor: '#eab308' },
        { value: 'confirmed', label: 'Confirmed', dotColor: '#10b981' },
        { value: 'completed', label: 'Completed', dotColor: '#3b82f6' },
        { value: 'declined', label: 'Declined', dotColor: '#ef4444' },
    ];

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        // Validate comment
        const commentResult = bookingCommentSchema.safeParse(newComment.trim());
        if (!commentResult.success) {
            const errorMsg = commentResult.error.errors[0].message;
            setErrors({ ...errors, comment: errorMsg });
            toast.error(errorMsg);
            return;
        }

        try {
            const response = await fetch(`/api/bookings/${booking?.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newComment }),
            });

            if (response.ok) {
                const result = await response.json();
                const now = new Date();
                const newCommentObj = {
                    by: user?.name || 'Admin',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    action: newComment,
                    type: 'manual' as const
                };
                setComments([...comments, newCommentObj]);
                setNewComment('');
                setErrors({ ...errors, comment: undefined });
                toast.success('Comment added');
            } else {
                toast.error('Failed to save comment');
            }
        } catch (error) {
            console.error('Error saving comment:', error);
            toast.error('Failed to save comment');
        }
    };

    const handleStatusChange = async (value: string) => {
        if (!booking) return;
        setLocalStatus(value);
        try {
            await fetch('/api/bookings/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, status: value }),
            });
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSaveChanges = async () => {
        if (!booking) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kitchenNotes: kitchenNotes,
                    location: selectedVenue,
                    assignedTo: assignedTo || null
                }),
            });
            if (response.ok) {
                toast.success('Changes saved successfully');
                window.location.reload();
            } else {
                toast.error('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving booking changes:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePdfActionComplete = async (action: 'email' | 'download', data?: { emails?: string[]; notes?: string }) => {
        setIsPdfActionModalOpen(false);
        const documentName = KitchenPdfService.getDocumentName(bookingId);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        let actionText = '';
        if (action === 'download') {
            actionText = `Downloaded kitchen sheet PDF: ${documentName}`;

            // Persist the download action in kitchen logs
            KitchenPdfService.logAction({
                bookingId,
                documentName,
                sentBy: user?.name || 'Admin',
                status: 'sent',
                recipientEmail: 'Internal Download'
            }).catch(err => console.error('Failed to log PDF download:', err));

            // Update UI status immediately
            setKitchenPdfStatus({
                documentName,
                sentStatus: 'sent',
                lastSentAt: now.toISOString(),
                sentBy: user?.name || 'Admin',
                sendAttempts: (kitchenPdfStatus?.sendAttempts || 0) + 1,
            });
        } else {
            const recipients = data?.emails?.join(', ') || '';
            actionText = `Kitchen sheet PDF sent to ${recipients || 'kitchen'}: ${documentName}`;

            // Update UI status immediately
            setKitchenPdfStatus({
                documentName,
                sentStatus: 'sent',
                lastSentAt: now.toISOString(),
                sentBy: user?.name || 'Admin',
                sendAttempts: (kitchenPdfStatus?.sendAttempts || 0) + 1,
            });
        }

        try {
            // Persist the action as a general contact history comment
            await fetch(`/api/bookings/${bookingId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: actionText, type: 'system' }),
            });

            const newCommentObj = {
                by: user?.name || 'Admin',
                time: timeStr,
                date: dateStr,
                action: actionText,
                type: 'system' as const
            };
            setComments([...comments, newCommentObj]);
            toast.success(action === 'email' ? 'PDF sent successfully' : 'PDF downloaded successfully');
        } catch (error) {
            console.error('Error logging PDF action to history:', error);
            // Still update local UI so user sees the immediate action
            const newCommentObj = {
                by: user?.name || 'Admin',
                time: timeStr,
                date: dateStr,
                action: actionText,
                type: 'system' as const
            };
            setComments([...comments, newCommentObj]);
            toast.success(action === 'email' ? 'PDF sent' : 'PDF downloaded');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-background p-8">
                <SkeletonBookingDetail />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>Booking not found</p>
                    <button onClick={onBack || (() => router.back())} className="px-4 py-2 bg-primary text-white rounded-lg">
                        Back to Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Detail Header */}
            <div className="">
                <div className="max-w-full mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack || (() => router.back())}
                            className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-foreground"
                            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Bookings</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {kitchenPdfStatus && (
                            <KitchenPdfStatusBadge
                                status={kitchenPdfStatus.sentStatus}
                                lastSentAt={kitchenPdfStatus.lastSentAt}
                            />
                        )}

                        {canEditBooking && (
                            <button
                                onClick={() => {
                                    setIsAdminUsersLoading(true);
                                    setIsPdfActionModalOpen(true);
                                }}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                <FileText className="w-4 h-4" />
                                Kitchen Sheet
                            </button>
                        )}

                        {canViewAudit && (
                            <button
                                onClick={() => setShowAuditHistory(!showAuditHistory)}
                                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                <History className="w-4 h-4" />
                                {showAuditHistory ? 'Hide History' : 'Show History'}
                            </button>
                        )}

                        {canEditBooking && !isLocked && (
                            <button
                                onClick={handleCopyEditLink}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                <Link className="w-4 h-4" />
                                Copy Edit Link
                            </button>
                        )}

                        {canEditBooking && (
                            <button
                                onClick={() => setIsAssignModalOpen(true)}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2 cursor-pointer border border-border"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                <UserPlus className="w-4 h-4" />
                                {assignedTo ? adminUsers.find(u => u.id === assignedTo)?.name || 'Assigned' : 'Not Assigned Yet'}
                            </button>
                        )}

                        {canEditBooking && (
                            <button
                                onClick={handleToggleLock}
                                // disabled={lockLoading || isLocked}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${isLocked
                                    ? 'bg-amber-500 text-white cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground '
                                    }`}
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                {lockLoading ? 'Loading...' : isLocked ? <><Lock className="w-4 h-4" />UnLock</> : <><Lock className="w-4 h-4" />Lock</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-full mx-auto py-8">
                {isLocked && (
                    <div className="mb-6 p-4 bg-booking-locked/10 border border-booking-locked rounded-lg flex items-center gap-3">
                        <Lock className="w-5 h-5 text-booking-locked-lock dark:text-booking-locked-lock flex-shrink-0" />
                        <div>
                            <p className="font-medium text-booking-locked-text dark:text-booking-locked-text">Booking is Locked</p>
                            <p className="text-sm text-booking-locked-text dark:text-booking-locked-text">Clients cannot edit this booking. You can still make changes as an admin.</p>
                        </div>
                    </div>
                )}
                <div className='flex justify-between'>

                    <div className="mb-6">
                        <h1 className="text-foreground" style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }}>
                            Booking Details
                        </h1>
                        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
                            View and manage booking information
                        </p>
                    </div>

                    <div className="my-4 max-w-xs">
                        <StatusDropdown
                            options={statusOptions}
                            value={localStatus}
                            onChange={handleStatusChange}
                            placeholder="Select status"
                            className="w-full"
                            disabled={!canUpdateStatus}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <User className="w-5 h-5 text-primary" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Name</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Business</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.business || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Email</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Phone Number</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.phone}</p>
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Address</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.address || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                <CalendarDays className="w-5 h-5 text-primary" /> Event Details
                            </h3>
                            {kitchenPdfStatus && (
                                <KitchenPdfStatusBadge
                                    status={kitchenPdfStatus.sentStatus}
                                    lastSentAt={kitchenPdfStatus.lastSentAt}
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Event Date</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.event.date}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Time</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.event.time}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Guests</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.guests}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Occasion</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.event.occasion}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Amount (CHF)</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.amount}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Venue Location</label>
                                {canEditBooking ? (
                                    <select
                                        value={selectedVenue}
                                        onChange={(e) => setSelectedVenue(e.target.value)}
                                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        style={{ fontSize: 'var(--text-base)' }}
                                    >
                                        <option value="">Not Assigned</option>
                                        {venueLocations.map((loc: string) => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{selectedVenue || 'Not Assigned'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <UtensilsCrossed className="w-5 h-5 text-primary" /> Menu Items
                        </h3>
                        <div className="bg-background border border-border rounded-lg overflow-hidden overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Item</th>
                                        <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Category</th>
                                        <th className="px-4 py-3 text-left text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Quantity</th>
                                        <th className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {booking.menuItems && booking.menuItems.length > 0 ? (
                                        booking.menuItems.map((item: any, index: number) => (
                                            <tr key={index} className="border-t border-border">
                                                <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.item || item.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.category}</td>
                                                <td className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{item.price}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>No items selected</td></tr>
                                    )}
                                    {booking.menuItems && booking.menuItems.length > 0 && (
                                        <tr className="border-t-2 border-border bg-muted">
                                            <td colSpan={3} className="px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>Total Amount</td>
                                            <td className="px-4 py-3 text-right text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>{booking.amount}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-foreground mt-10 mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <MessageSquare className="w-5 h-5 text-primary" /> Notes for Kitchen Staff
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                {canEditBooking ? (
                                    <ValidatedTextarea
                                        value={kitchenNotes}
                                        onChange={(e) => {
                                            setKitchenNotes(e.target.value);
                                            if (errors.kitchenNotes) setErrors({ ...errors, kitchenNotes: undefined });
                                        }}
                                        rows={3}
                                        placeholder="Enter notes specifically for the kitchen staff (will be included in PDF)..."
                                        maxLength={1000}
                                        showCharacterCount
                                        error={errors.kitchenNotes}
                                        helperText="Optional"
                                    />
                                ) : (
                                    <div className="p-4 bg-muted/20 border border-border/50 rounded-lg text-foreground min-h-[80px] whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }}>
                                        {kitchenNotes || <span className="text-muted-foreground italic">No kitchen notes specified</span>}
                                    </div>
                                )}
                            </div>

                            {canEditBooking && (
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                                        style={{ fontSize: 'var(--text-base)' }}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <MessageSquare className="w-5 h-5 text-primary" /> Additional Information From Customer
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Allergies</label>
                                <p className="text-foreground font-medium whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }}>
                                    {allergies || <span className="text-muted-foreground italic font-normal">No allergies specified</span>}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">This field is filled by the client during booking</p>
                            </div>
                            <div className="space-y-1 text-pt-2">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>Notes</label>
                                <p className="text-foreground font-medium whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }}>
                                    {notes || <span className="text-muted-foreground italic font-normal">No notes specified</span>}
                                </p>
                                <p className="text-muted-foreground text-xs mt-1">This field is filled by the client during booking</p>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                <MessageSquare className="w-5 h-5 text-primary" /> Comments & Activity
                            </h3>
                            <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                                {comments.length} items
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 -mr-2 scrollbar-thin">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-muted-foreground text-sm">No comments or activity yet</p>
                                    </div>
                                ) : (
                                    comments.map((contact, index) => (
                                        <CommentItem key={index} contact={contact} />
                                    ))
                                )}
                            </div>

                            {canEditBooking && (
                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    <ValidatedTextarea
                                        value={newComment}
                                        onChange={(e) => {
                                            setNewComment(e.target.value);
                                            if (errors.comment) setErrors({ ...errors, comment: undefined });
                                        }}
                                        placeholder="Add a comment or internal note..."
                                        rows={3}
                                        maxLength={500}
                                        showCharacterCount
                                        error={errors.comment}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            style={{ fontSize: 'var(--text-base)' }}
                                        >
                                            <Send className="w-4 h-4" /> Add Comment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit History */}
                    {showAuditHistory && (
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                <History className="w-5 h-5 text-primary" /> Audit History
                            </h3>
                            {auditLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading audit history...</div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No changes recorded yet</div>
                            ) : (
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="bg-background border border-border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${log.actor_type === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                                                        {log.actor_label.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{log.actor_label}</p>
                                                        {log.admin_name && <p className="text-muted-foreground text-sm">{log.admin_email}</p>}
                                                    </div>
                                                </div>
                                                <span className="text-muted-foreground text-sm">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="space-y-2">
                                                {log.changes.map((change: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <span className="text-muted-foreground">{change.field.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}:</span>
                                                        <span className={`line-through ${change.from ? 'text-red-500' : 'text-muted-foreground'}`}>{change.from === null || change.from === undefined ? 'None' : String(change.from)}</span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <span className="text-green-500 font-medium">{change.to === null || change.to === undefined ? 'None' : String(change.to)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    {canEditBooking && (
                        <div className="pb-4">
                            <button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                </div>

                {/* Kitchen PDF Action Modal */}
                {isPdfActionModalOpen && booking && (
                    <KitchenPdfActionModal
                        isOpen={isPdfActionModalOpen}
                        onClose={() => setIsPdfActionModalOpen(false)}
                        onActionComplete={handlePdfActionComplete}
                        booking={{
                            ...booking,
                            allergies: typeof allergies === 'string' ? allergies : (Array.isArray(allergies) ? (allergies as string[]).join(', ') : ''),
                            notes: notes,
                            kitchenNotes: kitchenNotes,
                            menuItems: booking.menuItems?.map(item => ({
                                ...item,
                                quantity: String(item.quantity)
                            }))
                        }}
                    />
                )}

                {/* Assign User Modal */}
                {isAssignModalOpen && (
                    <AssignUserModal
                        isOpen={isAssignModalOpen}
                        onClose={() => setIsAssignModalOpen(false)}
                        users={adminUsers}
                        assignedTo={assignedTo}
                        onAssign={async (userId) => {
                            setAssignedTo(userId);
                            try {
                                const response = await fetch(`/api/bookings/${booking.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        assignedTo: userId || null
                                    }),
                                });
                                if (response.ok) {
                                    toast.success('Assignment updated successfully');
                                    window.location.reload();
                                } else {
                                    toast.error('Failed to update assignment');
                                }
                            } catch (error) {
                                console.error('Error updating assignment:', error);
                                toast.error('Failed to update assignment');
                            }
                        }}
                        isLoading={isAdminUsersLoading}
                    />
                )}
            </div>
        </div>
    );
}

function CommentItem({ contact }: { contact: any }) {
    const isSystem = contact.type === 'system';

    // Helper to generate consistent color from name
    const getAvatarColor = (name: string) => {
        const colors = [
            '#9DAE91', // Sage
            '#E8B4B8', // Dusty Rose
            '#B8D4E8', // Sky Blue
            '#F5E6A3', // Pale Gold
            '#C9B8E8', // Lavender
            '#E8B8D4'  // Soft Pink
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className={cn(
            "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
            isSystem
                ? "bg-muted/30 border-border/50"
                : "bg-background border-border hover:border-primary/30 hover:shadow-sm"
        )}>
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                style={{
                    backgroundColor: isSystem ? '#64748b' : getAvatarColor(contact.by),
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)'
                }}
            >
                {isSystem ? <Info className="w-5 h-5" /> : contact.by.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
                    <span className="text-foreground font-bold" style={{ fontSize: 'var(--text-base)' }}>
                        {contact.by}
                    </span>
                    {isSystem && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            System
                        </span>
                    )}
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5 ml-auto sm:ml-0">
                        <span className="hidden sm:inline">•</span>
                        {contact.date} at {contact.time}
                    </span>
                </div>
                <p className={cn(
                    "text-foreground leading-relaxed",
                    isSystem ? "text-muted-foreground italic" : "text-foreground font-medium"
                )} style={{ fontSize: 'var(--text-base)' }}>
                    {contact.action}
                </p>
            </div>
        </div>
    );
}
