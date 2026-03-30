'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, Users, MapPin, CalendarDays, UtensilsCrossed, MessageSquare, Link, Lock, Unlock, History, FileText, RefreshCw, UserPlus, CheckCircle2, Info, Pencil, X, Save, Bell, Mail, CreditCard, ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { StatusDropdown } from './StatusDropdown';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import { KitchenPdfActionModal } from './KitchenPdfActionModal';
import { KitchenPdfService, type KitchenPdfStatus } from '@/services/kitchen-pdf.service';
import { VenueService } from '@/services/venue.service';
import { Tooltip } from '@/components/user/Tooltip';
import { toast } from 'sonner';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { AssignUserModal } from './AssignUserModal';
import { DeleteBookingModal } from './DeleteBookingModal';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonBookingDetail } from '@/components/ui/skeleton-loaders';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { bookingKitchenNotesSchema, bookingCommentSchema } from '@/lib/validation/schemas';
import { useBookingTranslation, useCommonTranslation, useButtonTranslation } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { useLocale } from 'next-intl';
import { toReadableDate } from '@/lib/utils/date';
import { useSystemTimezone } from '@/lib/hooks/useSystemTimezone';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
        street?: string;
        plz?: string;
        location?: string;
        business?: string;
        reference?: string;
    };
    event: {
        date: string;
        time: string;
        rawDate?: string;
        rawTime?: string;
        occasion: string;
        location?: string;
        reference?: string;
    };
    guests: number;
    amount: string;
    rawAmount?: number;
    billingAddress?: string;
    billingReference?: string;
    paymentMethod?: string;
    status: string;
    notes?: string;
    allergies?: string | string[];
    contactHistory?: Array<BookingComment>;
    isLocked?: boolean;
    kitchenPdf?: KitchenPdfStatus;
    menuItems?: Array<{ id?: string; itemId?: string; item: string; category: string; quantity: string; rawQuantity?: number; unitPrice?: number; price: string; notes?: string; customerComment?: string; dietaryType?: 'veg' | 'non-veg' | 'vegan' | 'none'; pricingType?: 'per_person' | 'fixed' | 'flat_fee' | 'usage' }>;
    assignedTo?: { id: string; name: string; email: string } | null;
    kitchenNotes?: string;
    createdAt?: string;
    editSecret?: string;
    room?: string;
    checkins?: Array<{
        id: string;
        submittedAt: string;
        hasChanges: boolean;
        guestCountChanged: boolean;
        newGuestCount?: number;
        vegetarianCount?: number;
        veganCount?: number;
        nonVegetarianCount?: number;
        menuChanges?: string;
        additionalDetails?: string;
    }>;
}

interface BookingComment {
    by: string;
    time: string;
    date: string;
    action: string;
    type?: 'system' | 'manual';
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
    onBookingUpdated?: () => void;
    user?: any;
}

