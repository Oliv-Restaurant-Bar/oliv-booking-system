'use client';

import React from 'react';
import { User, MapPin, CalendarDays, Info, CreditCard, Pencil, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabsContent } from '@/components/ui/tabs';
import { Tooltip } from '@/components/user/Tooltip';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { Booking } from './types';

interface EventDetailsTabProps {
    booking: Booking;
    canEditBooking: boolean;
    isLocked: boolean;
    isReadOnlyStatus: boolean;
    readOnlyTooltip: string;
    isSaving: boolean;
    wizardT: any;
    buttonT: any;
    commonT: any;
    t: any;
    formatDate: (date: string) => string;
    
    // Customer Editing
    isEditingCustomer: boolean;
    handleEditCustomer: () => void;
    handleCancelCustomer: () => void;
    handleSaveCustomer: () => void;
    tempCustomer: any;
    setTempCustomer: (val: any) => void;
    validateCustomerField: (field: any, value: any) => void;
    
    // Address Editing
    isEditingAddress: boolean;
    handleEditAddress: () => void;
    handleCancelAddress: () => void;
    handleSaveAddress: () => void;
    
    // Event Editing
    isEditingEvent: boolean;
    handleEditEvent: () => void;
    handleCancelEvent: () => void;
    handleSaveEvent: () => void;
    tempEvent: any;
    setTempEvent: (val: any) => void;
    validateEventField: (field: any, value: any) => void;
    selectedRoom: string;
    setSelectedRoom: (val: string) => void;
    currentGuests: number;
    
    // Special Requests Editing
    isEditingSpecialRequests: boolean;
    handleEditSpecialRequests: () => void;
    handleCancelSpecialRequests: () => void;
    handleSaveSpecialRequests: () => void;
    allergies: string;
    setAllergies: (val: string) => void;
    notes: string;
    setNotes: (val: string) => void;
    
    // Payment Editing
    isEditingPayment: boolean;
    handleEditPayment: () => void;
    handleCancelPayment: () => void;
    handleSavePayment: () => void;
    useSameAddressForBilling: boolean;
    setUseSameAddressForBilling: (val: boolean) => void;
    validatePaymentField: (field: any, value: any) => void;
    
    errors: any;
    setErrors: (val: any) => void;
}

export function EventDetailsTab({
    booking,
    canEditBooking,
    isLocked,
    isReadOnlyStatus,
    readOnlyTooltip,
    isSaving,
    wizardT,
    buttonT,
    commonT,
    t,
    formatDate,
    isEditingCustomer,
    handleEditCustomer,
    handleCancelCustomer,
    handleSaveCustomer,
    tempCustomer,
    setTempCustomer,
    validateCustomerField,
    isEditingAddress,
    handleEditAddress,
    handleCancelAddress,
    handleSaveAddress,
    isEditingEvent,
    handleEditEvent,
    handleCancelEvent,
    handleSaveEvent,
    tempEvent,
    setTempEvent,
    validateEventField,
    selectedRoom,
    setSelectedRoom,
    currentGuests,
    isEditingSpecialRequests,
    handleEditSpecialRequests,
    handleCancelSpecialRequests,
    handleSaveSpecialRequests,
    allergies,
    setAllergies,
    notes,
    setNotes,
    isEditingPayment,
    handleEditPayment,
    handleCancelPayment,
    handleSavePayment,
    useSameAddressForBilling,
    setUseSameAddressForBilling,
    validatePaymentField,
    errors,
    setErrors
}: EventDetailsTabProps) {
    return (
        <TabsContent value="event-details" className="space-y-4 sm:space-y-6 m-0">
            {/* Customer Information */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
                    <h3 className="text-foreground flex items-center gap-2 min-w-0" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
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

            {/* Address */}
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

            {/* Special Requests */}
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
                                        if (errors.allergies) setErrors({ ...errors, allergies: undefined });
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
                                        if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
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

            {/* Payment Options */}
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
                                                    setErrors((prev: any) => ({
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
                                                        setTempCustomer((prev: any) => ({ ...prev, street: e.target.value }));
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
                                        {/* Billing Business */}
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
                                                        setTempCustomer((prev: any) => ({ ...prev, business: e.target.value }));
                                                    }
                                                }}
                                                disabled={useSameAddressForBilling}
                                                className={`w-full px-3 py-1.5 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground ${useSameAddressForBilling ? 'opacity-50 cursor-not-allowed' : 'border-border'}`}
                                                style={{ fontSize: 'var(--text-base)' }}
                                                placeholder={wizardT('placeholders.business') || 'Firma eingeben'}
                                            />
                                        </div>
                                        {/* Billing Email */}
                                        <div className="space-y-1">
                                            <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>
                                                {wizardT('labels.billingEmail')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={tempCustomer.billingEmail}
                                                onChange={(e) => {
                                                    setTempCustomer({ ...tempCustomer, billingEmail: e.target.value });
                                                    if (useSameAddressForBilling) {
                                                        setTempCustomer((prev: any) => ({ ...prev, email: e.target.value }));
                                                        if (errors.customerEmail) validateCustomerField('email', e.target.value);
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
                                                placeholder={wizardT('placeholders.email') || 'E-Mail eingeben'}
                                            />
                                            {errors.billingEmail && (
                                                <p className="text-red-500 text-xs mt-1">{errors.billingEmail}</p>
                                            )}
                                        </div>
                                        {/* Billing PLZ */}
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
                                                        setTempCustomer((prev: any) => ({ ...prev, plz: e.target.value }));
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
                                                placeholder={wizardT('placeholders.plz') || 'PLZ eingeben'}
                                            />
                                            {errors.billingPlz && (
                                                <p className="text-red-500 text-xs mt-1">{errors.billingPlz}</p>
                                            )}
                                        </div>
                                        {/* Billing Location */}
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
                                                        setTempCustomer((prev: any) => ({ ...prev, location: e.target.value }));
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
                                                placeholder={wizardT('placeholders.location') || 'Ort eingeben'}
                                            />
                                            {errors.billingLocation && (
                                                <p className="text-red-500 text-xs mt-1">{errors.billingLocation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-1">
                                <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.paymentMethod')}</label>
                                <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>
                                    {booking.paymentMethod === 'ec_card' ? (wizardT('labels.ecCard') || 'EC-Karte') : (wizardT('labels.onInvoice') || 'Auf Rechnung')}
                                </p>
                            </div>
                            {booking.paymentMethod === 'on_bill' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingStreet')}</label>
                                        <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.billingStreet || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingEmail')}</label>
                                        <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.billingEmail || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingLocation')}</label>
                                        <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.billingPlz} {booking.billingLocation || '-'}</p>
                                    </div>
                                    {booking.billingBusiness && (
                                        <div className="space-y-1">
                                            <label className="text-muted-foreground block" style={{ fontSize: 'var(--text-small)' }}>{wizardT('labels.billingBusiness')}</label>
                                            <p className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{booking.billingBusiness}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
    );
}
