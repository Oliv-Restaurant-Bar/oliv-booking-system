'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, CalendarDays, Edit, UtensilsCrossed, MessageSquare, Mail, Lock, Unlock, History, FileText, RefreshCw } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import { KitchenPdfActionModal } from './KitchenPdfActionModal';
import { KitchenPdfService, type KitchenPdfStatus } from '@/services/kitchen-pdf.service';
import { VenueService } from '@/services/venue.service';
import { toast } from 'sonner';
import { Permission, hasPermission } from '@/lib/auth/rbac';

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
    contactHistory?: Array<{ by: string; time: string; date: string; action: string }>;
    isLocked?: boolean;
    kitchenPdf?: KitchenPdfStatus;
    menuItems?: Array<{ item: string; category: string; quantity: string; price: string }>;
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
    const [comments, setComments] = useState<Array<{ by: string; time: string; date: string; action: string }>>(
        initialBooking?.contactHistory || []
    );
    const [newComment, setNewComment] = useState('');
    const [localStatus, setLocalStatus] = useState(initialBooking?.status || 'pending');
    const [allergies, setAllergies] = useState('');
    const [notes, setNotes] = useState(initialBooking?.notes || '');
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

    // Venue locations
    const [venueLocations, setVenueLocations] = useState<string[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string>(initialBooking?.event?.location || '');

    // Update local state when booking prop changes
    useEffect(() => {
        if (initialBooking) {
            setBooking(initialBooking);
            setComments(initialBooking.contactHistory || []);
            setLocalStatus(initialBooking.status || 'pending');
            const allergiesVal = initialBooking.allergies;
            setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
            setNotes(initialBooking.notes || '');
            setIsLocked(initialBooking.isLocked || false);
            setSelectedVenue(initialBooking.event?.location || '');
            setKitchenPdfStatus(initialBooking.kitchenPdf);
        }
    }, [initialBooking]);

    // Fetch booking data if not provided
    useEffect(() => {
        if (!initialBooking) {
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
                        setIsLocked(data.isLocked || false);
                        setSelectedVenue(data.event?.location || data.location || '');
                    }
                } catch (error) {
                    console.error('Error fetching booking:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchBooking();
        }
    }, [bookingId, initialBooking]);

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

    // Fetch admin users when modal opens
    useEffect(() => {
        if (isPdfActionModalOpen) {
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
    }, [isPdfActionModalOpen]);

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
        try {
            const response = await fetch(`/api/bookings/${booking.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.editSecret) {
                    const baseUrl = window.location.origin;
                    const editLink = `${baseUrl}/booking/${booking.id}/edit/${data.editSecret}`;
                    await navigator.clipboard.writeText(editLink);
                    toast.success('Edit link copied to clipboard!');
                    return;
                }

                const generateResponse = await fetch(`/api/bookings/${booking.id}/generate-secret`, { method: 'POST' });
                if (generateResponse.ok) {
                    const generateData = await generateResponse.json();
                    if (generateData.success && generateData.editSecret) {
                        const baseUrl = window.location.origin;
                        const editLink = `${baseUrl}/booking/${booking.id}/edit/${generateData.editSecret}`;
                        await navigator.clipboard.writeText(editLink);
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

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const now = new Date();
        const newCommentObj = {
            by: 'Admin',
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            action: newComment
        };
        setComments([...comments, newCommentObj]);
        setNewComment('');
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
            const allergyDetails = typeof allergies === 'string'
                ? (allergies ? allergies.split(',').map((a: string) => a.trim()).filter(Boolean) : [])
                : (Array.isArray(allergies) ? allergies : []);

            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    allergyDetails,
                    specialRequests: notes,
                    location: selectedVenue
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

    const handlePdfActionComplete = (action: 'admin' | 'external' | 'download', data?: { emails?: string[]; notes?: string }) => {
        const documentName = KitchenPdfService.getDocumentName(bookingId);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        let actionText = '';
        if (action === 'download') {
            actionText = `Downloaded kitchen sheet PDF: ${documentName}`;
        } else if (action === 'admin' || action === 'external') {
            const recipients = data?.emails?.join(', ') || '';
            actionText = `Kitchen sheet PDF sent to ${recipients || 'kitchen'}: ${documentName}`;

            setKitchenPdfStatus({
                documentName,
                sentStatus: 'sent',
                lastSentAt: now.toISOString(),
                sentBy: user?.name || 'Admin',
                sendAttempts: (kitchenPdfStatus?.sendAttempts || 0) + 1,
            });
        }

        const newCommentObj = {
            by: user?.name || 'Admin',
            time: timeStr,
            date: dateStr,
            action: actionText,
        };
        setComments([...comments, newCommentObj]);

        toast.success('Action completed successfully');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>Loading booking details...</p>
                </div>
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
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
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

                        {canEditBooking && (
                            <button
                                onClick={handleToggleLock}
                                disabled={lockLoading}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${isLocked
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                    : 'bg-secondary hover:bg-primary text-white'
                                    }`}
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                {lockLoading ? 'Loading...' : isLocked ? <><Unlock className="w-4 h-4" />Unlock</> : <><Lock className="w-4 h-4" />Lock</>}
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

                        {canEditBooking && (
                            <button
                                onClick={handleCopyEditLink}
                                className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer"
                                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                            >
                                <Send className="w-4 h-4" />
                                Copy Edit Link
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {isLocked && (
                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-amber-900 dark:text-amber-100">Booking is Locked</p>
                            <p className="text-sm text-amber-700 dark:text-amber-300">Clients cannot edit this booking. You can still make changes as an admin.</p>
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
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Name</label>
                                <input type="text" value={booking.customer.name} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Business</label>
                                <input type="text" value={booking.customer.business || '-'} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Email</label>
                                <input type="email" value={booking.customer.email} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Phone Number</label>
                                <input type="tel" value={booking.customer.phone} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Address</label>
                                <input type="text" value={booking.customer.address || '-'} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
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
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Event Date</label>
                                <input type="text" value={booking.event.date} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Time</label>
                                <input type="text" value={booking.event.time} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Guests</label>
                                <input type="text" value={booking.guests} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Occasion</label>
                                <input type="text" value={booking.event.occasion} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Amount (CHF)</label>
                                <input type="text" value={booking.amount} readOnly className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground" style={{ fontSize: 'var(--text-base)' }} />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Venue Location</label>
                                <select
                                    value={selectedVenue}
                                    onChange={(e) => setSelectedVenue(e.target.value)}
                                    disabled={!canEditBooking}
                                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                    style={{ fontSize: 'var(--text-base)' }}
                                >
                                    <option value="">Not Assigned</option>
                                    {venueLocations.map((loc: string) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <MessageSquare className="w-5 h-5 text-primary" /> Additional Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Allergies</label>
                                <textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} rows={2} disabled={!canEditBooking} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-75" style={{ fontSize: 'var(--text-base)' }} placeholder="Enter allergies separated by commas..." />
                            </div>
                            <div>
                                <label className="text-muted-foreground mb-2 block" style={{ fontSize: 'var(--text-small)' }}>Notes</label>
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={!canEditBooking} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-75" style={{ fontSize: 'var(--text-base)' }} placeholder="Enter special requests or notes..." />
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
                    </div>

                    {/* Comments Section */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <MessageSquare className="w-5 h-5 text-primary" /> Comments
                        </h3>
                        <div className="space-y-3">
                            {comments.map((contact, index) => (
                                <div key={index} className="bg-background border border-border rounded-lg p-4 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-[#9DAE91]" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>{contact.by.charAt(0)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-foreground font-semibold" style={{ fontSize: 'var(--text-base)' }}>{contact.by}</span>
                                            <span className="text-muted-foreground text-sm">• {contact.time} • {contact.date}</span>
                                        </div>
                                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{contact.action}</p>
                                    </div>
                                </div>
                            ))}
                            {canEditBooking && (
                                <div className="space-y-3 pt-2">
                                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." rows={3} className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" style={{ fontSize: 'var(--text-base)' }} />
                                    <button onClick={handleAddComment} className="w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                        <Send className="w-4 h-4" /> Add Comment
                                    </button>
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

                    {/* Copyright Footer */}
                    <div className="text-center pt-4 pb-1">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                            © 2026 Restaurant Oliv Restaurant & Bar
                        </p>
                    </div>
                </div>

                {/* Kitchen PDF Action Modal */}
                {isPdfActionModalOpen && booking && (
                    <KitchenPdfActionModal
                        isOpen={isPdfActionModalOpen}
                        onClose={() => setIsPdfActionModalOpen(false)}
                        onActionComplete={handlePdfActionComplete}
                        adminUsers={adminUsers}
                        isLoadingUsers={isAdminUsersLoading}
                        booking={{
                            ...booking,
                            allergies: Array.isArray(booking.allergies) ? booking.allergies.join(', ') : (booking.allergies || ''),
                            menuItems: booking.menuItems?.map(item => ({
                                ...item,
                                quantity: String(item.quantity)
                            }))
                        }}
                    />
                )}
            </div>
        </div>
    );
}
