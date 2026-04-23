'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, User, Users, MapPin, CalendarDays, UtensilsCrossed, MessageSquare, Link, Lock, Unlock, History, FileText, RefreshCw, UserPlus, CheckCircle2, Info, Pencil, X, Save, Bell, Mail, CreditCard, ChevronDown, Loader2, Trash2, Package } from 'lucide-react';
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
import { bookingKitchenNotesSchema, bookingCommentSchema, customerNameSchema, customerBusinessSchema, userEmailSchema, customerPhoneSchema, customerStreetSchema, customerPlzSchema, customerLocationSchema, customerOccasionSchema, bookingGuestCountSchema, bookingSpecialRequestsSchema, bookingAllergiesSchema } from '@/lib/validation/schemas';
import { useBookingTranslation, useCommonTranslation, useButtonTranslation } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { useLocale } from 'next-intl';
import { toReadableDate } from '@/lib/utils/date';
import { useSystemTimezone } from '@/lib/hooks/useSystemTimezone';
import { useDateFormat } from '@/lib/contexts/SystemSettingsContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function parseDietaryNotes(text: string | undefined | null) {
    if (!text) return null;
    const parts = text.split(/(\(Veg\)|\(Vegan\)|\(Non-Veg\))/i);
    const result: React.ReactNode[] = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        const lowerPart = part.toLowerCase();
        const isDietary = lowerPart === '(veg)' || lowerPart === '(vegan)' || lowerPart === '(non-veg)';

        if (isDietary) {
            const type = lowerPart.replace(/[()]/g, '') as 'veg' | 'vegan' | 'non-veg';

            // Re-arrange: try to put the icon before the name in the previous text part
            if (result.length > 0 && typeof result[result.length - 1] === 'string') {
                const prevText = result.pop() as string;

                // Find where the name starts. Names follow ":" or ","
                const lastSeparatorIndex = Math.max(
                    prevText.lastIndexOf(':'),
                    prevText.lastIndexOf(',')
                );

                if (lastSeparatorIndex !== -1) {
                    const prefix = prevText.substring(0, lastSeparatorIndex + 1);
                    const name = prevText.substring(lastSeparatorIndex + 1).trim();

                    result.push(prefix);
                    if (name) result.push(' ');
                    // Add icon first, then the name
                    result.push(<DietaryIcon key={`icon-${i}`} type={type} size="xs" />);
                    if (name) {
                        result.push(' ');
                        result.push(name);
                    }
                } else {
                    // No separator, the whole thing is the name
                    result.push(<DietaryIcon key={`icon-${i}`} type={type} size="xs" />);
                    result.push(' ');
                    result.push(prevText.trim());
                }
            } else {
                result.push(<DietaryIcon key={i} type={type} size="xs" />);
            }
        } else {
            result.push(part);
        }
    }

    return result;
}

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
        business?: string;
        street?: string;
        plz?: string;
        location?: string;
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
    billingStreet?: string;
    billingPlz?: string;
    billingLocation?: string;
    billingBusiness?: string;
    billingEmail?: string;
    billingReference?: string;
    paymentMethod?: string;
    status: string;
    notes?: string;
    allergies?: string | string[];
    contactHistory?: Array<BookingComment>;
    isLocked?: boolean;
    kitchenPdf?: KitchenPdfStatus;
    menuItems?: Array<{ id?: string; itemId?: string; itemType?: string; item: string; category: string; quantity: string; rawQuantity?: number; unitPrice?: number; internalCost?: number; price: string; notes?: string; customerComment?: string; dietaryType?: 'veg' | 'non-veg' | 'vegan' | 'none'; pricingType?: 'per_person' | 'fixed' | 'flat_fee' | 'usage'; useSpecialCalculation?: boolean }>;
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

