'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, User, Lock, FileText, UserPlus, CheckCircle2, Bell, Mail, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { bookingKitchenNotesSchema, bookingCommentSchema, customerNameSchema, customerBusinessSchema, userEmailSchema, customerPhoneSchema, customerStreetSchema, customerPlzSchema, customerLocationSchema, customerOccasionSchema, bookingGuestCountSchema, bookingSpecialRequestsSchema, bookingAllergiesSchema } from '@/lib/validation/schemas';
import { useBookingTranslation, useCommonTranslation, useButtonTranslation } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { useLocale } from 'next-intl';
import { toReadableDate } from '@/lib/utils/date';
import { useSystemTimezone } from '@/lib/hooks/useSystemTimezone';
import { useDateFormat } from '@/lib/contexts/SystemSettingsContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Sub-components
import { EventDetailsTab } from './booking-detail/EventDetailsTab';
import { MenuDetailsTab } from './booking-detail/MenuDetailsTab';
import { CommentsActivitiesTab } from './booking-detail/CommentsActivitiesTab';
import { RequestsTab } from './booking-detail/RequestsTab';
import { Booking, BookingComment, AuditLog } from './booking-detail/types';
export type { Booking, BookingComment, AuditLog };



interface BookingDetailPageProps {
    bookingId: string;
    booking?: Booking | null;
    onBack?: () => void;
    onBookingUpdated?: () => void;
    user?: any;
    initialVenues?: string[];
    initialAdminUsers?: any[];
    initialPdfHistory?: any;
    setIsNavigating?: (val: boolean) => void;
}

