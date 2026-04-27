import { KitchenPdfStatus } from '@/services/kitchen-pdf.service';

export interface BookingComment {
    by: string;
    time: string;
    date: string;
    action: string;
    type?: 'system' | 'manual';
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
    menuItems?: Array<{ 
        id?: string; 
        itemId?: string; 
        itemType?: string; 
        item: string; 
        category: string; 
        quantity: string; 
        rawQuantity?: number; 
        unitPrice?: number; 
        internalCost?: number; 
        price: string; 
        notes?: string; 
        customerComment?: string; 
        dietaryType?: 'veg' | 'non-veg' | 'vegan' | 'none'; 
        pricingType?: 'per_person' | 'fixed' | 'flat_fee' | 'usage'; 
        useSpecialCalculation?: boolean 
    }>;
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

export interface AuditLog {
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
