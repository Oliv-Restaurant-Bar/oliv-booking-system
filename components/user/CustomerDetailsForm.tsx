import { User, ClipboardList, MapPin, Calendar, CreditCard, Building2, Info } from 'lucide-react';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedTextarea } from '@/components/ui/validated-textarea';
import { Input } from '@/components/ui/input';
import { NativeRadio } from '@/components/ui/NativeRadio';
import { NativeCheckbox } from '@/components/ui/NativeCheckbox';
import { EventDetails } from '@/lib/types';
import { useWizardTranslation } from '@/lib/i18n/client';
import { useLocale } from 'next-intl';
import { useWizardStore } from '@/lib/store/useWizardStore';


interface CustomerDetailsFormProps {
    // No props needed as we use the store
}


export function CustomerDetailsForm({ }: CustomerDetailsFormProps) {
    const t = useWizardTranslation();
    const locale = useLocale();
    const {
        eventDetails, setEventDetails,
        validationErrors, setValidationErrors,
        touchedFields, setTouchedFields,
        setIsDateTimePickerOpen,
        getRealtimeErrors
    } = useWizardStore();

    const displayErrors = { ...getRealtimeErrors(), ...validationErrors };


    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 'var(--radius)' }}>
                        <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('sections.tellUsAboutEvent')}
                    </h3>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    {t('sections.fillRequiredInfo')}
                </p>
            </div>

            {/* Grouped Sections with Background */}
            <div className="space-y-4">
                {/* Contact Information Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <User className="w-4 h-4 text-primary" />
                        {t('sections.contactInformation')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ValidatedInput
                            label={t('labels.name')}
                            type="text"
                            value={eventDetails.name}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, name: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, name: true });
                            }}
                            placeholder={t('placeholders.name')}
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.name}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.business')}
                            type="text"
                            value={eventDetails.business}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, business: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, business: true });
                            }}
                            placeholder="Musterfirma AG"
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.business}
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.email')}
                            type="email"
                            value={eventDetails.email}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, email: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, email: true });
                            }}
                            placeholder="max@firma.ch"
                            maxLength={255}
                            showCharacterCount
                            error={displayErrors.email}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.telephone')}
                            type="tel"
                            value={eventDetails.telephone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9+\s]/g, '');
                                setEventDetails({ ...eventDetails, telephone: value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, telephone: true });
                            }}
                            placeholder="07XXXXXXXX"
                            maxLength={20}
                            showCharacterCount
                            error={displayErrors.telephone}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />
                    </div>
                </div>

                {/* Address Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <MapPin className="w-4 h-4 text-primary" />
                        {t('sections.address')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ValidatedInput
                            label={t('labels.street')}
                            type="text"
                            value={eventDetails.street}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, street: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, street: true });
                            }}
                            placeholder={t('placeholders.street')}
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.street}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.plz')}
                            type="text"
                            value={eventDetails.plz}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setEventDetails({ ...eventDetails, plz: value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, plz: true });
                            }}
                            placeholder={t('placeholders.plz')}
                            maxLength={10}
                            showCharacterCount
                            error={displayErrors.plz}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.location')}
                            type="text"
                            value={eventDetails.location}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, location: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, location: true });
                            }}
                            placeholder={t('placeholders.location')}
                            maxLength={50}
                            showCharacterCount
                            error={displayErrors.location}
                            required
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                        <ValidatedInput
                            label={t('labels.reference')}
                            type="text"
                            value={eventDetails.reference}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, reference: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, reference: true as any });
                            }}
                            placeholder={t('placeholders.occasion')}
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.reference}
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />
                    </div>
                </div>

                {/* Event Details Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <Calendar className="w-4 h-4 text-primary" />
                        {t('sections.event')}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Date & Time Picker */}
                        <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                                {t('labels.eventDate')}
                                <span className="text-destructive ml-1">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsDateTimePickerOpen(true)}
                                className={`
                                        w-full px-4 py-3 bg-background border rounded-lg transition-colors text-left
                                        flex items-center justify-between group
                                        ${(validationErrors.eventDate || validationErrors.eventTime) ? 'border-destructive' : 'border-border hover:border-primary hover:shadow-sm'}
                                      `}
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                            >
                                <span className={(eventDetails.eventDate || eventDetails.eventTime) ? 'text-foreground' : 'text-muted-foreground'}>
                                    {(() => {
                                        if (!eventDetails.eventDate && !eventDetails.eventTime) return t('labels.eventDate');

                                        let dateStr = '';
                                        if (eventDetails.eventDate) {
                                            const [y, m, d] = eventDetails.eventDate.split('-').map(Number);
                                            const dObj = new Date(y, m - 1, d);
                                            dateStr = dObj.toLocaleDateString(locale === 'de' ? 'de-CH' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                        }

                                        if (eventDetails.eventDate && eventDetails.eventTime) {
                                            return `${dateStr} ${locale === 'de' ? 'um' : 'at'} ${eventDetails.eventTime}`;
                                        }
                                        return dateStr || eventDetails.eventTime || t('labels.eventDate');
                                    })()}
                                </span>
                                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </button>
                            {(validationErrors.eventDate || validationErrors.eventTime) && (
                                <p className="text-destructive mt-1" style={{ fontSize: 'var(--text-small)' }}>
                                    {validationErrors.eventDate || validationErrors.eventTime}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                                {t('labels.guestCount')}
                                <span className="text-destructive ml-1">*</span>
                            </label>
                            <Input
                                type="number"
                                value={eventDetails.guestCount}
                                onChange={(e) => {
                                    setEventDetails({
                                        ...eventDetails,
                                        guestCount: e.target.value
                                    });
                                }}
                                onBlur={() => {
                                    setTouchedFields({ ...touchedFields, guestCount: true });
                                }}
                                className={`w-full px-4 py-2.5 bg-background border rounded-lg transition-colors ${displayErrors.guestCount ? 'border-destructive' : 'border-border focus:border-primary'
                                    }`}
                                placeholder="Anzahl der Gäste"
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
                            label={t('labels.occasion')}
                            type="text"
                            value={eventDetails.occasion}
                            onChange={(e) => {
                                setEventDetails({ ...eventDetails, occasion: e.target.value });
                            }}
                            onBlur={() => {
                                setTouchedFields({ ...touchedFields, occasion: true });
                            }}
                            placeholder={t('placeholders.occasion')}
                            maxLength={100}
                            showCharacterCount
                            error={displayErrors.occasion}
                            className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                        />

                    </div>
                </div>

                {/* Special Requests Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <ClipboardList className="w-4 h-4 text-primary" />
                        {t('sections.specialRequests')}
                    </h4>
                    <ValidatedTextarea
                        label={t('labels.specialRequests')}
                        value={eventDetails.specialRequests}
                        onChange={(e) => {
                            setEventDetails({ ...eventDetails, specialRequests: e.target.value });
                        }}
                        onBlur={() => {
                            setTouchedFields({ ...touchedFields, specialRequests: true });
                        }}
                        placeholder={t('placeholders.specialRequests')}
                        rows={4}
                        maxLength={1000}
                        showCharacterCount
                        error={displayErrors.specialRequests}
                        className='w-full px-4 py-2.5 bg-background border rounded-lg transition-colors border-border focus:border-primary'
                    />
                </div>

                {/* Payment Options Section */}
                <div className="bg-muted/30 rounded-lg p-5 border border-border" style={{ borderRadius: 'var(--radius-card)' }}>
                    <h4 className="text-foreground mb-4 flex items-center gap-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        <CreditCard className="w-4 h-4 text-primary" />
                        {t('sections.paymentOptions')}
                    </h4>
                    <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                        {t('labels.choosePayment')}
                    </p>
                    <div className="space-y-3">
                        <label
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${eventDetails.paymentMethod === 'ec_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                            style={{ borderRadius: 'var(--radius)' }}
                        >
                            <NativeRadio
                                name="paymentMethod"
                                checked={eventDetails.paymentMethod === 'ec_card'}
                                onChange={() => {
                                    setEventDetails({ ...eventDetails, paymentMethod: 'ec_card' });
                                    setTimeout(() => {
                                        window.scrollTo({
                                            top: document.documentElement.scrollHeight,
                                            behavior: 'smooth'
                                        });
                                    }, 100);
                                }}
                            />
                            <div className="flex-1">
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {t('labels.ecCard')}
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
                                onChange={() => {
                                    setEventDetails({ ...eventDetails, paymentMethod: 'on_bill' });
                                    setTimeout(() => {
                                        window.scrollTo({
                                            top: document.documentElement.scrollHeight,
                                            behavior: 'smooth'
                                        });
                                    }, 100);
                                }}
                            />
                            <div className="flex-1">
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {t('labels.onInvoice')}
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
                            {t('sections.billingAddress')}
                        </h4>
                        <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
                            {t('labels.invoiceTarget')}
                        </p>
                        <div className="bg-background/50 border border-border rounded-lg p-4 space-y-4" style={{ borderRadius: 'var(--radius)' }}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <NativeCheckbox
                                    checked={eventDetails.useSameAddressForBilling}
                                    onChange={(e) => setEventDetails({ ...eventDetails, useSameAddressForBilling: e.target.checked })}
                                />
                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                    {t('labels.sameAddress')}
                                </span>
                            </label>

                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                {eventDetails.useSameAddressForBilling ? (
                                    // Read-only display of main address
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.street')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.street || t('status.editMode')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.plz')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.plz || t('status.editMode')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.location')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.location || t('status.editMode')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.business')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.business || t('status.editMode')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.email')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.email || t('status.editMode')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-muted-foreground mb-1 block">{t('labels.reference')}</label>
                                            <div className="px-3 py-2 bg-muted/50 rounded-md text-foreground border border-border">
                                                {eventDetails.reference || t('status.editMode')}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ValidatedInput
                                            label={t('labels.billingStreet')}
                                            type="text"
                                            value={eventDetails.billingStreet}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingStreet: e.target.value });
                                                if (validationErrors.billingStreet) setValidationErrors({ ...validationErrors, billingStreet: undefined });
                                            }}
                                            onBlur={() => {
                                                // Validate billing street on blur if filled
                                                if (eventDetails.billingStreet.trim().length > 0 && eventDetails.billingStreet.trim().length < 5) {
                                                    setValidationErrors({ ...validationErrors, billingStreet: 'Street address must be at least 5 characters' });
                                                }
                                            }}
                                            placeholder={t('placeholders.street')}
                                            maxLength={100}
                                            showCharacterCount
                                            error={displayErrors.billingStreet}
                                            required
                                        />

                                        <ValidatedInput
                                            label={t('labels.billingPlz')}
                                            type="text"
                                            value={eventDetails.billingPlz}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                setEventDetails({ ...eventDetails, billingPlz: value });
                                                if (validationErrors.billingPlz) setValidationErrors({ ...validationErrors, billingPlz: undefined });
                                            }}
                                            onBlur={() => {
                                                // Validate billing PLZ on blur if filled
                                                if (eventDetails.billingPlz.length > 0 && eventDetails.billingPlz.length < 4) {
                                                    setValidationErrors({ ...validationErrors, billingPlz: 'Postal code must be at least 4 characters' });
                                                }
                                            }}
                                            placeholder={t('placeholders.plz')}
                                            maxLength={10}
                                            showCharacterCount
                                            error={displayErrors.billingPlz}
                                            required
                                        />

                                        <ValidatedInput
                                            label={t('labels.billingLocation')}
                                            type="text"
                                            value={eventDetails.billingLocation}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingLocation: e.target.value });
                                                if (validationErrors.billingLocation) setValidationErrors({ ...validationErrors, billingLocation: undefined });
                                            }}
                                            onBlur={() => {
                                                // Validate billing location on blur if filled
                                                if (eventDetails.billingLocation.trim().length > 0 && eventDetails.billingLocation.trim().length < 2) {
                                                    setValidationErrors({ ...validationErrors, billingLocation: 'Location must be at least 2 characters' });
                                                }
                                            }}
                                            placeholder={t('placeholders.location')}
                                            maxLength={50}
                                            showCharacterCount
                                            error={displayErrors.billingLocation}
                                            required
                                        />



                                        <ValidatedInput
                                            label={t('labels.billingBusiness')}
                                            type="text"
                                            value={eventDetails.billingBusiness}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingBusiness: e.target.value });
                                                if (validationErrors.billingBusiness) setValidationErrors({ ...validationErrors, billingBusiness: undefined });
                                            }}
                                            placeholder={t('placeholders.billingBusiness')}
                                            maxLength={100}
                                            showCharacterCount
                                            error={displayErrors.billingBusiness}
                                        />

                                        <ValidatedInput
                                            label={t('labels.billingEmail')}
                                            type="email"
                                            value={eventDetails.billingEmail}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingEmail: e.target.value });
                                                if (validationErrors.billingEmail) setValidationErrors({ ...validationErrors, billingEmail: undefined });
                                            }}
                                            onBlur={() => {
                                                if (eventDetails.billingEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventDetails.billingEmail)) {
                                                    setValidationErrors({ ...validationErrors, billingEmail: 'Please enter a valid email address' });
                                                }
                                            }}
                                            placeholder={t('placeholders.billingEmail')}
                                            maxLength={255}
                                            showCharacterCount
                                            error={displayErrors.billingEmail}
                                        />

                                        <ValidatedInput
                                            label={t('labels.reference')}
                                            type="text"
                                            value={eventDetails.billingReference || ''}
                                            onChange={(e) => {
                                                setEventDetails({ ...eventDetails, billingReference: e.target.value });
                                                if (validationErrors.billingReference) setValidationErrors({ ...validationErrors, billingReference: undefined });
                                            }}
                                            onBlur={() => {
                                                if (eventDetails.billingReference && eventDetails.billingReference.trim().length > 100) {
                                                    setValidationErrors({ ...validationErrors, billingReference: 'Billing reference must not exceed 100 characters' });
                                                }
                                            }}
                                            placeholder="e.g. INV-98765"
                                            maxLength={100}
                                            showCharacterCount
                                            error={displayErrors.billingReference}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