export function BookingDetailPage({ bookingId, booking: initialBooking, onBack, onBookingUpdated, user }: BookingDetailPageProps) {
    const router = useRouter();
    const t = useBookingTranslation();
    const commonT = useCommonTranslation();
    const buttonT = useButtonTranslation();
    const statusT = useTranslations('bookingStatus');
    const wizardT = useTranslations('wizard');
    const locale = useLocale();
    const { timezone } = useSystemTimezone();

    const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
    const [loading, setLoading] = useState(!initialBooking);
    const [comments, setComments] = useState<BookingComment[]>(initialBooking?.contactHistory || []);
    const [checkins, setCheckins] = useState<Booking['checkins']>(initialBooking?.checkins || []);

    const [isReminding, setIsReminding] = useState(false);
    const [isSendingCheckin, setIsSendingCheckin] = useState(false);
    const [isSendingUpdate, setIsSendingUpdate] = useState(false);


    const [newComment, setNewComment] = useState('');
    const [localStatus, setLocalStatus] = useState(initialBooking?.status || 'pending');
    const [allergies, setAllergies] = useState('');
    const [notes, setNotes] = useState(initialBooking?.notes || '');
    const [kitchenNotes, setKitchenNotes] = useState(initialBooking?.kitchenNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(initialBooking?.isLocked || false);
    const [showAuditHistory, setShowAuditHistory] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [editLink, setEditLink] = useState<string | null>(null);
    const [isAddingComment, setIsAddingComment] = useState(false);

    // Editing states
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [tempCustomer, setTempCustomer] = useState({
        name: '',
        business: '',
        email: '',
        phone: '',
        address: '',
        street: '',
        plz: '',
        location: '',
        reference: '',
        billingAddress: '',
        billingReference: '',
        paymentMethod: ''
    });

    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [tempEvent, setTempEvent] = useState({
        date: '',
        time: '',
        guests: 0,
        occasion: '',
        amount: 0,
        location: ''
    });

    // Derived value for conditional room selection
    const currentGuests = isEditingEvent ? tempEvent.guests : (booking?.guests || 0);

    const [isEditingMenu, setIsEditingMenu] = useState(false);
    const [tempMenuItems, setTempMenuItems] = useState<any[]>([]);

    const userRole = user?.role;
    const canEditBooking = hasPermission(userRole, Permission.EDIT_BOOKING);
    const canUpdateStatus = hasPermission(userRole, Permission.UPDATE_BOOKING_STATUS);

    const dietarySummary = useMemo(() => {
        const items = isEditingMenu ? tempMenuItems : (booking?.menuItems || []);

        const foodItems = items.filter(item =>
            item.category !== 'Beverages' &&
            item.category !== 'Add-ons' &&
            item.category !== 'Getränke' &&
            item.category !== 'Zusatzleistungen'
        );

        const pureVeg = foodItems.filter(i => i.dietaryType === 'veg');
        const vegan = foodItems.filter(i => i.dietaryType === 'vegan');
        const nonVeg = foodItems.filter(i => i.dietaryType === 'non-veg');

        const calculatePrice = (group: typeof items) => {
            return group.length > 0 ? Math.max(...group.map(i => i.unitPrice || 0)) : 0;
        };

        return {
            veg: { items: pureVeg, price: calculatePrice(pureVeg) },
            vegan: { items: vegan, price: calculatePrice(vegan) },
            nonVeg: { items: nonVeg, price: calculatePrice(nonVeg) }
        };
    }, [isEditingMenu, tempMenuItems, booking?.menuItems]);
    const canViewAudit = hasPermission(userRole, Permission.VIEW_BOOKING_DETAILS);
    const canManageUsers = hasPermission(userRole, Permission.MANAGE_USERS);
    const canDeleteBooking = hasPermission(userRole, Permission.DELETE_BOOKING);

    // Kitchen PDF state
    const [kitchenPdfStatus, setKitchenPdfStatus] = useState<KitchenPdfStatus | undefined>(
        initialBooking?.kitchenPdf
    );
    const [isPdfActionModalOpen, setIsPdfActionModalOpen] = useState(false);
    const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
    const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);

    const [venueLocations, setVenueLocations] = useState<string[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string>(initialBooking?.event?.location || '');
    const [selectedRoom, setSelectedRoom] = useState<string>(initialBooking?.room || '');
    const [assignedTo, setAssignedTo] = useState<string>((initialBooking as any)?.assignedTo?.id || '');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Track initial values to detect changes
    const [initialKitchenNotes, setInitialKitchenNotes] = useState<string>(initialBooking?.kitchenNotes || '');
    const [initialAssignedTo, setInitialAssignedTo] = useState<string>((initialBooking as any)?.assignedTo?.id || '');
    const [initialRoom, setInitialRoom] = useState<string>(initialBooking?.room || '');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

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
            setCheckins(initialBooking.checkins || []);
            setLocalStatus(initialBooking.status || 'pending');
            const allergiesVal = initialBooking.allergies;
            setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
            setNotes(initialBooking.notes || '');
            setKitchenNotes(initialBooking.kitchenNotes || '');
            setIsLocked(initialBooking.isLocked || false);
            setSelectedVenue(initialBooking.event?.location || '');
            setSelectedRoom(initialBooking.room || '');
            setKitchenPdfStatus(initialBooking.kitchenPdf);
            setAssignedTo((initialBooking as any).assignedTo?.id || '');
            // Update initial values for change tracking
            setInitialKitchenNotes(initialBooking.kitchenNotes || '');
            setInitialAssignedTo((initialBooking as any).assignedTo?.id || '');
            setInitialRoom(initialBooking.room || '');
            setHasUnsavedChanges(false);
        }
    }, [initialBooking]);

    // Track changes to kitchen notes and assignment
    useEffect(() => {
        const notesChanged = kitchenNotes !== initialKitchenNotes;
        const assignmentChanged = assignedTo !== initialAssignedTo;
        const roomChanged = selectedRoom !== initialRoom;
        setHasUnsavedChanges(notesChanged || assignmentChanged || roomChanged);
    }, [kitchenNotes, assignedTo, selectedRoom, initialKitchenNotes, initialAssignedTo, initialRoom]);

    // Always fetch fresh booking data from API to avoid stale list data
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await fetch(`/api/bookings/${bookingId}`, { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    setBooking(data);
                    setComments(data.contactHistory || []);
                    setCheckins(data.checkins || []);
                    setLocalStatus(data.status || 'pending');
                    const allergiesVal = data.allergies;
                    setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
                    setNotes(data.notes || '');
                    setKitchenNotes(data.kitchenNotes || '');
                    setIsLocked(data.isLocked || false);
                    setSelectedVenue(data.event?.location || data.location || '');
                    setSelectedRoom(data.room || '');
                    setAssignedTo(data.assignedTo?.id || '');
                    setKitchenPdfStatus(data.kitchenPdf);
                    // Update initial values for change tracking
                    setInitialKitchenNotes(data.kitchenNotes || '');
                    setInitialAssignedTo(data.assignedTo?.id || '');
                    setInitialRoom(data.room || '');
                    setHasUnsavedChanges(false);
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





    const statusOptions = [
        { value: 'new', label: statusT('new'), dotColor: '#8b5cf6' },
        { value: 'touchbase', label: statusT('touchbase'), dotColor: '#9DAE91' },
        { value: 'pending', label: statusT('pending'), dotColor: '#eab308' },
        { value: 'confirmed', label: statusT('confirmed'), dotColor: '#10b981' },
        { value: 'completed', label: statusT('completed'), dotColor: '#3b82f6' },
        { value: 'declined', label: statusT('declined'), dotColor: '#ef4444' },
        { value: 'no_show', label: statusT('no_show'), dotColor: '#f97316' },
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

        setIsAddingComment(true);
        try {
            const response = await fetch(`/api/bookings/${booking?.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newComment }),
            });

            if (response.ok) {
                const result = await response.json();
                const now = new Date();
                const newCommentObj: BookingComment = {
                    by: user?.name || 'Admin',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    action: newComment,
                    type: 'manual' as const
                };
                setComments([...comments, newCommentObj]);
                setNewComment('');
                setErrors({ ...errors, comment: undefined });
                toast.success(t('toast.commentAdded'));
            } else {
                toast.error(t('toast.saveFailed'));
            }
        } catch (error) {
            console.error('Error saving comment:', error);
            toast.error(t('toast.saveFailed'));
        } finally {
            setIsAddingComment(false);
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
            toast.success(t('toast.statusUpdated'));
            onBookingUpdated?.();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(t('toast.statusUpdateFailed'));
        }
    };

    const handleSendReminder = async () => {
        setIsReminding(true);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/remind`, { method: 'POST' });
            if (response.ok) {
                toast.success(t('toast.reminderSent'));
            } else {
                const error = await response.json();
                toast.error(error.error || t('toast.failedToSendReminder'));
            }
        } catch (error) {
            toast.error(t('toast.failedToSendReminder'));
        } finally {
            setIsReminding(false);
        }
    };

    const handleSendCheckin = async () => {
        setIsSendingCheckin(true);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/send-checkin`, { method: 'POST' });
            if (response.ok) {
                toast.success(t('toast.checkinSent'));
            } else {
                const error = await response.json();
                toast.error(error.error || t('toast.failedToSendCheckin'));
            }
        } catch (error) {
            toast.error(t('toast.failedToSendCheckin'));
        } finally {
            setIsSendingCheckin(false);
        }
    };

    const handleSendUpdate = async () => {
        if (!booking) return;
        setIsSendingUpdate(true);
        try {
            // Generate PDF
            const { generateBookingPdf } = await import('@/lib/utils/pdf-generator');

            const pdfData = {
                id: booking.id,
                customerName: booking.customer.name,
                business: booking.customer.business,
                eventDate: booking.event.date,
                eventTime: booking.event.time,
                guestCount: booking.guests,
                occasion: booking.event.occasion,
                location: selectedVenue || booking.event.location,
                billingAddress: booking.billingAddress,
                items: (booking.menuItems || []).map((item: any, idx: number) => {
                    const qty = parseInt(item.quantity) || booking.guests;
                    const uPrice = Number(item.unitPrice) || 0;
                    return {
                        id: item.id || `item-${idx}`,
                        name: item.item,
                        category: item.category,
                        quantity: qty,
                        unitPrice: uPrice,
                        totalPrice: qty * uPrice,
                        pricingType: item.pricingType || 'per_person',
                        notes: item.notes,
                        customerComment: item.customerComment,
                        dietaryType: item.dietaryType || 'none',
                    };
                }),
                allergies: Array.isArray(booking.allergies) ? booking.allergies.join(', ') : booking.allergies,
                specialRequests: booking.notes,
                kitchenNotes: booking.kitchenNotes,
                estimatedTotal: booking.rawAmount || 0
            };

            const doc = await generateBookingPdf(pdfData, 'offer');

            // Convert PDF to Base64
            const arrayBuffer = doc.output('arraybuffer');
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64Content = btoa(binary);

            // Send via API
            const response = await fetch(`/api/bookings/${bookingId}/send-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfBase64: base64Content }),
            });

            if (response.ok) {
                toast.success(t('toast.updateSent'));
            } else {
                const error = await response.json();
                toast.error(error.error || t('toast.failedToSendUpdate'));
            }
        } catch (error) {
            console.error('Error sending update:', error);
            toast.error(t('toast.failedToSendUpdate'));
        } finally {
            setIsSendingUpdate(false);
        }
    };


    const handleVenueChange = (value: string) => {
        setTempEvent(prev => ({ ...prev, location: value }));
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
                    assignedTo: assignedTo || null,
                    room: selectedRoom,
                    location: selectedVenue
                }),
            });
            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                // Update initial values to match current values
                setInitialKitchenNotes(kitchenNotes);
                setInitialAssignedTo(assignedTo);
                setHasUnsavedChanges(false);
                onBookingUpdated?.();
                // Refresh page after a short delay to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                toast.error(t('toast.saveFailed'));
            }
        } catch (error) {
            console.error('Error saving booking changes:', error);
            toast.error(t('toast.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!booking || !user) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUserId: user.id,
                    adminUserName: user.name || user.email
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(t('toast.deleteSuccess'));
                // Redirect to bookings list after successful deletion
                router.push('/admin/bookings');
            } else {
                toast.error(result.error || t('toast.deleteFailed'));
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            toast.error(t('toast.deleteFailed'));
        } finally {
            setIsDeleting(false);
        }
    };

    const updateFieldInNotes = (notes: string, field: string, value: string) => {
        const regex = new RegExp(`^${field}: .*$`, 'm');
        const fieldLine = `${field}: ${value || 'N/A'}`;
        if (notes.match(regex)) {
            return notes.replace(regex, fieldLine);
        } else {
            return notes + (notes.endsWith('\n') || !notes ? '' : '\n') + fieldLine;
        }
    };

    const handleEditCustomer = () => {
        if (!booking) return;
        setTempCustomer({
            name: booking.customer.name,
            business: booking.customer.business || '',
            email: booking.customer.email,
            phone: booking.customer.phone,
            address: booking.customer.address || '',
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingAddress: booking.billingAddress || '',
            billingReference: booking.billingReference || '',
            paymentMethod: booking.paymentMethod || ''
        });
        setIsEditingCustomer(true);
    };

    const handleCancelCustomer = () => {
        setIsEditingCustomer(false);
    };

    const handleEditAddress = () => {
        if (!booking) return;
        setTempCustomer({
            name: booking.customer.name,
            business: booking.customer.business || '',
            email: booking.customer.email,
            phone: booking.customer.phone,
            address: booking.customer.address || '',
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingAddress: booking.billingAddress || '',
            billingReference: booking.billingReference || '',
            paymentMethod: booking.paymentMethod || ''
        });
        setIsEditingAddress(true);
    };

    const handleCancelAddress = () => {
        setIsEditingAddress(false);
    };

    const handleEditPayment = () => {
        if (!booking) return;
        setTempCustomer({
            name: booking.customer.name,
            business: booking.customer.business || '',
            email: booking.customer.email,
            phone: booking.customer.phone,
            address: booking.customer.address || '',
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingAddress: booking.billingAddress || '',
            billingReference: booking.billingReference || '',
            paymentMethod: booking.paymentMethod || ''
        });
        setIsEditingPayment(true);
    };

    const handleCancelPayment = () => {
        setIsEditingPayment(false);
    };

    const performSaveCustomer = async () => {
        if (!booking) return false;
        setIsSaving(true);
        try {
            // Construct updated internal notes
            let newInternalNotes = booking.notes || '';

            // Update all granular fields in internal notes for parsing consistency
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Business', tempCustomer.business);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Street', tempCustomer.street);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'PLZ', tempCustomer.plz);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Location', tempCustomer.location);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Reference', tempCustomer.reference);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Reference', tempCustomer.billingReference);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Payment Method', tempCustomer.paymentMethod);

            // Also update the legacy Address field for compatibility
            const fullAddress = [tempCustomer.street, tempCustomer.plz, tempCustomer.location].filter(Boolean).join(', ');
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Address', fullAddress);

            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        name: tempCustomer.name,
                        email: tempCustomer.email,
                        phone: tempCustomer.phone
                    },
                    internalNotes: newInternalNotes,
                    billingAddress: tempCustomer.billingAddress
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                onBookingUpdated?.();
                // Refresh page after a short delay to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 100);
                return true;
            } else {
                toast.error(t('toast.saveFailed'));
                return false;
            }
        } catch (error) {
            console.error('Error saving customer info:', error);
            toast.error(t('toast.saveFailed'));
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveCustomer = async () => {
        const success = await performSaveCustomer();
        if (success) setIsEditingCustomer(false);
    };

    const handleSaveAddress = async () => {
        const success = await performSaveCustomer();
        if (success) setIsEditingAddress(false);
    };

    const handleSavePayment = async () => {
        const success = await performSaveCustomer();
        if (success) setIsEditingPayment(false);
    };

    const handleEditEvent = () => {
        if (!booking) return;

        // Ensure date is in YYYY-MM-DD format for the native picker
        let displayDate = booking.event.rawDate || '';
        if (!displayDate && booking.event.date) {
            const parsed = new Date(booking.event.date);
            if (!isNaN(parsed.getTime())) {
                displayDate = parsed.toISOString().split('T')[0];
            }
        }

        setTempEvent({
            date: displayDate,
            time: booking.event.rawTime || booking.event.time,
            guests: booking.guests,
            occasion: booking.event.occasion,
            amount: booking.rawAmount || 0,
            location: selectedVenue || booking.event.location || ''
        });
        setIsEditingEvent(true);
    };

    const handleCancelEvent = () => {
        setIsEditingEvent(false);
    };

    const handleSaveEvent = async () => {
        if (!booking) return;
        setIsSaving(true);
        try {
            // Construct updated internal notes
            let newInternalNotes = booking.notes || '';
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Occasion', tempEvent.occasion);

            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventDate: tempEvent.date,
                    eventTime: tempEvent.time,
                    guestCount: tempEvent.guests,
                    estimatedTotal: tempEvent.amount,
                    internalNotes: newInternalNotes,
                    allergyDetails: allergies,
                    specialRequests: notes,
                    location: tempEvent.location
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                setSelectedVenue(tempEvent.location);
                setIsEditingEvent(false);
                onBookingUpdated?.();
                // Refresh page after a short delay to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                toast.error(t('toast.saveFailed'));
            }
        } catch (error) {
            console.error('Error saving event details:', error);
            toast.error(t('toast.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditMenu = () => {
        if (!booking || !booking.menuItems) return;
        setTempMenuItems(booking.menuItems.map(item => {
            // Parse quantity string to extract the number (e.g., "50 guests" -> 50, "100" -> 100)
            let parsedQuantity = item.rawQuantity || 0;
            if (!parsedQuantity && item.quantity) {
                const match = item.quantity.match(/^(\d+)/);
                if (match) {
                    parsedQuantity = parseInt(match[1], 10);
                }
            }
            return {
                ...item,
                rawQuantity: parsedQuantity
            };
        }));
        setIsEditingMenu(true);
    };

    const handleCancelMenu = () => {
        setIsEditingMenu(false);
    };

    const handleSaveMenu = async () => {
        if (!booking) return;
        setIsSaving(true);
        try {
            const selectedItems = tempMenuItems.map(item => item.itemId);
            const itemQuantities: Record<string, number> = {};
            tempMenuItems.forEach(item => {
                itemQuantities[item.itemId!] = item.rawQuantity;
            });

            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedItems,
                    itemQuantities
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                setIsEditingMenu(false);
                onBookingUpdated?.();
                // Refresh page after a short delay to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                toast.error(t('toast.saveFailed'));
            }
        } catch (error) {
            console.error('Error saving menu items:', error);
            toast.error(t('toast.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditItems = () => {
        if (!booking || !booking.editSecret) {
            toast.error("Edit mode not available for this booking (Secret missing)");
            return;
        }

        // Store credentials in localStorage with a short-lived timestamp
        // This allows the new tab to pick them up without exposing them in the URL
        localStorage.setItem('temp_edit_id', booking.id);
        localStorage.setItem('temp_edit_secret', booking.editSecret);
        localStorage.setItem('temp_edit_timestamp', Date.now().toString());
        localStorage.setItem('temp_edit_is_admin', 'true'); // Flag to indicate admin edit

        // Redirect to wizard with edit mode flag (creds will be picked up from localStorage)
        const url = `/wizard?edit=true`;
        router.push(url);
    };

    const handlePdfActionComplete = async (action: 'email' | 'download', data?: { emails?: string[]; notes?: string }) => {
        setIsPdfActionModalOpen(false);
        const customerName = booking?.customer?.name || 'Unknown';
        const documentName = `Booking - ${customerName}`;
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

            const newCommentObj: BookingComment = {
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
            const newCommentObj: BookingComment = {
                by: user?.name || 'Admin',
                time: timeStr,
                date: dateStr,
                action: actionText,
                type: 'system' as const
            };
            setComments([...comments, newCommentObj]);
            toast.success(t(action === 'email' ? 'toast.pdfSentSuccess' : 'toast.pdfDownloadSuccess'));
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
                    <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>{t('noBookings')}</p>
                    <button onClick={onBack || (() => router.back())} className="px-4 py-2 bg-primary text-white rounded-lg">
                        {t('backToBookings')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Detail Header */}
            <div className="px-6 py-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack || (() => router.back())}
                        className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-foreground"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t('backToBookings')}</span>
                    </button>
                </div>
            </div>

            {/* Main Content Container - Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-full mx-auto">
                {/* Left Column - Content (75% on desktop, 100% on mobile) */}
                <div className="flex-1 lg:max-w-[75%] w-full">
                    {isLocked && (
                        <div className="mb-6 p-4 bg-booking-locked/10 border border-booking-locked rounded-lg flex items-center gap-3">
                            <Lock className="w-5 h-5 text-booking-locked-lock dark:text-booking-locked-lock flex-shrink-0" />
                            <div>
                                <p className="font-medium text-booking-locked-text dark:text-booking-locked-text">{t('lockedMessage')}</p>
                                <p className="text-sm text-booking-locked-text dark:text-booking-locked-text">{t('lockedDescription')}</p>
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue="event-details" className="w-full">
                        <TabsList className="mb-6 w-full flex flex-wrap gap-2">
                            <TabsTrigger value="event-details" className="flex-1 min-w-max px-3 py-2 text-sm sm:text-base">Event Details</TabsTrigger>
                            <TabsTrigger value="menu-details" className="flex-1 min-w-max px-3 py-2 text-sm sm:text-base">Menu Details</TabsTrigger>
                            <TabsTrigger value="comments-activities" className="flex-1 min-w-max px-3 py-2 text-sm sm:text-base">Comments & Activities</TabsTrigger>
                            <TabsTrigger value="requests" className="flex-1 min-w-max px-3 py-2 text-sm sm:text-base">Requests</TabsTrigger>
                        </TabsList>

                        {/* Event Details Tab */}
                        <TabsContent value="event-details" className="space-y-4 sm:space-y-6">
                            {/* Customer Information */}
                            {/* Group 1: Kontaktinformationen */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        {wizardT('sections.contactInformation')}
                                    </h3>
                                    {canEditBooking && !isLocked && !isEditingCustomer && (
                                        <button
                                            onClick={handleEditCustomer}
                                            className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>{buttonT('edit')}</span>
                                        </button>
                                    )}
                                    {isEditingCustomer && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCancelCustomer}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <X className="w-4 h-4" />
                                                <span>{buttonT('cancel')}</span>
                                            </button>
                                            <button
                                                onClick={handleSaveCustomer}
                                                disabled={isSaving}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-green-600 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <Save className="w-4 h-4" />
                                                <span>{buttonT('save')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.name')}</label>
                                        {isEditingCustomer ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.name}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, name: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.business')}</label>
                                        {isEditingCustomer ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.business}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, business: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.business || '-'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.email')}</label>
                                        {isEditingCustomer ? (
                                            <input
                                                type="email"
                                                value={tempCustomer.email}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, email: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.telephone')}</label>
                                        {isEditingCustomer ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.phone}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, phone: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Group 2: Adresse */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-primary" />
                                        </div>
                                        {wizardT('sections.address')}
                                    </h3>
                                    {canEditBooking && !isLocked && !isEditingAddress && (
                                        <button
                                            onClick={handleEditAddress}
                                            className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>{buttonT('edit')}</span>
                                        </button>
                                    )}
                                    {isEditingAddress && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCancelAddress}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <X className="w-4 h-4" />
                                                <span>{buttonT('cancel')}</span>
                                            </button>
                                            <button
                                                onClick={handleSaveAddress}
                                                disabled={isSaving}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-green-600 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <Save className="w-4 h-4" />
                                                <span>{buttonT('save')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.street')}</label>
                                        {isEditingAddress ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.street}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, street: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.street || '-'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.plz')}</label>
                                        {isEditingAddress ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.plz}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, plz: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.plz || '-'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.location')}</label>
                                        {isEditingAddress ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.location}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, location: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.location || '-'}</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.reference')}</label>
                                        {isEditingAddress ? (
                                            <input
                                                type="text"
                                                value={tempCustomer.reference}
                                                onChange={(e) => setTempCustomer({ ...tempCustomer, reference: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.reference || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CalendarDays className="w-4 h-4 text-primary" />
                                        </div>
                                        {wizardT('sections.eventDetails')}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {/* {kitchenPdfStatus && !isEditingEvent && (
                                            <KitchenPdfStatusBadge
                                                status={kitchenPdfStatus.sentStatus}
                                                lastSentAt={kitchenPdfStatus.lastSentAt}
                                            />
                                        )} */}
                                        {canEditBooking && !isLocked && !isEditingEvent && (
                                            <button
                                                onClick={handleEditEvent}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>{buttonT('edit')}</span>
                                            </button>
                                        )}
                                        {isEditingEvent && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCancelEvent}
                                                    className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>{buttonT('cancel')}</span>
                                                </button>
                                                <button
                                                    onClick={handleSaveEvent}
                                                    disabled={isSaving}
                                                    className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-green-600 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>{buttonT('save')}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.eventDate')}</label>
                                        {isEditingEvent ? (
                                            <input
                                                type="date"
                                                value={tempEvent.date}
                                                onChange={(e) => setTempEvent({ ...tempEvent, date: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={booking.event.date}>{booking.event.date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.eventTime')}</label>
                                        {isEditingEvent ? (
                                            <input
                                                type="time"
                                                value={tempEvent.time}
                                                onChange={(e) => setTempEvent({ ...tempEvent, time: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={booking.event.time}>{booking.event.time}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.guestCount')}</label>
                                        {isEditingEvent ? (
                                            <input
                                                type="number"
                                                value={tempEvent.guests}
                                                onChange={(e) => setTempEvent({ ...tempEvent, guests: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={booking.guests.toString()} translate="no">
                                                <span>{booking.guests}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.occasion')}</label>
                                        {isEditingEvent ? (
                                            <input
                                                type="text"
                                                value={tempEvent.occasion}
                                                onChange={(e) => setTempEvent({ ...tempEvent, occasion: e.target.value })}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={booking.event.occasion}>{booking.event.occasion}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('amount')} (CHF)</label>
                                        <p className="text-foreground font-medium py-1" style={{ fontSize: 'var(--text-base)' }} title={booking.amount} translate="no">
                                            <span>{booking.amount}</span>
                                        </p>
                                    </div>
                                    {/* <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('venueLocation')}</label>
                                        {isEditingEvent ? (
                                            <select
                                                value={tempEvent.location}
                                                onChange={(e) => handleVenueChange(e.target.value)}
                                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            >
                                                <option value="">{t('notAssigned')}</option>
                                                {venueLocations.map((loc: string) => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{selectedVenue || t('notAssigned')}</p>
                                        )}
                                    </div> */}
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.room')}</label>
                                        {isEditingEvent ? (
                                            <select
                                                value={selectedRoom.toLowerCase()}
                                                onChange={(e) => setSelectedRoom(e.target.value)}
                                                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            >
                                                <option value="">{t('notAssigned')}</option>
                                                {currentGuests < 50 && (
                                                    <option value="eg">EG</option>
                                                )}
                                                {currentGuests >= 30 && (
                                                    <>
                                                        <option value="ug1">UG1</option>
                                                        <option value="ug1_exklusiv">UG1 Exclusive</option>
                                                    </>
                                                )}
                                            </select>
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                {selectedRoom ? selectedRoom.toUpperCase() : t('notAssigned')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* {canEditBooking && (
                            <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving || !hasUnsavedChanges}
                                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                                    style={{ fontSize: 'var(--text-base)' }}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )} */}
                            </div>

                            {/* Group 4: Spezielle Wünsche */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Info className="w-4 h-4 text-primary" />
                                        </div>
                                        {wizardT('sections.specialRequests')}
                                    </h3>
                                    {canEditBooking && !isLocked && !isEditingEvent && (
                                        <button
                                            onClick={handleEditEvent}
                                            className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>{buttonT('edit')}</span>
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('allergies')}</label>
                                        {isEditingEvent ? (
                                            <input
                                                type="text"
                                                value={allergies}
                                                onChange={(e) => setAllergies(e.target.value)}
                                                placeholder={wizardT('placeholders.specialRequests')}
                                                className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.allergies || '-'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('internalInstructions')}</label>
                                        {isEditingEvent ? (
                                            <ValidatedTextarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                style={{ fontSize: 'var(--text-base)' }}
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="text-foreground font-medium whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }}>{booking.notes || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Group 5: Zahlungsmöglichkeiten */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-4 h-4 text-primary" />
                                        </div>
                                        {wizardT('sections.paymentOptions')}
                                    </h3>
                                    {canEditBooking && !isLocked && !isEditingPayment && (
                                        <button
                                            onClick={handleEditPayment}
                                            className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>{buttonT('edit')}</span>
                                        </button>
                                    )}
                                    {isEditingPayment && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handleCancelPayment}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <X className="w-4 h-4" />
                                                <span>{buttonT('cancel')}</span>
                                            </button>
                                            <button
                                                onClick={handleSavePayment}
                                                disabled={isSaving}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-green-600 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <Save className="w-4 h-4" />
                                                <span>{buttonT('save')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {isEditingPayment ? (
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                {wizardT('labels.choosePayment')}
                                            </p>
                                            <div className="grid grid-cols-1 gap-4">
                                                <label
                                                    className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${tempCustomer.paymentMethod === 'ec_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                                                    style={{ borderRadius: 'var(--radius)' }}
                                                >
                                                    <NativeRadio
                                                        name="paymentMethodAdmin"
                                                        checked={tempCustomer.paymentMethod === 'ec_card'}
                                                        onChange={() => setTempCustomer({ ...tempCustomer, paymentMethod: 'ec_card' })}
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                                            {wizardT('labels.ecCard') || 'EC-Karte / Karte vor Ort'}
                                                        </span>
                                                    </div>
                                                </label>

                                                <label
                                                    className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${tempCustomer.paymentMethod === 'on_bill' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                                                    style={{ borderRadius: 'var(--radius)' }}
                                                >
                                                    <NativeRadio
                                                        name="paymentMethodAdmin"
                                                        checked={tempCustomer.paymentMethod === 'on_bill'}
                                                        onChange={() => setTempCustomer({ ...tempCustomer, paymentMethod: 'on_bill' })}
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                                            {wizardT('labels.onInvoice') || 'Auf Rechnung'}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="space-y-4 mt-6 pt-6 border-t border-border">
                                                <div className="space-y-1">
                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('sections.billingAddress')}</label>
                                                    <ValidatedTextarea
                                                        value={tempCustomer.billingAddress}
                                                        onChange={(e) => setTempCustomer({ ...tempCustomer, billingAddress: e.target.value })}
                                                        className="w-full bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                        style={{ fontSize: 'var(--text-base)' }}
                                                        rows={3}
                                                        placeholder={wizardT('placeholders.billingAddress') || 'Geben Sie die Rechnungsadresse ein'}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.reference')}</label>
                                                    <input
                                                        type="text"
                                                        value={tempCustomer.billingReference}
                                                        onChange={(e) => setTempCustomer({ ...tempCustomer, billingReference: e.target.value })}
                                                        className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                        style={{ fontSize: 'var(--text-base)' }}
                                                        placeholder={wizardT('placeholders.billingReference') || 'Referenznummer hinzufügen'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.paymentOption')}</label>
                                                <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                                                    <div className={`w-3 h-3 rounded-full bg-primary`} />
                                                    <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                        {booking.paymentMethod === 'on_bill' ? (wizardT('labels.onInvoice')) :
                                                            (wizardT('labels.ecCard') || 'EC-Karte / Karte vor Ort')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('sections.billingAddress')}</label>
                                                    <div className="p-3 bg-background border border-border rounded-lg min-h-[45px]">
                                                        <p className="text-foreground whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }}>
                                                            {booking.billingAddress || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.reference')}</label>
                                                    <div className="p-3 bg-background border border-border rounded-lg min-h-[45px]">
                                                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                            {booking.billingReference || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Menu Details Tab */}
                        <TabsContent value="menu-details" className="space-y-6">
                            {/* Menu Items */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <UtensilsCrossed className="w-5 h-5 text-primary" /> {t('menuItems')}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {canEditBooking && !isLocked && !isEditingMenu && (
                                            <button
                                                onClick={handleEditMenu}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                <span>{buttonT('edit')}</span>
                                            </button>
                                        )}
                                        {canEditBooking && !isLocked && !isEditingMenu && (
                                            <button
                                                onClick={handleEditItems}
                                                className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2"
                                                style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                            >
                                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                                <span>Edit Items</span>
                                            </button>
                                        )}
                                        {isEditingMenu && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleCancelMenu}
                                                    disabled={isSaving}
                                                    className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-red-500 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>{buttonT('cancel')}</span>
                                                </button>
                                                <button
                                                    onClick={handleSaveMenu}
                                                    disabled={isSaving}
                                                    className="px-3 py-1.5 border border-border hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-green-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-green-600/30 border-t-transparent rounded-full animate-spin" />
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            <span>{buttonT('save')}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-background border border-border rounded-lg overflow-hidden overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('item')}</th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-foreground text-xs sm:text-sm hidden sm:table-cell" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('category')}</th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('quantity')}</th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{buttonT('price')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(isEditingMenu ? tempMenuItems : booking.menuItems) && (isEditingMenu ? tempMenuItems : booking.menuItems)!.length > 0 ? (
                                                (isEditingMenu ? tempMenuItems : booking.menuItems)!.map((item: any, index: number) => (
                                                    <tr key={item.id || item.itemId || `row-${index}`} className="border-t border-border">
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-foreground text-xs sm:text-sm">
                                                            <div className="flex flex-col gap-1.5 py-1">
                                                                <div className="font-medium text-foreground" title={item.item || item.name}>
                                                                    <span>{item.item || item.name}</span>
                                                                    {item.variant && (
                                                                        <span className="ml-1.5 text-muted-foreground font-normal">
                                                                            ({item.variant})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.notes && (
                                                                    <div className="flex items-start gap-1.5 text-primary/80">
                                                                        <UtensilsCrossed className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                        <span className="text-[12px] leading-tight font-medium" title={item.notes}>
                                                                            {item.notes}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {item.customerComment && (
                                                                    <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-500">
                                                                        <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                        <span className="text-[12px] italic leading-tight" title={item.customerComment}>
                                                                            Note: {item.customerComment}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell" title={item.category}>{item.category}</td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-foreground text-xs sm:text-sm">
                                                            {isEditingMenu ? (
                                                                <div className="flex items-center gap-2" translate="no">
                                                                    <input
                                                                        type="number"
                                                                        value={item.rawQuantity}
                                                                        onChange={(e) => {
                                                                            const newItems = [...tempMenuItems];
                                                                            newItems[index] = { ...item, rawQuantity: parseInt(e.target.value) || 0 };
                                                                            setTempMenuItems(newItems);
                                                                        }}
                                                                        className="w-20 px-2 py-1 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                                    />
                                                                    <span className="text-muted-foreground">
                                                                        {item.pricingType === 'per_person' ? (
                                                                            <Users className="w-3.5 h-3.5" />
                                                                        ) : (
                                                                            <span className="text-sm">units</span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 whitespace-nowrap" translate="no">
                                                                    {item.pricingType === 'per_person' ? (
                                                                        <>
                                                                            <span>{item.rawQuantity}</span>
                                                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                                            <span>x {Math.round(item.unitPrice || 0)} CHF</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>{item.quantity}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                            {isEditingMenu ? (
                                                                <span>CHF {((item.rawQuantity || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
                                                            ) : (
                                                                <span>{item.price}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan={4} className="px-4 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">{t('noItemsSelected')}</td></tr>
                                            )}
                                            {booking.menuItems && booking.menuItems.length > 0 && (
                                                <tr className="border-t-2 border-border bg-muted">
                                                    <td colSpan={3} className="px-2 sm:px-4 py-2 sm:py-3 text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('totalAmount')}</td>
                                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                        {isEditingMenu ? (
                                                            <span>CHF {tempMenuItems.reduce((sum, item) => sum + ((item.rawQuantity || 0) * (item.unitPrice || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        ) : (
                                                            <span>{booking.amount}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Dietary Summary Section */}
                            {(dietarySummary.veg.items.length > 0 || dietarySummary.vegan.items.length > 0 || dietarySummary.nonVeg.items.length > 0) && (
                                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <UtensilsCrossed className="w-5 h-5 text-primary" /> {t('dietarySelection')}
                                    </h3>
                                    <div className="space-y-4">
                                        {dietarySummary.veg.items.length > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <DietaryIcon type="veg" size="sm" />
                                                    <span className="text-muted-foreground font-medium">Veg Selection ({dietarySummary.veg.items.length})</span>
                                                </div>
                                                <span className="text-foreground font-bold">CHF {dietarySummary.veg.price.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {dietarySummary.vegan.items.length > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <DietaryIcon type="vegan" size="sm" />
                                                    <span className="text-muted-foreground font-medium">Vegan Selection ({dietarySummary.vegan.items.length})</span>
                                                </div>
                                                <span className="text-foreground font-bold">CHF {dietarySummary.vegan.price.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {dietarySummary.nonVeg.items.length > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <DietaryIcon type="non-veg" size="sm" />
                                                    <span className="text-muted-foreground font-medium">Non-Veg Selection ({dietarySummary.nonVeg.items.length})</span>
                                                </div>
                                                <span className="text-foreground font-bold">CHF {dietarySummary.nonVeg.price.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Additional Information
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                    <MessageSquare className="w-5 h-5 text-primary" /> {t('additionalInfo')}
                                </h3>
                                <div className="space-y-1">
                                    <label className="text-muted-foreground block font-medium" style={{ fontSize: 'var(--text-small)' }}>{t('allergyDetails')}</label>
                                    <div className="p-4 bg-muted/20 border border-border/50 rounded-lg text-foreground min-h-[60px] whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }} title={Array.isArray(allergies) ? allergies.join(', ') : (allergies || '')}>
                                        {Array.isArray(allergies) ? allergies.join(', ') : allergies || <span className="text-muted-foreground italic">{t('noDataFound')}</span>}
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1">{t('clientFilledField')}</p>
                                </div>
                                <div className="space-y-1 text-pt-2">
                                    <label className="text-muted-foreground block font-medium" style={{ fontSize: 'var(--text-small)' }}>{t('internalNotes')}</label>
                                    <div className="p-4 bg-muted/20 border border-border/50 rounded-lg text-foreground min-h-[60px] whitespace-pre-wrap" style={{ fontSize: 'var(--text-base)' }} title={notes || ''}>
                                        {notes || <span className="text-muted-foreground italic font-normal">{t('noDataFound')}</span>}
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1">{t('clientFilledField')}</p>
                                </div>
                            </div> */}
                        </TabsContent>

                        {/* Comments and Activities Tab */}
                        <TabsContent value="comments-activities" className="space-y-6">
                            {/* Manual Comments Section */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <MessageSquare className="w-5 h-5 text-primary" /> {t('manualComments')}
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                                        {comments.filter(c => c.type !== 'system').length}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 -mr-2 scrollbar-thin">
                                        {comments.filter(c => c.type !== 'system').length === 0 ? (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-muted-foreground text-sm">{t('noComments')}</p>
                                            </div>
                                        ) : (
                                            comments
                                                .filter(c => c.type !== 'system')
                                                .slice()
                                                .reverse()
                                                .map((contact, index) => (
                                                    <CommentItem key={index} contact={contact} t={t} commonT={commonT} />
                                                ))
                                        )}
                                    </div>

                                    {canEditBooking && (
                                        <div className="pt-4 border-t border-border/50">
                                            <ValidatedTextarea
                                                value={newComment}
                                                onChange={(e) => {
                                                    setNewComment(e.target.value);
                                                    if (errors.comment) setErrors({ ...errors, comment: undefined });
                                                }}
                                                placeholder={t('commentPlaceholder')}
                                                rows={3}
                                                maxLength={500}
                                                showCharacterCount={false}
                                                error={errors.comment}
                                                className="focus:ring-1 focus:ring-primary/20 border-border/60"
                                                actionContainerClassName="flex items-center gap-3"
                                            >
                                                <span className="text-[10px] tabular-nums font-semibold uppercase tracking-wider text-muted-foreground/60">
                                                    {newComment.length} / 500
                                                </span>
                                                <button
                                                    onClick={handleAddComment}
                                                    disabled={!newComment.trim() || isAddingComment}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm shadow-primary/10 hover:shadow-primary/20 active:scale-95"
                                                    style={{ fontSize: 'var(--text-small)' }}
                                                >
                                                    {isAddingComment ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Send className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>{t('addComment')}</span>
                                                </button>
                                            </ValidatedTextarea>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Log Section */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <History className="w-5 h-5 text-primary" /> {t('activityLog')}
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                                        {comments.filter(c => c.type === 'system').length}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 -mr-2 scrollbar-thin">
                                        {comments.filter(c => c.type === 'system').length === 0 ? (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                                <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-muted-foreground text-sm">{t('noActivity')}</p>
                                            </div>
                                        ) : (
                                            comments
                                                .filter(c => c.type === 'system')
                                                .slice()
                                                .reverse()
                                                .map((contact, index) => (
                                                    <CommentItem key={index} contact={contact} t={t} commonT={commonT} />
                                                ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Requests Tab */}
                        <TabsContent value="requests" className="space-y-6">
                            {/* Customer Check-ins */}
                            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        <CheckCircle2 className="w-5 h-5 text-primary" /> {t('checkins')}
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border">
                                        {(checkins && checkins.length > 0) ? '1' : '0'} {t('items')}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {!checkins || checkins.length === 0 ? (
                                        <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
                                            <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                            <p className="text-muted-foreground text-sm">{t('noCheckins')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {(() => {
                                                // Get only the latest check-in (assuming they're sorted by date, newest first)
                                                const latestCheckin = checkins[0];
                                                return (
                                                    <div key={latestCheckin.id} className="p-4 bg-muted/10 border border-border rounded-xl space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${latestCheckin.hasChanges ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                                    {latestCheckin.hasChanges ? 'Changes Requested' : 'Confirmed'}
                                                                </span>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {new Date(latestCheckin.submittedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] uppercase text-muted-foreground font-bold">Guest Split</p>
                                                                <p className="text-sm">
                                                                    Total: <span className="font-semibold">{latestCheckin.newGuestCount}</span>
                                                                    <span className="text-muted-foreground ml-2">({latestCheckin.vegetarianCount} Veg / {latestCheckin.veganCount} Vegan / {latestCheckin.nonVegetarianCount} Non-Veg)</span>
                                                                </p>
                                                            </div>
                                                            {latestCheckin.guestCountChanged && (
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] uppercase text-amber-600 font-bold">Guest Count Changed</p>
                                                                    <p className="text-xs italic">Client reported a change in total guests.</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {latestCheckin.menuChanges && (
                                                            <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/50">
                                                                <p className="text-[10px] uppercase text-primary font-bold">Menu Changes</p>
                                                                <p className="text-sm italic" title={latestCheckin.menuChanges}>{latestCheckin.menuChanges}</p>
                                                            </div>
                                                        )}

                                                        {latestCheckin.additionalDetails && (
                                                            <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/50">
                                                                <p className="text-[10px] uppercase text-primary font-bold">Additional Details</p>
                                                                <p className="text-sm italic" title={latestCheckin.additionalDetails}>{latestCheckin.additionalDetails}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column - Action Buttons (25% on desktop, 100% on mobile) */}
                <div className="w-full lg:w-1/4 lg:min-w-[280px] space-y-4">
                    {/* Status Card */}
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                        <h3 className="text-foreground mb-4" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {commonT('status')}
                        </h3>
                        <StatusDropdown
                            options={statusOptions}
                            value={localStatus}
                            onChange={handleStatusChange}
                            placeholder={statusT('all')}
                            className="w-full"
                            disabled={!canUpdateStatus}
                        />
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                        <h3 className="text-foreground mb-4" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                            {t('quickActions')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                            {canEditBooking && (
                                <button
                                    onClick={() => {
                                        setIsAdminUsersLoading(true);
                                        setIsPdfActionModalOpen(true);
                                    }}
                                    className="w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                                    style={{ fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('kitchenSheet')}</span>
                                    <span className="sm:hidden">{t('kitchenSheet')}</span>
                                </button>
                            )}

                            {canManageUsers && (
                                <button
                                    onClick={() => setIsAssignModalOpen(true)}
                                    className="w-full px-3 sm:px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-border text-sm sm:text-base"
                                    style={{ fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    {assignedTo ? (
                                        <span className="truncate">{adminUsers.find(u => u.id === assignedTo)?.name || t('assigned')}</span>
                                    ) : (
                                        <span>{t('assignUser')}</span>
                                    )}
                                </button>
                            )}

                            {canEditBooking && (
                                <>
                                    <button
                                        onClick={handleSendReminder}
                                        disabled={isReminding}
                                        className="w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-border disabled:opacity-50 text-sm sm:text-base"
                                        style={{ fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                        {isReminding ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Bell className="w-4 h-4 text-primary-foreground" />}
                                        <span className="hidden sm:inline">{t('sendReminder')}</span>
                                        <span className="sm:hidden">{t('sendReminder')}</span>
                                    </button>

                                    <button
                                        onClick={handleSendCheckin}
                                        disabled={isSendingCheckin}
                                        className="w-full px-3 sm:px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-border disabled:opacity-50 text-sm sm:text-base"
                                        style={{ fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                        {isSendingCheckin ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Mail className="w-4 h-4" />}
                                        <span className="hidden sm:inline">{t('sendCheckin')}</span>
                                        <span className="sm:hidden">{t('sendCheckin')}</span>
                                    </button>

                                    <button
                                        onClick={handleSendUpdate}
                                        disabled={isSendingUpdate}
                                        className="w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-border disabled:opacity-50 text-sm sm:text-base"
                                        style={{ fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                        {isSendingUpdate ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Send className="w-4 h-4 text-primary-foreground" />}
                                        <span className="hidden sm:inline">{t('sendUpdate')}</span>
                                        <span className="sm:hidden">{t('sendUpdate')}</span>
                                    </button>
                                </>
                            )}

                            {canDeleteBooking && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="w-full px-3 sm:px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-destructive/30 text-sm sm:text-base sm:col-span-2 lg:col-span-1"
                                    style={{ fontWeight: 'var(--font-weight-medium)' }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">{('Delete Booking')}</span>
                                    <span className="sm:hidden">{('Delete')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Assigned User Card */}
                    {assignedTo && (
                        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                            <h3 className="text-foreground mb-3" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {t('assignedTo')}
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                        {adminUsers.find(u => u.id === assignedTo)?.name}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {adminUsers.find(u => u.id === assignedTo)?.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Kitchen PDF Action Modal */}
            {isPdfActionModalOpen && booking && (
                <KitchenPdfActionModal
                    isOpen={isPdfActionModalOpen}
                    onClose={() => setIsPdfActionModalOpen(false)}
                    onActionComplete={handlePdfActionComplete}
                    booking={{
                        ...booking,
                        event: {
                            ...booking.event,
                            location: selectedVenue
                        },
                        allergies: typeof allergies === 'string' ? allergies : (Array.isArray(allergies) ? (allergies as string[]).join(', ') : ''),
                        notes: notes,
                        kitchenNotes: kitchenNotes,
                        menuItems: booking.menuItems?.map(item => ({
                            ...item,
                            quantity: String(item.quantity),
                            notes: item.notes
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
                                toast.success(t('toast.assignmentSuccess'));
                                // Update initial values to match current values
                                setInitialAssignedTo(userId);
                                setHasUnsavedChanges(false);
                                onBookingUpdated?.();
                                // Refresh page after a short delay to show updated data
                                setTimeout(() => {
                                    window.location.reload();
                                }, 100);
                            } else {
                                toast.error(t('toast.assignmentFailed'));
                            }
                        } catch (error) {
                            console.error('Error updating assignment:', error);
                            toast.error(t('toast.assignmentFailed'));
                        }
                    }}
                    isLoading={isAdminUsersLoading}
                />
            )}

            {/* Delete Booking Modal */}
            {isDeleteModalOpen && (
                <DeleteBookingModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDelete={handleDeleteBooking}
                    isLoading={isDeleting}
                    bookingTitle={booking ? `${booking.customer.name} - ${booking.event.date}` : undefined}
                />
            )}
        </div>
    );
}

function CommentItem({ contact, t, commonT }: { contact: any, t: any, commonT: any }) {
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
                            {t('system')}
                        </span>
                    )}
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5 ml-auto sm:ml-0">
                        <span className="hidden sm:inline">•</span>
                        {contact.date} {commonT('at')} {contact.time}
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
