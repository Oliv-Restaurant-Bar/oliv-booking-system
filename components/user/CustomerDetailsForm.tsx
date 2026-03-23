import { User, ClipboardList, MapPin, Calendar, CreditCard, Building2 } from 'lucide-react';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { Input } from '@/components/ui/input';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';
import { EventDetails } from '@/lib/types';

interface CustomerDetailsFormProps {
    eventDetails: EventDetails;
    setEventDetails: (details: EventDetails) => void;
    errors: Partial<EventDetails>;
    setErrors: (errors: Partial<EventDetails>) => void;
    touched: Record<string, boolean>;
    setTouched: (touched: Record<string, boolean>) => void;
    displayErrors: Partial<EventDetails>;
    setIsDateTimePickerOpen: (isOpen: boolean) => void;
}

export function CustomerDetailsForm({
    eventDetails,
    setEventDetails,
    errors,
    setErrors,
    touched,
    setTouched,
    displayErrors,
    setIsDateTimePickerOpen
}: CustomerDetailsFormProps) {
    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                        <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Tell us about your event
                    </h3>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    Please fill out all the required information below
                </p>
            </div>

            {/* Grouped Sections with Background */}
            <div className="space-y-4">
                {/* Contact Information Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <User className="w-4 h-4 text-primary" />
                        Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ValidatedInput
                            label="Name"
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, name: true });
                                if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Max Mustermann"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.name}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label="Business"
                            type="text"
                            value={eventDetails.business}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, business: e.target.value });
                                if (errors.business) setErrors({ ...errors, business: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, business: true });
                                if (errors.business) setErrors({ ...errors, business: undefined });
                            }}
                            placeholder="Musterfirma AG"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.business}
                            helperText="Optional"
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label="Email"
                            type="email"
                            value={eventDetails.email}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, email: true });
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            placeholder="max@firma.ch"
                            maxLength={255}
                            showCharacterCount
                            error={displayErrors.email}
                            helperText="Must be a valid email address"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label="Telephone"
                            type="tel"
                            value={eventDetails.telephone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9+\s]/g, '');
                                setEventDetails({ ...eventDetails, telephone: value });
                                if (errors.telephone) setErrors({ ...errors, telephone: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, telephone: true });
                                if (errors.telephone) setErrors({ ...errors, telephone: undefined });
                            }}
                            placeholder="07XXXXXXXX"
                            maxLength={20}
                            showCharacterCount
                            error={displayErrors.telephone}
                            helperText="Min. 10 characters"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <MapPin className="w-4 h-4 text-primary" />
                        Address
                    </h4>
                    <div className="space-y-4">
                        <ValidatedInput
                            label="Strasse & Nr."
                            type="text"
                            value={eventDetails.street}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, street: e.target.value });
                                if (errors.street) setErrors({ ...errors, street: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, street: true });
                                if (errors.street) setErrors({ ...errors, street: undefined });
                            }}
                            placeholder="Musterstrasse 123"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.street}
                            helperText="Min. 5 characters"
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ValidatedInput
                                label="PLZ"
                                type="text"
                                value={eventDetails.plz}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setEventDetails({ ...eventDetails, plz: value });
                                    if (errors.plz) setErrors({ ...errors, plz: undefined });
                                }}
                                onBlur={() => {
                                    setTouched({ ...touched, plz: true });
                                    if (errors.plz) setErrors({ ...errors, plz: undefined });
                                }}
                                placeholder="3000"
                                maxLength={10}
                                showCharacterCount
                                error={displayErrors.plz}
                                helperText="Min. 4 characters"
                                required
                                className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                            />

                            <ValidatedInput
                                label="Location"
                                type="text"
                                value={eventDetails.location}
                                onChange={(e) => {
                                    setEventDetails({ ...eventDetails, location: e.target.value });
                                    if (errors.location) setErrors({ ...errors, location: undefined });
                                }}
                                onBlur={() => {
                                    setTouched({ ...touched, location: true });
                                    if (errors.location) setErrors({ ...errors, location: undefined });
                                }}
                                placeholder="Bern"
                                maxLength={50}
                                showCharacterCount
                                error={displayErrors.location}
                                helperText="Min. 2 characters"
                                required
                                className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                            />
                        </div>
                    </div>
                </div>

                {/* Event Details Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <Calendar className="w-4 h-4 text-primary" />
                        Event Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Date & Time Picker */}
                        <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                                Date & Time *
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsDateTimePickerOpen(true)}
                                className={`
                                        w-full px-4 py-3 bg-background border rounded-lg transition-colors text-left
                                        flex items-center justify-between group
                                        ${(errors.eventDate || errors.eventTime) ? 'border-destructive' : 'border-border hover:border-primary hover:shadow-sm'}
                                      `}
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            >
                                <span className={(eventDetails.eventDate || eventDetails.eventTime) ? 'text-foreground' : 'text-muted-foreground'}>
                                    {eventDetails.eventDate && eventDetails.eventTime
                                        ? `${new Date(eventDetails.eventDate).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })} um ${eventDetails.eventTime}`
                                        : eventDetails.eventDate
                                            ? new Date(eventDetails.eventDate).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : eventDetails.eventTime
                                                ? eventDetails.eventTime
                                                : 'Date & Time'
                                    }
                                </span>
                                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </button>
                            {(errors.eventDate || errors.eventTime) && (
                                <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                    {errors.eventDate || errors.eventTime}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                                Number of guests *
                            </label>
                            <Input
                                type="number"
                                value={eventDetails.guestCount}
                                onChange={(e) => {
                                    setEventDetails({ ...eventDetails, guestCount: e.target.value });
                                    if (errors.guestCount) setErrors({ ...errors, guestCount: undefined });
                                }}
                                onBlur={() => {
                                    setTouched({ ...touched, guestCount: true });
                                    if (errors.guestCount) setErrors({ ...errors, guestCount: undefined });
                                }}
                                className={`w-full px-4 py-2.5 bg-background border rounded-lg transition-colors ${displayErrors.guestCount ? 'border-destructive' : 'border-border focus:border-primary'
                                    }`}
                                placeholder="10"
                                min="1"
                                max="10000"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            />
                            {displayErrors.guestCount && (
                                <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                    {displayErrors.guestCount}
                                </p>
                            )}
                        </div>

                        <ValidatedInput
                            label="Occasion"
                            type="text"
                            value={eventDetails.occasion}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, occasion: e.target.value });
                                if (errors.occasion) setErrors({ ...errors, occasion: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, occasion: true });
                                if (errors.occasion) setErrors({ ...errors, occasion: undefined });
                            }}
                            placeholder="e.g. company party"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.occasion}
                            helperText="Optional"
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label="Reference"
                            type="text"
                            value={eventDetails.reference}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, reference: e.target.value });
                                if (errors.reference) setErrors({ ...errors, reference: undefined });
                            }}
                            onBlur={() => {
                                setTouched({ ...touched, reference: true as any });
                                if (errors.reference) setErrors({ ...errors, reference: undefined });
                            }}
                            placeholder="e.g. PO-12345"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.reference}
                            helperText="Optional reference or PO number"
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />
                    </div>
                </div>

                {/* Special Requests Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <ClipboardList className="w-4 h-4 text-primary" />
                        Special Requests
                    </h4>
                    <ValidatedTextarea
                        label="Allergies, dietary requirements or other comments"
                        value={eventDetails.specialRequests}
                        onChange={(e) => {
                            setEventDetails({ ...eventDetails, specialRequests: e.target.value });
                            if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
                        }}
                        onBlur={() => {
                            setTouched({ ...touched, specialRequests: true });
                            if (errors.specialRequests) setErrors({ ...errors, specialRequests: undefined });
                        }}
                        placeholder="e.g. 2 people vegetarian, 1 person gluten-free..."
                        rows={4}
                        maxLength={1000}
                        showCharacterCount
                        error={displayErrors.specialRequests}
                        helperText="Optional"
                        className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                    />
                </div>

                {/* Payment Options Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <CreditCard className="w-4 h-4 text-primary" />
                        Payment Options
                    </h4>
                    <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                        Choose your preferred payment method
                    </p>
                    <div className="space-y-3">
                        <label
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${eventDetails.paymentMethod === 'cash_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                            style={{ borderRadius: 'var(--radius)' }}
                        >
                            <NativeRadio
                                name="paymentMethod"
                                checked={eventDetails.paymentMethod === 'cash_card'}
                                onChange={() => setEventDetails({ ...eventDetails, paymentMethod: 'cash_card' })}
                            />
                            <div className="flex-1">
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    EC Card / Card on Site
                                </span>
                            </div>
                        </label>

                        <label
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${eventDetails.paymentMethod === 'on_bill' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                            style={{ borderRadius: 'var(--radius)' }}
                        >
                            <NativeRadio
                                name="paymentMethod"
                                checked={eventDetails.paymentMethod === 'on_bill'}
                                onChange={() => setEventDetails({ ...eventDetails, paymentMethod: 'on_bill' })}
                            />
                            <div className="flex-1">
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    On Invoice
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Billing Address Section - Only show when Invoice is selected */}
                {eventDetails.paymentMethod === 'on_bill' && (
                    <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                        <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                            <Building2 className="w-4 h-4 text-primary" />
                            Billing Address
                        </h4>
                        <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                            Specify where the invoice should be sent
                        </p>
                        <div className="bg-background/50 border border-border rounded-lg p-4 space-y-4" style={{ borderRadius: 'var(--radius)' }}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <NativeCheckbox
                                    checked={eventDetails.useSameAddressForBilling}
                                    onChange={(e) => setEventDetails({ ...eventDetails, useSameAddressForBilling: e.target.checked })}
                                />
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                    Use same address for billing
                                </span>
                            </label>

                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                {eventDetails.useSameAddressForBilling ? (
                                    // Read-only display of main address
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">Street & Nr.</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.street || 'Not provided'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-1 block">PLZ</label>
                                                <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                    {eventDetails.plz || 'Not provided'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                                                <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                    {eventDetails.location || 'Not provided'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Editable billing address fields
                                    <>
                                        <ValidatedInput
                                            label="Billing Street & Nr."
                                            type="text"
                                            value={eventDetails.billingStreet}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingStreet: e.target.value, billingStreetError: undefined });
                                            }}
                                            onBlur={() => {
                                                // Validate billing street on blur if filled
                                                if (eventDetails.billingStreet.trim().length > 0 && eventDetails.billingStreet.trim().length < 5) {
                                                    setEventDetails({ ...eventDetails, billingStreetError: 'Street address must be at least 5 characters' });
                                                }
                                            }}
                                            placeholder="Street and house number"
                                            maxLength={100}
                                            showCharacterCount
                                            helperText="Optional"
                                            error={eventDetails.billingStreetError}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ValidatedInput
                                                label="PLZ"
                                                type="text"
                                                value={eventDetails.billingPlz}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    setEventDetails({ ...eventDetails, billingPlz: value, billingPlzError: undefined });
                                                }}
                                                onBlur={() => {
                                                    // Validate billing PLZ on blur if filled
                                                    if (eventDetails.billingPlz.length > 0 && eventDetails.billingPlz.length < 4) {
                                                        setEventDetails({ ...eventDetails, billingPlzError: 'Postal code must be at least 4 characters' });
                                                    }
                                                }}
                                                placeholder="3000"
                                                maxLength={10}
                                                showCharacterCount
                                                helperText="Optional"
                                                error={eventDetails.billingPlzError}
                                            />

                                            <ValidatedInput
                                                label="Location"
                                                type="text"
                                                value={eventDetails.billingLocation}
                                                onChange={(e) => {
                                                    setEventDetails({ ...eventDetails, billingLocation: e.target.value, billingLocationError: undefined });
                                                }}
                                                onBlur={() => {
                                                    // Validate billing location on blur if filled
                                                    if (eventDetails.billingLocation.trim().length > 0 && eventDetails.billingLocation.trim().length < 2) {
                                                        setEventDetails({ ...eventDetails, billingLocationError: 'Location must be at least 2 characters' });
                                                    }
                                                }}
                                                placeholder="Bern"
                                                maxLength={50}
                                                showCharacterCount
                                                helperText="Optional"
                                                error={eventDetails.billingLocationError}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}