const CATEGORY_ORDER = [
    'Apéro', 'Snacks',
    'Starter', 'Starters', 'Vorspeise', 'Vorspeisen', 
    'Main Course', 'Main Courses', 'Hauptgang', 'Hauptgänge', 'Hauptgericht', 'Hauptgerichte', 'Menü',
    'Dessert', 'Desserts', 'Nachspeise', 'Nachspeisen',
    'Add-on', 'Add-ons', 'Extra', 'Extras', 'Zusatzleistung', 'Zusatzleistungen', 'Choices',
    'Beverage', 'Beverages', 'Drink', 'Drinks', 'Getränk', 'Getränke', 'Softdrinks', 'Wein', 'Wine', 'Bier', 'Beer', 'Kaffee', 'Coffee', 'Spirituosen', 'Spirits', 'Cocktails', 'Longdrinks', 'Digestif'
];

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

        const getHighestPrice = (categoryNames: string[], dietaryFilter?: (d: string) => boolean) => {
            const filtered = ppFoodItems.filter(i => {
                const matchesCategory = categoryNames.some(cn => (i.category || '').toLowerCase() === cn.toLowerCase());
                const matchesDietary = dietaryFilter ? dietaryFilter(i.dietaryType || 'none') : true;
                return matchesCategory && matchesDietary;
            });
            return filtered.length > 0 ? Math.max(...filtered.map(i => i.unitPrice || 0)) : 0;
        };

        const maxStarter = getHighestPrice(['Starters', 'Vorspeisen']);
        const maxVegMain = getHighestPrice(['Main Courses', 'Hauptgänge', 'Menü'], (d) => d === 'veg' || d === 'vegan');
        const maxNonVegMain = getHighestPrice(['Main Courses', 'Hauptgänge', 'Menü'], (d) => d === 'non-veg');
        const maxDessert = getHighestPrice(['Desserts']);

        // Sum up other per-person food items
        const otherPPPrice = ppFoodItems
            .filter(i => !['Starters', 'Vorspeisen', 'Main Courses', 'Hauptgänge', 'Menü', 'Desserts'].includes(i.category))
            .reduce((sum, i) => sum + (i.unitPrice || 0), 0);

        const vegSubtotal = maxStarter + maxVegMain + maxDessert + otherPPPrice;
        const nonVegSubtotal = maxStarter + maxNonVegMain + maxDessert + otherPPPrice;

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
    }, [isEditingMenu, tempMenuItems, booking?.menuItems]);
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
                                <TabsContent value="event-details" className="space-y-4 sm:space-y-6 m-0">
                                    {/* Customer Information */}
                                    {/* Group 1: Kontaktinformationen */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    {/* icon will be different for each section, but the container structure is same */}
                                                    <User className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="truncate">{wizardT('sections.contactInformation')}</span>
                                            </h3>
                                            {canEditBooking && !isLocked && !isEditingCustomer && (
                                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                    <button
                                                        onClick={handleEditCustomer}
                                                        disabled={isReadOnlyStatus}
                                                        className={cn(
                                                            "px-2.5 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0",
                                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                        )}
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        <span className="hidden xs:inline">{buttonT('edit')}</span>
                                                        <span className="xs:hidden">{commonT('edit')}</span>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {isEditingCustomer && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCancelCustomer}
                                                        className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors  bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>{buttonT('cancel')}</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSaveCustomer}
                                                        disabled={isSaving}
                                                        className="px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.name')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingCustomer ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={tempCustomer.name}
                                                            onChange={(e) => {
                                                                setTempCustomer({ ...tempCustomer, name: e.target.value });
                                                                if (errors.customerName) validateCustomerField('name', e.target.value);
                                                            }}
                                                            onBlur={() => validateCustomerField('name', tempCustomer.name)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.customerName ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.customerName && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium truncate" style={{ fontSize: 'var(--text-base)' }} title={booking.customer.name}>{booking.customer.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.business')}</label>
                                                {isEditingCustomer ? (
                                                    <input
                                                        type="text"
                                                        value={tempCustomer.business}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (useSameAddressForBilling) {
                                                                setTempCustomer({ ...tempCustomer, business: val, billingBusiness: val });
                                                            } else {
                                                                setTempCustomer({ ...tempCustomer, business: val });
                                                            }
                                                        }}
                                                        className="w-full px-3 py-1.5 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                        style={{ fontSize: 'var(--text-base)' }}
                                                    />
                                                ) : (
                                                    <p className="text-foreground font-medium truncate" style={{ fontSize: 'var(--text-base)' }} title={booking.customer.business || ''}>{booking.customer.business || '-'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.email')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingCustomer ? (
                                                    <>
                                                        <input
                                                            type="email"
                                                            value={tempCustomer.email}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (useSameAddressForBilling) {
                                                                    setTempCustomer({ ...tempCustomer, email: val, billingEmail: val });
                                                                } else {
                                                                    setTempCustomer({ ...tempCustomer, email: val });
                                                                }
                                                                if (errors.customerEmail) validateCustomerField('email', val);
                                                            }}
                                                            onBlur={() => validateCustomerField('email', tempCustomer.email)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.customerEmail ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.customerEmail && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium truncate" style={{ fontSize: 'var(--text-base)' }} title={booking.customer.email}>{booking.customer.email}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.telephone')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingCustomer ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={tempCustomer.phone}
                                                            onChange={(e) => {
                                                                setTempCustomer({ ...tempCustomer, phone: e.target.value });
                                                                if (errors.customerPhone) validateCustomerField('phone', e.target.value);
                                                            }}
                                                            onBlur={() => validateCustomerField('phone', tempCustomer.phone)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.customerPhone ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.customerPhone && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium truncate" style={{ fontSize: 'var(--text-base)' }} title={booking.customer.phone}>{booking.customer.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group 2: Adresse */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="truncate">{wizardT('sections.address')}</span>
                                            </h3>
                                            {canEditBooking && !isLocked && !isEditingAddress && (
                                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                    <button
                                                        onClick={handleEditAddress}
                                                        disabled={isReadOnlyStatus}
                                                        className={cn(
                                                            "px-2.5 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0",
                                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                        )}
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        <span className="hidden xs:inline">{buttonT('edit')}</span>
                                                        <span className="xs:hidden">{commonT('edit')}</span>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {isEditingAddress && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCancelAddress}
                                                        className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>{buttonT('cancel')}</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSaveAddress}
                                                        disabled={isSaving}
                                                        className="px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.street')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingAddress ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={tempCustomer.street}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (useSameAddressForBilling) {
                                                                    setTempCustomer({ ...tempCustomer, street: val, billingStreet: val });
                                                                } else {
                                                                    setTempCustomer({ ...tempCustomer, street: val });
                                                                }
                                                                if (errors.street) validateCustomerField('street', val);
                                                            }}
                                                            onBlur={() => validateCustomerField('street', tempCustomer.street)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.street ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.street && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.street || '-'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.plz')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingAddress ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={tempCustomer.plz}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (useSameAddressForBilling) {
                                                                    setTempCustomer({ ...tempCustomer, plz: val, billingPlz: val });
                                                                } else {
                                                                    setTempCustomer({ ...tempCustomer, plz: val });
                                                                }
                                                                if (errors.plz) validateCustomerField('plz', val);
                                                            }}
                                                            onBlur={() => validateCustomerField('plz', tempCustomer.plz)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.plz ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.plz && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.plz}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.customer.plz || '-'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.location')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingAddress ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={tempCustomer.location}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (useSameAddressForBilling) {
                                                                    setTempCustomer({ ...tempCustomer, location: val, billingLocation: val });
                                                                } else {
                                                                    setTempCustomer({ ...tempCustomer, location: val });
                                                                }
                                                                if (errors.location) validateCustomerField('location', val);
                                                            }}
                                                            onBlur={() => validateCustomerField('location', tempCustomer.location)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.location ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.location && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                                                        )}
                                                    </>
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
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <CalendarDays className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="truncate">{wizardT('sections.eventDetails')}</span>
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {/* {kitchenPdfStatus && !isEditingEvent && (
                                            <KitchenPdfStatusBadge
                                                status={kitchenPdfStatus.sentStatus}
                                                lastSentAt={kitchenPdfStatus.lastSentAt}
                                            />
                                        )} */}
                                                {canEditBooking && !isLocked && !isEditingEvent && (
                                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                        <button
                                                            onClick={handleEditEvent}
                                                            disabled={isReadOnlyStatus}
                                                            className={cn(
                                                                "px-2.5 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0",
                                                                isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                            )}
                                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                            <span className="hidden xs:inline">{buttonT('edit')}</span>
                                                            <span className="xs:hidden">{commonT('edit')}</span>
                                                        </button>
                                                    </Tooltip>
                                                )}
                                                {isEditingEvent && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleCancelEvent}
                                                            className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>{buttonT('cancel')}</span>
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEvent}
                                                            disabled={isSaving}
                                                            className="px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.eventDate')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingEvent ? (
                                                    <>
                                                        <input
                                                            type="date"
                                                            value={tempEvent.date}
                                                            onChange={(e) => {
                                                                setTempEvent({ ...tempEvent, date: e.target.value });
                                                                if (errors.eventDate) validateEventField('date', e.target.value);
                                                            }}
                                                            onBlur={() => validateEventField('date', tempEvent.date)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.eventDate ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.eventDate && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={formatDate(booking.event.date)}>{formatDate(booking.event.date)}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.eventTime')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingEvent ? (
                                                    <>
                                                        <input
                                                            type="time"
                                                            value={tempEvent.time}
                                                            onChange={(e) => {
                                                                setTempEvent({ ...tempEvent, time: e.target.value });
                                                                if (errors.eventTime) validateEventField('time', e.target.value);
                                                            }}
                                                            onBlur={() => validateEventField('time', tempEvent.time)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.eventTime ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.eventTime && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.eventTime}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }} title={booking.event.time}>{booking.event.time}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                    {wizardT('labels.guestCount')} <span className="text-red-500">*</span>
                                                </label>
                                                {isEditingEvent ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            value={tempEvent.guests}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setTempEvent({ ...tempEvent, guests: val });
                                                                if (errors.guestCount) validateEventField('guests', val);
                                                            }}
                                                            onBlur={() => validateEventField('guests', tempEvent.guests)}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.guestCount ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.guestCount && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.guestCount}</p>
                                                        )}
                                                    </>
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
                                                        onChange={(e) => {
                                                            setTempEvent({ ...tempEvent, occasion: e.target.value });
                                                            if (errors.occasion) validateEventField('occasion', e.target.value);
                                                        }}
                                                        onBlur={() => validateEventField('occasion', tempEvent.occasion)}
                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.occasion ? 'border-red-500' : 'border-border'}`}
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
                                    </div>

                                    {/* Group 4: Spezielle Wünsche */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="truncate">{wizardT('sections.specialRequests')}</span>
                                            </h3>
                                            {canEditBooking && !isLocked && !isEditingSpecialRequests && (
                                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                    <button
                                                        onClick={handleEditSpecialRequests}
                                                        disabled={isReadOnlyStatus}
                                                        className={cn(
                                                            "px-2.5 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0",
                                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                        )}
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        <span className="hidden xs:inline">{buttonT('edit')}</span>
                                                        <span className="xs:hidden">{commonT('edit')}</span>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {isEditingSpecialRequests && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCancelSpecialRequests}
                                                        className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>{buttonT('cancel')}</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSaveSpecialRequests}
                                                        disabled={isSaving}
                                                        className="px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        <span>{buttonT('save')}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('allergies')}</label>
                                                {isEditingSpecialRequests ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={allergies}
                                                            onChange={(e) => {
                                                                setAllergies(e.target.value);
                                                                // Clear error on change
                                                                if (errors.allergies) setErrors({ ...errors, allergies: undefined });
                                                            }}
                                                            onBlur={() => {
                                                                // Validate on blur if not empty
                                                                if (allergies.trim()) {
                                                                    const allergiesResult = bookingAllergiesSchema.safeParse(allergies);
                                                                    if (!allergiesResult.success) {
                                                                        setErrors({ ...errors, allergies: allergiesResult.error.errors[0].message });
                                                                    }
                                                                }
                                                            }}
                                                            className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.allergies ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                        />
                                                        {errors.allergies && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.allergies}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium line-clamp-2" style={{ fontSize: 'var(--text-base)' }} title={Array.isArray(booking.allergies) ? booking.allergies.join(', ') : (booking.allergies || '')}>{Array.isArray(booking.allergies) ? booking.allergies.join(', ') : (booking.allergies || '-')}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{t('internalInstructions')}</label>
                                                {isEditingSpecialRequests ? (
                                                    <>
                                                        <ValidatedTextarea
                                                            value={notes}
                                                            onChange={(e) => {
                                                                setNotes(e.target.value);
                                                                // Clear error on change
                                                                if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
                                                            }}
                                                            onBlur={() => {
                                                                // Validate on blur if not empty
                                                                if (notes.trim()) {
                                                                    const notesResult = bookingSpecialRequestsSchema.safeParse(notes);
                                                                    if (!notesResult.success) {
                                                                        setErrors({ ...errors, specialRequests: notesResult.error.errors[0].message });
                                                                    }
                                                                }
                                                            }}
                                                            className={`w-full bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.specialRequests ? 'border-red-500' : 'border-border'}`}
                                                            style={{ fontSize: 'var(--text-base)' }}
                                                            rows={3}
                                                        />
                                                        {errors.specialRequests && (
                                                            <p className="text-red-500 text-xs mt-1">{errors.specialRequests}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="text-foreground font-medium line-clamp-3" style={{ fontSize: 'var(--text-base)' }} title={booking.notes || ''}>{booking.notes || '-'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group 5: Zahlungsmöglichkeiten */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <CreditCard className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="truncate">{wizardT('sections.paymentOptions')}</span>
                                            </h3>
                                            {canEditBooking && !isLocked && !isEditingPayment && (
                                                <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                    <button
                                                        onClick={handleEditPayment}
                                                        disabled={isReadOnlyStatus}
                                                        className={cn(
                                                            "px-2.5 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-1.5 flex-shrink-0 ml-auto sm:ml-0",
                                                            isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                        )}
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                        <span className="hidden xs:inline">{buttonT('edit')}</span>
                                                        <span className="xs:hidden">{commonT('edit')}</span>
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {isEditingPayment && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleCancelPayment}
                                                        className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2"
                                                        style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span>{buttonT('cancel')}</span>
                                                    </button>
                                                    <button
                                                        onClick={handleSavePayment}
                                                        disabled={isSaving}
                                                        className="px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
                                                                onChange={() => {
                                                                    setTempCustomer({ ...tempCustomer, paymentMethod: 'ec_card' });
                                                                    if (errors.paymentMethod) validatePaymentField('paymentMethod', 'ec_card');
                                                                }}
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
                                                                onChange={() => {
                                                                    setTempCustomer({ ...tempCustomer, paymentMethod: 'on_bill' });
                                                                    if (errors.paymentMethod) validatePaymentField('paymentMethod', 'on_bill');
                                                                }}
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                                                    {wizardT('labels.onInvoice') || 'Auf Rechnung'}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    {errors.paymentMethod && (
                                                        <p className="text-red-500 text-xs">{errors.paymentMethod}</p>
                                                    )}

                                                    {tempCustomer.paymentMethod === 'on_bill' && (
                                                        <div className="space-y-4 mt-6 pt-6 border-t border-border">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id="sameAddressBilling"
                                                                    checked={useSameAddressForBilling}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked;
                                                                        setUseSameAddressForBilling(checked);
                                                                        if (checked) {
                                                                            setTempCustomer({
                                                                                ...tempCustomer,
                                                                                billingStreet: tempCustomer.street,
                                                                                billingPlz: tempCustomer.plz,
                                                                                billingLocation: tempCustomer.location,
                                                                                billingBusiness: tempCustomer.business,
                                                                                billingEmail: tempCustomer.email
                                                                            });
                                                                            // Clear validation errors for billing fields
                                                                            setErrors(prev => ({
                                                                                ...prev,
                                                                                billingStreet: undefined,
                                                                                billingPlz: undefined,
                                                                                billingLocation: undefined,
                                                                                billingBusiness: undefined,
                                                                                billingEmail: undefined
                                                                            }));
                                                                        } else {
                                                                            setTempCustomer({
                                                                                ...tempCustomer,
                                                                                billingStreet: '',
                                                                                billingPlz: '',
                                                                                billingLocation: '',
                                                                                billingBusiness: '',
                                                                                billingEmail: ''
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                                                />
                                                                <label
                                                                    htmlFor="sameAddressBilling"
                                                                    className="text-sm text-foreground cursor-pointer select-none"
                                                                    style={{ fontSize: 'var(--text-small)' }}
                                                                >
                                                                    {wizardT('labels.useSameAddress') || 'Same as customer address'}
                                                                </label>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div className="sm:col-span-2 space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                                        {wizardT('labels.street')} <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={tempCustomer.billingStreet}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingStreet: e.target.value });
                                                                            if (useSameAddressForBilling) {
                                                                                setTempCustomer(prev => ({ ...prev, street: e.target.value }));
                                                                                if (errors.street) validateCustomerField('street', e.target.value);
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!useSameAddressForBilling) {
                                                                                validatePaymentField('billingStreet', tempCustomer.billingStreet);
                                                                            }
                                                                        }}
                                                                        disabled={useSameAddressForBilling}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingStreet ? 'border-red-500' : 'border-border'} ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.street') || 'Strasse eingeben'}
                                                                    />
                                                                    {errors.billingStreet && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingStreet}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                                        {wizardT('labels.billingBusiness')}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={tempCustomer.billingBusiness}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingBusiness: e.target.value });
                                                                            if (useSameAddressForBilling) {
                                                                                setTempCustomer(prev => ({ ...prev, business: e.target.value }));
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!useSameAddressForBilling) {
                                                                                validatePaymentField('billingBusiness', tempCustomer.billingBusiness);
                                                                            }
                                                                        }}
                                                                        disabled={useSameAddressForBilling}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingBusiness ? 'border-red-500' : 'border-border'} ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.billingBusiness') || 'Company Name'}
                                                                    />
                                                                    {errors.billingBusiness && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingBusiness}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                                        {wizardT('labels.billingEmail')}
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        value={tempCustomer.billingEmail}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingEmail: e.target.value });
                                                                            if (useSameAddressForBilling) {
                                                                                setTempCustomer(prev => ({ ...prev, email: e.target.value }));
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!useSameAddressForBilling) {
                                                                                validatePaymentField('billingEmail', tempCustomer.billingEmail);
                                                                            }
                                                                        }}
                                                                        disabled={useSameAddressForBilling}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingEmail ? 'border-red-500' : 'border-border'} ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.billingEmail') || 'billing@company.com'}
                                                                    />
                                                                    {errors.billingEmail && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingEmail}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                                        {wizardT('labels.plz')} <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={tempCustomer.billingPlz}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingPlz: e.target.value });
                                                                            if (useSameAddressForBilling) {
                                                                                setTempCustomer(prev => ({ ...prev, plz: e.target.value }));
                                                                                if (errors.plz) validateCustomerField('plz', e.target.value);
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!useSameAddressForBilling) {
                                                                                validatePaymentField('billingPlz', tempCustomer.billingPlz);
                                                                            }
                                                                        }}
                                                                        disabled={useSameAddressForBilling}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingPlz ? 'border-red-500' : 'border-border'} ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.plz') || 'PLZ'}
                                                                    />
                                                                    {errors.billingPlz && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingPlz}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                                        {wizardT('labels.location')} <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={tempCustomer.billingLocation}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingLocation: e.target.value });
                                                                            if (useSameAddressForBilling) {
                                                                                setTempCustomer(prev => ({ ...prev, location: e.target.value }));
                                                                                if (errors.location) validateCustomerField('location', e.target.value);
                                                                            }
                                                                        }}
                                                                        onBlur={() => {
                                                                            if (!useSameAddressForBilling) {
                                                                                validatePaymentField('billingLocation', tempCustomer.billingLocation);
                                                                            }
                                                                        }}
                                                                        disabled={useSameAddressForBilling}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingLocation ? 'border-red-500' : 'border-border'} ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.location') || 'Ort'}
                                                                    />
                                                                    {errors.billingLocation && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingLocation}</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.reference')}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={tempCustomer.billingReference}
                                                                        onChange={(e) => {
                                                                            setTempCustomer({ ...tempCustomer, billingReference: e.target.value });
                                                                            if (errors.billingReference) validatePaymentField('billingReference', e.target.value);
                                                                        }}
                                                                        onBlur={() => validatePaymentField('billingReference', tempCustomer.billingReference)}
                                                                        className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${errors.billingReference ? 'border-red-500' : 'border-border'}`}
                                                                        style={{ fontSize: 'var(--text-base)' }}
                                                                        placeholder={wizardT('placeholders.billingReference') || 'Referenznummer hinzufügen'}
                                                                    />
                                                                    {errors.billingReference && (
                                                                        <p className="text-red-500 text-xs mt-1">{errors.billingReference}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="sm:col-span-2 space-y-1">
                                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.paymentOption')}</label>
                                                        <div className="flex items-center gap-2 py-1.5">
                                                            <div className={`w-2 h-2 rounded-full bg-primary`} />
                                                            <span className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                {booking.paymentMethod === 'on_bill' ? (wizardT('labels.onInvoice')) :
                                                                    (wizardT('labels.ecCard') || 'EC-Karte / Karte vor Ort')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {booking.paymentMethod === 'on_bill' && (
                                                        <>
                                                            <div className="sm:col-span-2 space-y-1">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.street')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {(booking as any).billingStreet || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.plz')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {(booking as any).billingPlz || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.location')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {booking.billingLocation || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingBusiness')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {booking.billingBusiness || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingEmail')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {booking.billingEmail || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-1 sm:col-span-2">
                                                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.reference')}</label>
                                                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                                                    {booking.billingReference || '-'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Menu Details Tab */}
                                <TabsContent value="menu-details" className="space-y-6">
                                    {/* Menu Items */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <UtensilsCrossed className="w-5 h-5 text-primary flex-shrink-0" />
                                                <span className="truncate">{t('menuItems')}</span>
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {canEditBooking && !isLocked && !isEditingMenu && (
                                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                        <button
                                                            onClick={handleEditMenu}
                                                            disabled={isReadOnlyStatus}
                                                            className={cn(
                                                                "px-3 py-1.5 border border-border hover:bg-secondary hover:text-white rounded-lg transition-colors bg-primary text-secondary flex items-center gap-2",
                                                                isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                            )}
                                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                            <span>{buttonT('edit')}</span>
                                                        </button>
                                                    </Tooltip>
                                                )}
                                                {canEditBooking && !isLocked && !isEditingMenu && (
                                                    <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""}>
                                                        <button
                                                            onClick={handleEditItems}
                                                            disabled={isReadOnlyStatus}
                                                            className={cn(
                                                                "px-3 py-1.5 border border-border hover:bg-primary hover:text-secondary rounded-lg transition-colors bg-secondary text-white flex items-center gap-2",
                                                                isReadOnlyStatus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                            )}
                                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                        >
                                                            <UtensilsCrossed className="w-3.5 h-3.5" />
                                                            <span>{commonT('editItems')}</span>
                                                        </button>
                                                    </Tooltip>
                                                )}
                                                {isEditingMenu && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleCancelMenu}
                                                            disabled={isSaving}
                                                            className="px-3 py-1.5 border border-border hover:bg-red-600 hover:text-white rounded-lg transition-colors bg-red-500 text-white hover:text-red-500 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                            <span>{buttonT('cancel')}</span>
                                                        </button>
                                                        <button
                                                            onClick={handleSaveMenu}
                                                            disabled={isSaving}
                                                            className="px-3 py-1.5 border border-border hover:bg-secondary rounded-lg transition-colors bg-primary text-secondary hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                        <div className="bg-background border border-border rounded-lg overflow-x-auto -mx-2 sm:mx-0">
                                            <table className="w-full min-w-[500px] sm:min-w-0">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('item')}</th>
                                                        <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm hidden sm:table-cell" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{commonT('category')}</th>
                                                        <th className="px-3 py-3 text-left text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('quantity')}</th>
                                                        <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{buttonT('price')}</th>
                                                        <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('internalCost')}</th>
                                                        <th className="px-3 py-3 text-right text-foreground text-xs sm:text-sm" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('profit')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const items = (isEditingMenu ? tempMenuItems : booking.menuItems) || [];
                                                        const getSortIndex = (catName: string) => {
                                                            if (!catName) return 999;
                                                            if (!allCategories || allCategories.length === 0) {
                                                                const idx = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === catName.toLowerCase());
                                                                return idx === -1 ? 998 : idx;
                                                            }
                                                            const cat = allCategories.find(c => 
                                                                c.name?.toLowerCase() === catName.toLowerCase() || 
                                                                c.nameDe?.toLowerCase() === catName.toLowerCase()
                                                            );
                                                            return cat ? (cat.sortOrder ?? 0) : 997;
                                                        };

                                                        const sortedItems = [...items].sort((a, b) => {
                                                            const idxA = getSortIndex(a.category);
                                                            const idxB = getSortIndex(b.category);
                                                            if (idxA !== idxB) return idxA - idxB;
                                                            return (a.item || a.name || '').localeCompare(b.item || b.name || '');
                                                        });
                                                        
                                                        // Helper to identify beverage categories
                                                        const isBevCategory = (cat: string) => 
                                                            ['Beverages', 'Drink', 'Drinks', 'Softdrinks', 'Wein', 'Bier', 'Kaffee', 'Wine', 'Beer', 'Getränk', 'Getränke', 'Spirituosen', 'Spirits', 'Cocktails', 'Longdrinks', 'Digestif'].some(c => c.toLowerCase() === (cat || '').toLowerCase());
                                                        
                                                        // Helper to identify flat fees
                                                        const isFlatFee = (item: any) => 
                                                            item.pricingType === 'flat-rate' || item.pricingType === 'flat_fee' || (item.category || '').toLowerCase() === 'add-ons' || (item.category || '').toLowerCase() === 'extra';

                                                        const foodItems = sortedItems.filter(item => !isBevCategory(item.category) && !isFlatFee(item));
                                                        const beverageItems = sortedItems.filter(item => isBevCategory(item.category));
                                                        const addonItems = sortedItems.filter(item => isFlatFee(item) && !isBevCategory(item.category));

                                                        const groups = [
                                                            { name: 'Food Items', items: foodItems },
                                                            { name: 'Beverages', items: beverageItems },
                                                            { name: 'Add-ons', items: addonItems }
                                                        ].filter(g => g.items.length > 0);

                                                        if (groups.length === 0) {
                                                            return <tr><td colSpan={6} className="px-3 py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">{t('noItemsSelected')}</td></tr>;
                                                        }

                                                        return groups.map((group, groupIdx) => (
                                                            <React.Fragment key={group.name}>
                                                                <tr className="bg-muted/40 group-header">
                                                                    <td colSpan={6} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border bg-muted/20">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                                                            {group.name}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {group.items.map((item: any, idx: number) => (
                                                                    <tr key={item.id || item.itemId || `row-${groupIdx}-${idx}`} className="border-t border-border/50 hover:bg-muted/10 transition-colors">
                                                                        <td className="px-3 py-3 text-foreground text-xs sm:text-sm">
                                                                            <div className="flex flex-col gap-1.5 py-1">
                                                                                <div className="flex flex-wrap items-center gap-x-2 font-medium text-foreground" title={item.item || item.name}>
                                                                                    <div className="flex items-center gap-x-1">
                                                                                        {item.dietaryType && item.dietaryType !== 'none' && (
                                                                                            <DietaryIcon type={item.dietaryType} size="sm" />
                                                                                        )}
                                                                                        <span className="truncate max-w-[200px] sm:max-w-[300px] inline-block" title={item.item || item.name}>{item.item || item.name}</span>
                                                                                        {item.variant && (
                                                                                            <span className="ml-1.5 text-muted-foreground font-normal">
                                                                                                ({item.variant})
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                {item.notes && (
                                                                                    <div className="flex items-start gap-1.5 text-primary/80">
                                                                                        <UtensilsCrossed className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                                        <span className="text-[12px] leading-tight font-medium inline-flex items-center flex-wrap gap-x-0.5 line-clamp-2" title={item.notes}>
                                                                                            {parseDietaryNotes(item.notes)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                {item.customerComment && (
                                                                                    <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-500">
                                                                                        <MessageSquare className="w-3 h-3 mt-1 flex-shrink-0" />
                                                                                        <span className="text-[12px] italic leading-tight line-clamp-2" title={item.customerComment}>
                                                                                            Note: {item.customerComment}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-3 text-muted-foreground text-xs sm:text-sm hidden sm:table-cell" title={item.category}>{item.category}</td>
                                                                        <td className="px-3 py-3 text-foreground text-xs sm:text-sm">
                                                                            {isEditingMenu ? (
                                                                                <div className="flex items-center gap-2" translate="no">
                                                                                    <input
                                                                                        type="number"
                                                                                        value={item.rawQuantity}
                                                                                        min="1"
                                                                                        onChange={(e) => {
                                                                                            const val = parseInt(e.target.value);
                                                                                            const targetId = item.id || item.itemId;
                                                                                            const newItems = tempMenuItems.map(ti => {
                                                                                                if ((ti.id || ti.itemId) === targetId) {
                                                                                                    return { ...ti, rawQuantity: isNaN(val) ? 0 : Math.max(0, val) };
                                                                                                }
                                                                                                return ti;
                                                                                            });
                                                                                            setTempMenuItems(newItems);
                                                                                        }}
                                                                                        onBlur={(e) => {
                                                                                            const val = parseInt(e.target.value);
                                                                                            if (isNaN(val) || val < 1) {
                                                                                                const targetId = item.id || item.itemId;
                                                                                                const newItems = tempMenuItems.map(ti => {
                                                                                                    if ((ti.id || ti.itemId) === targetId) {
                                                                                                        return { ...ti, rawQuantity: 1 };
                                                                                                    }
                                                                                                    return ti;
                                                                                                });
                                                                                                setTempMenuItems(newItems);
                                                                                            }
                                                                                        }}
                                                                                        className="w-20 px-2 py-1 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                                                                    />
                                                                                    <Tooltip title={`${item.item || item.name}: ${item.rawQuantity} ${item.pricingType === 'per_person' ? t('guests') : t('quantity')}`}>
                                                                                        <span className="text-muted-foreground">
                                                                                            {item.pricingType === 'per_person' ? (
                                                                                                <Users className="w-3.5 h-3.5" />
                                                                                            ) : (
                                                                                                <Package className="w-3.5 h-3.5" />
                                                                                            )}
                                                                                        </span>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex flex-col gap-0.5" translate="no">
                                                                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                                                        <span className="font-medium text-foreground">{item.rawQuantity}</span>
                                                                                        <Tooltip title={`${item.item || item.name}: ${item.rawQuantity} ${item.pricingType === 'per_person' ? t('guests') : t('quantity')}`}>
                                                                                            {item.pricingType === 'per_person' ? (
                                                                                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                                                            ) : (
                                                                                                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                                                                            )}
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                    <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                                                        x {Math.round(item.unitPrice || 0)} CHF
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                                            {isEditingMenu ? (
                                                                                <span>CHF {((item.rawQuantity || 0) * (item.unitPrice || 0)).toFixed(2)}</span>
                                                                            ) : (
                                                                                <span>{item.price}</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" translate="no">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <div className="font-medium text-foreground">
                                                                                    CHF {((item.rawQuantity || 0) * (item.internalCost || 0)).toFixed(2)}
                                                                                </div>
                                                                                <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                                                    x {item.internalCost || 0} CHF
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm whitespace-nowrap" style={{ fontWeight: 'var(--font-weight-semibold)' }} translate="no">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <div className="font-bold text-primary text-xs sm:text-sm">
                                                                                    CHF {((item.rawQuantity || 0) * ((item.unitPrice || 0) - (item.internalCost || 0))).toFixed(2)}
                                                                                </div>
                                                                                <div className="text-xs sm:text-xs text-muted-foreground whitespace-nowrap">
                                                                                    x {((item.unitPrice || 0) - (item.internalCost || 0)).toFixed(2)} CHF
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </React.Fragment>
                                                        ));
                                                    })()}
                                                    {booking.menuItems && booking.menuItems.length > 0 && (
                                                        <tr className="border-t-2 border-border bg-muted">
                                                            <td colSpan={2} className="px-3 py-3 text-foreground text-xs sm:text-sm sm:hidden" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('totalAmount')}</td>
                                                            <td colSpan={3} className="px-3 py-3 text-foreground text-xs sm:text-sm hidden sm:table-cell" style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t('totalAmount')}</td>
                                                            <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold" translate="no">
                                                                {isEditingMenu ? (
                                                                    <span>CHF {tempMenuItems.reduce((sum, item) => sum + ((item.rawQuantity || 0) * (item.unitPrice || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                ) : (
                                                                    <span>{booking.amount}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold text-foreground whitespace-nowrap" translate="no">
                                                                <span>
                                                                    CHF {(isEditingMenu ? tempMenuItems : booking.menuItems)!.reduce((sum, item) => sum + ((item.rawQuantity || 0) * (item.internalCost || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3 text-right text-foreground text-xs sm:text-sm font-bold whitespace-nowrap" translate="no">
                                                                <span className="bg-primary px-2.5 py-1 rounded-lg shadow-sm inline-block">
                                                                    CHF {(isEditingMenu ? tempMenuItems : booking.menuItems)!.reduce((sum, item) => sum + ((item.rawQuantity || 0) * ((item.unitPrice || 0) - (item.internalCost || 0))), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Dietary Summary Section */}
                                    {(dietarySummary.veg.count > 0 || dietarySummary.nonVeg.count > 0) && (
                                        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <h3 className="text-foreground mb-5 flex items-center gap-2" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <UtensilsCrossed className="w-5 h-5 text-primary" /> {t('dietarySelection')}
                                            </h3>
                                            <div className="space-y-4">
                                                {dietarySummary.veg.count > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <DietaryIcon type="veg" size="sm" />
                                                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                                Veg Selection ({dietarySummary.veg.count} {dietarySummary.veg.count > 1 ? 'items' : 'item'})
                                                            </span>
                                                        </div>
                                                        <span className="text-foreground font-bold">CHF {dietarySummary.veg.subtotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {dietarySummary.nonVeg.count > 0 && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <DietaryIcon type="non-veg" size="sm" />
                                                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                                                Non-Veg Selection ({dietarySummary.nonVeg.count} {dietarySummary.nonVeg.count > 1 ? 'items' : 'item'})
                                                            </span>
                                                        </div>
                                                        <span className="text-foreground font-bold">CHF {dietarySummary.nonVeg.subtotal.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Comments and Activities Tab */}
                                <TabsContent value="comments-activities" className="space-y-6">
                                    {/* Manual Comments Section */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                                                <span className="truncate">{t('manualComments')}</span>
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
                                                        <Tooltip title={isReadOnlyStatus ? readOnlyTooltip : ""} position="bottom">
                                                            <button
                                                                onClick={handleAddComment}
                                                                disabled={!newComment.trim() || isAddingComment || isReadOnlyStatus}
                                                                className={cn(
                                                                    "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-semibold shadow-sm shadow-primary/10 hover:shadow-primary/20 active:scale-95",
                                                                    (isAddingComment || isReadOnlyStatus) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                                                )}
                                                                style={{ fontSize: 'var(--text-small)' }}
                                                            >
                                                                {isAddingComment ? (
                                                                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Send className="w-3.5 h-3.5" />
                                                                )}
                                                                <span>{t('addComment')}</span>
                                                            </button>
                                                        </Tooltip>
                                                    </ValidatedTextarea>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activity Log Section */}
                                    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                                        <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                                            <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                                                <History className="w-5 h-5 text-primary flex-shrink-0" />
                                                <span className="truncate">{t('activityLog')}</span>
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
                                                                            <span className="text-muted-foreground ml-2">({(latestCheckin.vegetarianCount || 0) + (latestCheckin.veganCount || 0)} Veg / {latestCheckin.nonVegetarianCount} Non-Veg)</span>
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
                                                                        <p className="text-sm italic line-clamp-3" title={latestCheckin.menuChanges}>{latestCheckin.menuChanges}</p>
                                                                    </div>
                                                                )}

                                                                {latestCheckin.additionalDetails && (
                                                                    <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border/50">
                                                                        <p className="text-[10px] uppercase text-primary font-bold">Additional Details</p>
                                                                        <p className="text-sm italic line-clamp-3" title={latestCheckin.additionalDetails}>{latestCheckin.additionalDetails}</p>
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
                <p
                    className={cn(
                        "text-foreground leading-relaxed line-clamp-3 break-words",
                        isSystem ? "text-muted-foreground italic" : "text-foreground font-medium"
                    )}
                    style={{ fontSize: 'var(--text-base)' }}
                    title={contact.action}
                >
                    {contact.action}
                </p>
            </div>
        </div>
    );
}