export function BookingDetailPage({
    bookingId,
    booking: initialBooking,
    onBack,
    onBookingUpdated,
    user,
    initialVenues,
    initialAdminUsers,
    initialPdfHistory,
    setIsNavigating
}: BookingDetailPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'event-details';

    const handleTabChange = (value: string) => {
        if (value === activeTab) return;
        setIsNavigating?.(true);
        setIsTransitioning(true);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    // Clear navigation state when tab actually changes
    useEffect(() => {
        // Minimum delay to ensure the loader is visible enough to give feedback
        const timer = setTimeout(() => {
            setIsNavigating?.(false);
            setIsTransitioning(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [activeTab, setIsNavigating]);
    const t = useBookingTranslation();
    const commonT = useCommonTranslation();
    const buttonT = useButtonTranslation();
    const statusT = useTranslations('bookingStatus');
    const wizardT = useTranslations('wizard');
    const locale = useLocale();
    const { timezone } = useSystemTimezone();
    const { formatDate } = useDateFormat();

    const [booking, setBooking] = useState<Booking | null>(initialBooking || null);
    const [loading, setLoading] = useState(!initialBooking);
    const [comments, setComments] = useState<BookingComment[]>(initialBooking?.contactHistory || []);
    const [checkins, setCheckins] = useState<Booking['checkins']>(initialBooking?.checkins || []);
    const [allCategories, setAllCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/menu');
                const data = await response.json();
                if (data && data.categories) {
                    setAllCategories(data.categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const [isReminding, setIsReminding] = useState(false);
    const [isSendingCheckin, setIsSendingCheckin] = useState(false);
    const [isSendingUpdate, setIsSendingUpdate] = useState(false);

    // Check if check-in has been submitted (has check-ins in the array)
    const hasCheckinSubmitted = checkins && checkins.length > 0;

    // Check if check-in email was already sent (look for it in contact history)
    const checkinEmailSent = comments.some(c =>
        c.type === 'system' && c.action?.toLowerCase().includes('check-in email sent')
    );

    // Disable button ONLY if check-in was submitted (not just email sent)
    const shouldDisableCheckinButton = isSendingCheckin || hasCheckinSubmitted;


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
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Editing states
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [useSameAddressForBilling, setUseSameAddressForBilling] = useState(false);
    const [tempCustomer, setTempCustomer] = useState({
        name: '',
        business: '',
        email: '',
        phone: '',
        street: '',
        plz: '',
        location: '',
        reference: '',
        billingStreet: '',
        billingPlz: '',
        billingLocation: '',
        billingBusiness: '',
        billingEmail: '',
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

    const [isEditingSpecialRequests, setIsEditingSpecialRequests] = useState(false);

    // Derived value for conditional room selection
    const currentGuests = isEditingEvent ? tempEvent.guests : (booking?.guests || 0);

    const [isEditingMenu, setIsEditingMenu] = useState(false);
    const [tempMenuItems, setTempMenuItems] = useState<any[]>([]);

    const userRole = user?.role;
    const canEditBooking = hasPermission(userRole, Permission.EDIT_BOOKING);
    const canUpdateStatus = hasPermission(userRole, Permission.UPDATE_BOOKING_STATUS);

    const isReadOnlyStatus = ['completed', 'declined', 'no_show'].includes(localStatus);
    const readOnlyTooltip = t('quickActions') ? "Change the status to confirmed to update the details" : "Change the status to confirmed to update the details"; // Fallback to literal if translation is missing

    const dietarySummary = useMemo(() => {
        const items = isEditingMenu ? tempMenuItems : (booking?.menuItems || []);
        
        // Filter food items that are priced per person
        const ppFoodItems = (items || []).filter(item => {
            if (item.pricingType !== 'per_person') return false;
            const cat = (item.category || '').toLowerCase();
            const isBev = ['beverages', 'drink', 'drinks', 'softdrinks', 'wein', 'bier', 'kaffee', 'wine', 'beer', 'getränk', 'getränke', 'spirituosen', 'spirits', 'cocktails', 'longdrinks', 'digestif'].includes(cat);
            const isAddon = cat === 'add-ons' || cat === 'extra' || cat === 'extras' || item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee';
            return !isBev && !isAddon;
        });

        // Group items by category name
        const itemsByCat: Record<string, any[]> = {};
        ppFoodItems.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!itemsByCat[cat]) itemsByCat[cat] = [];
            itemsByCat[cat].push(item);
        });

        let vegSubtotal = 0;
        let nonVegSubtotal = 0;

        Object.entries(itemsByCat).forEach(([catName, items]) => {
            // Find the category configuration
            const catConfig = allCategories.find(c => 
                c.name.toLowerCase().trim() === catName.toLowerCase().trim() || 
                c.nameDe?.toLowerCase().trim() === catName.toLowerCase().trim()
            );
            
            const isSpecial = catConfig?.useSpecialCalculation ?? false;

            if (isSpecial) {
                // Shared category (e.g. Starters, Desserts): take highest price and apply to both tracks
                const maxPrice = items.length > 0 ? Math.max(...items.map(i => i.unitPrice || 0)) : 0;
                vegSubtotal += maxPrice;
                nonVegSubtotal += maxPrice;
            } else {
                // Normal category (e.g. Main Courses): take highest price by dietary track
                // 'none' applies to both tracks
                const vegItems = items.filter(i => ['veg', 'vegan', 'none'].includes(i.dietaryType || 'none'));
                const nonVegItems = items.filter(i => ['non-veg', 'none'].includes(i.dietaryType || 'none'));

                const vegMax = vegItems.length > 0 ? Math.max(...vegItems.map(i => i.unitPrice || 0)) : 0;
                const nonVegMax = nonVegItems.length > 0 ? Math.max(...nonVegItems.map(i => i.unitPrice || 0)) : 0;

                vegSubtotal += vegMax;
                nonVegSubtotal += nonVegMax;
            }
        });

        return {
            veg: { 
                subtotal: vegSubtotal, 
                count: ppFoodItems.filter(i => i.dietaryType === 'veg' || i.dietaryType === 'vegan').length,
                isActivated: ppFoodItems.some(i => i.dietaryType === 'veg' || i.dietaryType === 'vegan')
            },
            nonVeg: { 
                subtotal: nonVegSubtotal, 
                count: ppFoodItems.filter(i => i.dietaryType === 'non-veg').length,
                isActivated: ppFoodItems.some(i => i.dietaryType === 'non-veg')
            }
        };
    }, [isEditingMenu, tempMenuItems, booking?.menuItems, allCategories]);
    const canViewAudit = hasPermission(userRole, Permission.VIEW_BOOKING_DETAILS);
    const canManageUsers = hasPermission(userRole, Permission.MANAGE_USERS);
    const canDeleteBooking = hasPermission(userRole, Permission.DELETE_BOOKING);

    // Kitchen PDF state
    const [kitchenPdfStatus, setKitchenPdfStatus] = useState<KitchenPdfStatus | undefined>(
        initialPdfHistory || initialBooking?.kitchenPdf
    );
    const [isPdfActionModalOpen, setIsPdfActionModalOpen] = useState(false);
    const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
    const [adminUsers, setAdminUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>(initialAdminUsers || []);

    const [venueLocations, setVenueLocations] = useState<string[]>(initialVenues || []);
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
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        street?: string;
        plz?: string;
        location?: string;
        eventDate?: string;
        eventTime?: string;
        guestCount?: string;
        occasion?: string;
        allergies?: string;
        specialRequests?: string;
        billingAddress?: string;
        billingStreet?: string;
        billingPlz?: string;
        billingLocation?: string;
        billingBusiness?: string;
        billingEmail?: string;
        billingReference?: string;
        paymentMethod?: string;
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

    // Function to fetch fresh booking data without necessarily showing a full-page loader
    const fetchBookingData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
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
            console.error('Error fetching booking data:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Initial fetch on mount or when ID changes
    useEffect(() => {
        if (!initialBooking) {
            fetchBookingData(true);
        }
    }, [bookingId]);




    // Fetch venue locations on mount
    useEffect(() => {
        if (!initialVenues || initialVenues.length === 0) {
            const fetchVenues = async () => {
                const locations = await VenueService.getLocations();
                setVenueLocations(locations);
            };
            fetchVenues();
        }
    }, []);

    // Fetch kitchen PDF status if not provided via prop
    useEffect(() => {
        if (bookingId && !initialBooking?.kitchenPdf && !initialPdfHistory) {
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
    }, [bookingId, initialBooking, initialPdfHistory]);

    // Fetch admin users
    useEffect(() => {
        if (canEditBooking && adminUsers.length === 0 && !isAdminUsersLoading && !initialAdminUsers) {
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
    }, [canEditBooking, adminUsers.length, isAdminUsersLoading, initialAdminUsers]);

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
                    date: formatDate(now),
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
            fetchBookingData(false);
            router.refresh();
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
                // Log reminder email activity
                const now = new Date();
                const newCommentObj: BookingComment = {
                    by: user?.name || 'Admin',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    date: formatDate(now),
                    action: 'Reminder email sent successfully',
                    type: 'system' as const
                };
                setComments([...comments, newCommentObj]);
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
                // Log check-in email activity
                const now = new Date();
                const newCommentObj: BookingComment = {
                    by: user?.name || 'Admin',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    date: formatDate(now),
                    action: 'Check-in email sent successfully (4 days before event)',
                    type: 'system' as const
                };
                setComments([...comments, newCommentObj]);
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
                room: selectedRoom || booking.room,
                billingStreet: booking.billingStreet,
                billingPlz: booking.billingPlz,
                billingLocation: booking.billingLocation,
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
                // Log update email activity
                const now = new Date();
                const newCommentObj: BookingComment = {
                    by: user?.name || 'Admin',
                    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    date: formatDate(now),
                    action: 'Booking update email sent successfully with PDF',
                    type: 'system' as const
                };
                setComments([...comments, newCommentObj]);
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
                fetchBookingData(false);
                router.refresh();
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
                // Call onBookingUpdated to refresh the bookings list in the parent
                onBookingUpdated?.();
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

    // Validation functions
    const validateCustomerField = (field: keyof typeof tempCustomer, value: string) => {
        let error = '';

        switch (field) {
            case 'name':
                const nameResult = customerNameSchema.safeParse(value);
                if (!nameResult.success) error = nameResult.error.errors[0].message;
                break;
            case 'email':
                const emailResult = userEmailSchema.safeParse(value);
                if (!emailResult.success) error = emailResult.error.errors[0].message;
                break;
            case 'phone':
                const phoneResult = customerPhoneSchema.safeParse(value);
                if (!phoneResult.success) error = phoneResult.error.errors[0].message;
                break;
            case 'street':
                if (!value.trim()) {
                    error = 'Street address is required';
                } else {
                    const streetResult = customerStreetSchema.safeParse(value);
                    if (!streetResult.success) error = streetResult.error.errors[0].message;
                }
                break;
            case 'plz':
                if (!value.trim()) {
                    error = 'Postal code is required';
                } else {
                    const plzResult = customerPlzSchema.safeParse(value);
                    if (!plzResult.success) error = plzResult.error.errors[0].message;
                }
                break;
            case 'location':
                if (!value.trim()) {
                    error = 'Location is required';
                } else {
                    const locationResult = customerLocationSchema.safeParse(value);
                    if (!locationResult.success) error = locationResult.error.errors[0].message;
                }
                break;
        }

        setErrors(prev => ({
            ...prev, [field === 'name' ? 'customerName' :
                field === 'email' ? 'customerEmail' :
                    field === 'phone' ? 'customerPhone' : field]: error || undefined
        }));
        return !error;
    };

    const validateEventField = (field: keyof typeof tempEvent, value: string | number) => {
        let error = '';

        switch (field) {
            case 'date':
                if (!value) {
                    error = 'Event date is required';
                }
                break;
            case 'time':
                if (!value) {
                    error = 'Event time is required';
                }
                break;
            case 'guests':
                const guestCount = typeof value === 'number' ? value : parseInt(value);
                if (!guestCount || guestCount < 1) {
                    error = 'Guest count must be at least 1';
                } else if (guestCount > 10000) {
                    error = 'Guest count cannot exceed 10,000';
                }
                break;
            case 'occasion':
                if (value && typeof value === 'string') {
                    const occasionResult = customerOccasionSchema.safeParse(value);
                    if (!occasionResult.success) error = occasionResult.error.errors[0].message;
                }
                break;
        }

        setErrors(prev => ({
            ...prev, [field === 'date' ? 'eventDate' :
                field === 'time' ? 'eventTime' :
                    field === 'guests' ? 'guestCount' : field]: error || undefined
        }));
        return !error;
    };

    const validateSpecialRequests = () => {
        let newErrors: Record<string, string> = {};

        // Validate allergies (optional)
        if (allergies && allergies.trim()) {
            const allergiesResult = bookingAllergiesSchema.safeParse(allergies);
            if (!allergiesResult.success) {
                newErrors.allergies = allergiesResult.error.errors[0].message;
            }
        }

        // Validate special requests/notes (optional)
        if (notes && notes.trim()) {
            const notesResult = bookingSpecialRequestsSchema.safeParse(notes);
            if (!notesResult.success) {
                newErrors.specialRequests = notesResult.error.errors[0].message;
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validatePaymentField = (field: 'paymentMethod' | 'billingReference' | 'billingStreet' | 'billingPlz' | 'billingLocation' | 'billingBusiness' | 'billingEmail', value: string) => {
        let error = '';

        switch (field) {
            case 'paymentMethod':
                if (!value || value.trim() === '') {
                    error = 'Payment method is required';
                }
                break;
            case 'billingStreet':
                if (!value.trim()) {
                    error = 'Billing street is required';
                } else {
                    const streetResult = customerStreetSchema.safeParse(value);
                    if (!streetResult.success) error = streetResult.error.errors[0].message;
                }
                break;
            case 'billingPlz':
                if (!value.trim()) {
                    error = 'Billing postal code is required';
                } else {
                    const plzResult = customerPlzSchema.safeParse(value);
                    if (!plzResult.success) error = plzResult.error.errors[0].message;
                }
                break;
            case 'billingLocation':
                if (!value.trim()) {
                    error = 'Billing location is required';
                } else {
                    const locationResult = customerLocationSchema.safeParse(value);
                    if (!locationResult.success) error = locationResult.error.errors[0].message;
                }
                break;
            case 'billingReference':
                if (value && value.trim() && value.length > 100) {
                    error = 'Billing reference cannot exceed 100 characters';
                }
                break;
            case 'billingBusiness':
                // Optional, but can add max length check
                if (value && value.length > 100) error = 'Business name too long';
                break;
            case 'billingEmail':
                if (value && value.trim()) {
                    const emailResult = userEmailSchema.safeParse(value);
                    if (!emailResult.success) error = emailResult.error.errors[0].message;
                }
                break;
        }

        setErrors(prev => ({ ...prev, [field]: error || undefined }));
        return !error;
    };

    const handleEditCustomer = () => {
        if (!booking) return;
        setTempCustomer({
            name: booking.customer.name,
            business: booking.customer.business || '',
            email: booking.customer.email,
            phone: booking.customer.phone,
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingStreet: booking.billingStreet || '',
            billingPlz: booking.billingPlz || '',
            billingLocation: booking.billingLocation || '',
            billingBusiness: booking.billingBusiness || '',
            billingEmail: booking.billingEmail || '',
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
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingStreet: booking.billingStreet || '',
            billingPlz: booking.billingPlz || '',
            billingLocation: booking.billingLocation || '',
            billingBusiness: booking.billingBusiness || '',
            billingEmail: booking.billingEmail || '',
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
            street: booking.customer.street || '',
            plz: booking.customer.plz || '',
            location: booking.customer.location || '',
            reference: booking.customer.reference || '',
            billingStreet: booking.billingStreet || '',
            billingPlz: booking.billingPlz || '',
            billingLocation: booking.billingLocation || '',
            billingBusiness: booking.billingBusiness || '',
            billingEmail: booking.billingEmail || '',
            billingReference: booking.billingReference || '',
            paymentMethod: booking.paymentMethod || ''
        });
        setIsEditingPayment(true);
    };

    const handleCancelPayment = () => {
        setIsEditingPayment(false);
        setUseSameAddressForBilling(false);
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
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Company', tempCustomer.billingBusiness);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Email', tempCustomer.billingEmail);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Reference', tempCustomer.billingReference);
            newInternalNotes = updateFieldInNotes(newInternalNotes, 'Payment Method', tempCustomer.paymentMethod);

            // Update billing address fields if provided
            if (tempCustomer.billingStreet || tempCustomer.billingPlz || tempCustomer.billingLocation) {
                newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Street', tempCustomer.billingStreet);
                newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing PLZ', tempCustomer.billingPlz);
                newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Location', tempCustomer.billingLocation);

                // Combine into full billing address
                const fullBillingAddress = [tempCustomer.billingStreet, tempCustomer.billingPlz, tempCustomer.billingLocation].filter(Boolean).join(', ');
                newInternalNotes = updateFieldInNotes(newInternalNotes, 'Billing Address', fullBillingAddress);
            }

            // The billing fields are handled separately in the PUT body now

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
                    street: tempCustomer.street,
                    plz: tempCustomer.plz,
                    location: tempCustomer.location,
                    business: tempCustomer.business,
                    reference: tempCustomer.reference,
                    billingStreet: tempCustomer.billingStreet,
                    billingPlz: tempCustomer.billingPlz,
                    billingLocation: tempCustomer.billingLocation,
                    billingBusiness: tempCustomer.billingBusiness,
                    billingEmail: tempCustomer.billingEmail,
                    billingReference: tempCustomer.billingReference,
                    paymentMethod: tempCustomer.paymentMethod
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                onBookingUpdated?.();
                fetchBookingData(false); // Silent refresh of current detail view
                router.refresh();
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
        // Validate all customer fields before saving
        const isNameValid = validateCustomerField('name', tempCustomer.name);
        const isEmailValid = validateCustomerField('email', tempCustomer.email);
        const isPhoneValid = validateCustomerField('phone', tempCustomer.phone);

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        const success = await performSaveCustomer();
        if (success) setIsEditingCustomer(false);
    };

    const handleSaveAddress = async () => {
        // Validate all address fields before saving
        const isStreetValid = validateCustomerField('street', tempCustomer.street);
        const isPlzValid = validateCustomerField('plz', tempCustomer.plz);
        const isLocationValid = validateCustomerField('location', tempCustomer.location);

        if (!isStreetValid || !isPlzValid || !isLocationValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        const success = await performSaveCustomer();
        if (success) setIsEditingAddress(false);
    };

    const handleSavePayment = async () => {
        // Validate payment fields before saving
        const isPaymentMethodValid = validatePaymentField('paymentMethod', tempCustomer.paymentMethod);
        const isBillingReferenceValid = validatePaymentField('billingReference', tempCustomer.billingReference);

        // Validate billing address fields if payment method is 'on_bill' and not using same address
        let isBillingAddressValid = true;
        if (tempCustomer.paymentMethod === 'on_bill' && !useSameAddressForBilling) {
            const isBillingStreetValid = validatePaymentField('billingStreet', tempCustomer.billingStreet);
            const isBillingPlzValid = validatePaymentField('billingPlz', tempCustomer.billingPlz);
            const isBillingLocationValid = validatePaymentField('billingLocation', tempCustomer.billingLocation);
            isBillingAddressValid = isBillingStreetValid && isBillingPlzValid && isBillingLocationValid;
        }

        if (!isPaymentMethodValid || !isBillingReferenceValid || !isBillingAddressValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        const success = await performSaveCustomer();
        if (success) {
            setIsEditingPayment(false);
            setUseSameAddressForBilling(false);
        }
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

    const handleEditSpecialRequests = () => {
        // Special requests editing doesn't need temp state as it directly edits allergies and notes
        setIsEditingSpecialRequests(true);
    };

    const handleCancelSpecialRequests = () => {
        // Reset to original values
        const allergiesVal = booking?.allergies;
        setAllergies(Array.isArray(allergiesVal) ? (allergiesVal as string[]).join(', ') : (allergiesVal || ''));
        setNotes(booking?.notes || '');
        setIsEditingSpecialRequests(false);
    };

    const handleSaveSpecialRequests = async () => {
        if (!booking) return;

        // Validate special requests before saving
        if (!validateSpecialRequests()) {
            toast.error('Please fix validation errors before saving');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    allergyDetails: allergies,
                    specialRequests: notes,
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                setIsEditingSpecialRequests(false);
                onBookingUpdated?.();
                fetchBookingData(false);
                router.refresh();
            } else {
                toast.error(t('toast.saveFailed'));
            }
        } catch (error) {
            console.error('Error saving special requests:', error);
            toast.error(t('toast.saveFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEvent = async () => {
        if (!booking) return;

        // Validate all event fields before saving
        const isDateValid = validateEventField('date', tempEvent.date);
        const isTimeValid = validateEventField('time', tempEvent.time);
        const isGuestsValid = validateEventField('guests', tempEvent.guests);
        const isOccasionValid = validateEventField('occasion', tempEvent.occasion);

        if (!isDateValid || !isTimeValid || !isGuestsValid || !isOccasionValid) {
            toast.error('Please fix validation errors before saving');
            return;
        }

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
                    room: selectedRoom
                }),
            });

            if (response.ok) {
                toast.success(t('toast.saveSuccess'));
                setSelectedVenue(tempEvent.location);
                setIsEditingEvent(false);
                onBookingUpdated?.();
                fetchBookingData(false);
                router.refresh();
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

        // Correctly validate that all quantities are at least 1
        const invalidItems = tempMenuItems.filter(item => (item.rawQuantity || 0) < 1);
        if (invalidItems.length > 0) {
            toast.error('All menu items must have a quantity of at least 1');
            return;
        }

        setIsSaving(true);
        try {
            const selectedItems = tempMenuItems.map(item => item.itemId);
            const itemQuantities: Record<string, number> = {};
            tempMenuItems.forEach(item => {
                itemQuantities[item.itemId!] = item.rawQuantity || 1;
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
                fetchBookingData(false);
                router.refresh();
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
        const dateStr = formatDate(now);

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

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="mb-6 w-full grid grid-cols-2 sm:grid-cols-4 p-1 h-auto gap-1 no-scrollbar text-pt-2">
                            <TabsTrigger value="event-details" className="px-3 py-2 text-xs sm:text-sm h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.eventDetails')}</TabsTrigger>
                            <TabsTrigger value="menu-details" className="px-3 py-2 text-xs sm:text-sm h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.menuDetails')}</TabsTrigger>
                            <TabsTrigger value="comments-activities" className="px-3 py-2 text-xs sm:text-sm h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.commentsActivities')}</TabsTrigger>
                            <TabsTrigger value="requests" className="px-3 py-2 text-xs sm:text-sm h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('tabs.requests')}</TabsTrigger>
                        </TabsList>

                        <div className="relative min-h-[400px]">
                            {isTransitioning && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[1px] animate-in fade-in duration-200">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                            {commonT('loading')}...
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className={cn(
                                "transition-all duration-300",
                                isTransitioning ? "opacity-30 blur-[2px] scale-[0.995]" : "opacity-100 blur-0 scale-100"
                            )}>
                                {/* Event Details Tab */}
                                <EventDetailsTab
                                    booking={booking}
                                    canEditBooking={canEditBooking}
                                    isLocked={isLocked}
                                    isReadOnlyStatus={isReadOnlyStatus}
                                    readOnlyTooltip={readOnlyTooltip}
                                    isSaving={isSaving}
                                    wizardT={wizardT}
                                    buttonT={buttonT}
                                    commonT={commonT}
                                    t={t}
                                    formatDate={formatDate}
                                    isEditingCustomer={isEditingCustomer}
                                    handleEditCustomer={handleEditCustomer}
                                    handleCancelCustomer={handleCancelCustomer}
                                    handleSaveCustomer={handleSaveCustomer}
                                    tempCustomer={tempCustomer}
                                    setTempCustomer={setTempCustomer}
                                    validateCustomerField={validateCustomerField}
                                    isEditingAddress={isEditingAddress}
                                    handleEditAddress={handleEditAddress}
                                    handleCancelAddress={handleCancelAddress}
                                    handleSaveAddress={handleSaveAddress}
                                    isEditingEvent={isEditingEvent}
                                    handleEditEvent={handleEditEvent}
                                    handleCancelEvent={handleCancelEvent}
                                    handleSaveEvent={handleSaveEvent}
                                    tempEvent={tempEvent}
                                    setTempEvent={setTempEvent}
                                    validateEventField={validateEventField}
                                    selectedRoom={selectedRoom}
                                    setSelectedRoom={setSelectedRoom}
                                    currentGuests={currentGuests}
                                    isEditingSpecialRequests={isEditingSpecialRequests}
                                    handleEditSpecialRequests={handleEditSpecialRequests}
                                    handleCancelSpecialRequests={handleCancelSpecialRequests}
                                    handleSaveSpecialRequests={handleSaveSpecialRequests}
                                    allergies={allergies}
                                    setAllergies={setAllergies}
                                    notes={notes}
                                    setNotes={setNotes}
                                    isEditingPayment={isEditingPayment}
                                    handleEditPayment={handleEditPayment}
                                    handleCancelPayment={handleCancelPayment}
                                    handleSavePayment={handleSavePayment}
                                    useSameAddressForBilling={useSameAddressForBilling}
                                    setUseSameAddressForBilling={setUseSameAddressForBilling}
                                    validatePaymentField={validatePaymentField}
                                    errors={errors}
                                    setErrors={setErrors}
                                />

                                <MenuDetailsTab
                                    booking={booking}
                                    isEditingMenu={isEditingMenu}
                                    setIsEditingMenu={setIsEditingMenu}
                                    tempMenuItems={tempMenuItems}
                                    setTempMenuItems={setTempMenuItems}
                                    handleEditMenu={handleEditMenu}
                                    handleSaveMenu={handleSaveMenu}
                                    handleCancelMenu={handleCancelMenu}
                                    handleEditItems={handleEditItems}
                                    dietarySummary={dietarySummary}
                                    t={t}
                                    wizardT={wizardT}
                                    commonT={commonT}
                                    buttonT={buttonT}
                                    canEditBooking={canEditBooking}
                                    isLocked={isLocked}
                                    isReadOnlyStatus={isReadOnlyStatus}
                                    readOnlyTooltip={readOnlyTooltip}
                                    isSaving={isSaving}
                                    allCategories={allCategories}
                                />

                                <CommentsActivitiesTab
                                    comments={comments}
                                    newComment={newComment}
                                    setNewComment={setNewComment}
                                    isAddingComment={isAddingComment}
                                    handleAddComment={handleAddComment}
                                    t={t}
                                    commonT={commonT}
                                    canEditBooking={canEditBooking}
                                    isReadOnlyStatus={isReadOnlyStatus}
                                    readOnlyTooltip={readOnlyTooltip}
                                    errors={errors}
                                    setErrors={setErrors}
                                />

                                <RequestsTab
                                    booking={booking}
                                    checkins={checkins || []}
                                    t={t}
                                />
                            </div>
                        </div>
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
                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                    <button
                                        onClick={() => {
                                            setIsAdminUsersLoading(true);
                                            setIsPdfActionModalOpen(true);
                                        }}
                                        disabled={isReadOnlyStatus}
                                        className={cn(
                                            "w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base",
                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        )}
                                        style={{ fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t('kitchenSheet')}</span>
                                        <span className="sm:hidden">{t('kitchenSheet')}</span>
                                    </button>
                                </Tooltip>
                            )}

                            {canManageUsers && (
                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                    <button
                                        onClick={() => setIsAssignModalOpen(true)}
                                        disabled={isReadOnlyStatus}
                                        className={cn(
                                            "w-full px-3 sm:px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 border border-border text-sm sm:text-base",
                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                        )}
                                        style={{ fontWeight: 'var(--font-weight-medium)' }}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>{assignedTo ? t('changeAssignee') : t('addAssignee')}</span>
                                    </button>
                                </Tooltip>
                            )}

                            {canEditBooking && (
                                <>
                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                        <button
                                            onClick={handleSendReminder}
                                            disabled={isReminding || isReadOnlyStatus}
                                            className={cn(
                                                "w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 border border-border text-sm sm:text-base",
                                                (isReminding || isReadOnlyStatus) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                            )}
                                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            {isReminding ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Bell className="w-4 h-4 text-primary-foreground" />}
                                            <span className="hidden sm:inline">{t('sendReminder')}</span>
                                            <span className="sm:hidden">{t('sendReminder')}</span>
                                        </button>
                                    </Tooltip>

                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : (shouldDisableCheckinButton ? 'Check-in already submitted by customer' : '')}>
                                        <button
                                            onClick={handleSendCheckin}
                                            disabled={shouldDisableCheckinButton || isReadOnlyStatus}
                                            className={cn(
                                                "w-full px-3 sm:px-4 py-3 rounded-lg flex items-center justify-center gap-2 border text-sm sm:text-base transition-colors",
                                                (shouldDisableCheckinButton || isReadOnlyStatus)
                                                    ? 'bg-muted text-muted-foreground cursor-not-allowed border-border opacity-60'
                                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 cursor-pointer border-border'
                                            )}
                                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            {isSendingCheckin ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (shouldDisableCheckinButton && !isReadOnlyStatus) ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Mail className="w-4 h-4" />
                                            )}
                                            <span className="hidden sm:inline">
                                                {(shouldDisableCheckinButton && !isReadOnlyStatus) ? 'Check-in Submitted' : t('sendCheckin')}
                                            </span>
                                            <span className="sm:hidden">
                                                {(shouldDisableCheckinButton && !isReadOnlyStatus) ? 'Submitted' : t('sendCheckin')}
                                            </span>
                                        </button>
                                    </Tooltip>

                                    {/* Check-in Status Indicator
                                    {checkinEmailSent && !shouldDisableCheckinButton && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-2">
                                            <Mail className="w-3 h-3 text-blue-600" />
                                            <span>Email sent</span>
                                        </div>
                                    )} */}

                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                        <button
                                            onClick={handleSendUpdate}
                                            disabled={isSendingUpdate || isReadOnlyStatus}
                                            className={cn(
                                                "w-full px-3 sm:px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 border border-border text-sm sm:text-base",
                                                (isSendingUpdate || isReadOnlyStatus) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                            )}
                                            style={{ fontWeight: 'var(--font-weight-medium)' }}
                                        >
                                            {isSendingUpdate ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Send className="w-4 h-4 text-primary-foreground" />}
                                            <span className="hidden sm:inline">{t('sendUpdate')}</span>
                                            <span className="sm:hidden">{t('sendUpdate')}</span>
                                        </button>
                                    </Tooltip>
                                </>
                            )}

                            {canDeleteBooking && (
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="w-full px-3 sm:px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-destructive/30 text-sm sm:text-base sm:col-span-2 lg:col-span-1 cursor-pointer"
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
                        room: selectedRoom,
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
                                fetchBookingData(false);
                                router.refresh();
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
                    bookingTitle={booking ? `${booking.customer.name} - ${formatDate(booking.event.date)}` : undefined}
                />
            )}
        </div>
    );
}


