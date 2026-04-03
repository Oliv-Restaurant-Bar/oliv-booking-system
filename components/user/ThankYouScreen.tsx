'use client';

import { useEffect } from 'react';
import { Home, Plus, Phone, Mail, Edit2, CheckCircle, Clock, FileCheck, Utensils, Download, Loader2 } from 'lucide-react';
import { Button } from './Button';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useWizardTranslation } from '@/lib/i18n/client';
import { generateCustomerOfferPdf } from '@/lib/utils/pdf-generator';
import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface ThankYouScreenProps {
  inquiryNumber: string;
  onCreateNew: () => void;
  onEditOrder: () => void;
  onGoHome?: () => void;
  variant?: 'centered' | 'split' | 'minimal';
  bookingData?: any; // New prop for PDF generation
}

export function ThankYouScreen({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  variant = 'centered',
  bookingData
}: ThankYouScreenProps) {
  const t = useWizardTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!bookingData) {
      toast.error('Booking data not available for PDF generation');
      return;
    }

    setIsGenerating(true);
    try {
      const doc = await generateCustomerOfferPdf(bookingData);
      const filename = `Booking_${bookingData.customerName.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from two points
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#9DAE91', '#262D39', '#FFFFFF', '#FFD700']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#9DAE91', '#262D39', '#FFFFFF', '#FFD700']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'centered') {
    return <CenteredVariant
      inquiryNumber={inquiryNumber}
      onCreateNew={onCreateNew}
      onEditOrder={onEditOrder}
      onGoHome={onGoHome}
      t={t}
      onDownloadPdf={handleDownloadPdf}
      isGenerating={isGenerating}
      hasBookingData={!!bookingData}
    />;
  }

  if (variant === 'split') {
    return <SplitVariant
      inquiryNumber={inquiryNumber}
      onCreateNew={onCreateNew}
      onEditOrder={onEditOrder}
      onGoHome={onGoHome}
      t={t}
      onDownloadPdf={handleDownloadPdf}
      isGenerating={isGenerating}
      hasBookingData={!!bookingData}
    />;
  }

  return <MinimalVariant
    inquiryNumber={inquiryNumber}
    onCreateNew={onCreateNew}
    onEditOrder={onEditOrder}
    onGoHome={onGoHome}
    t={t}
    onDownloadPdf={handleDownloadPdf}
    isGenerating={isGenerating}
    hasBookingData={!!bookingData}
  />;
}

// Variant 1: Centered Card (Original)
function CenteredVariant({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  t,
  onDownloadPdf,
  isGenerating,
  hasBookingData
}: Omit<ThankYouScreenProps, 'variant'> & { t: any; onDownloadPdf: () => void; isGenerating: boolean; hasBookingData: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl rounded-2xl p-12 text-center"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Logo and Success Icon in one line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          {/* Logo */}
          <div className="bg-white p-3 rounded-lg shadow-md">
            <Image
              src="/assets/oliv-logo.png"
              alt="OLIV Logo"
              width={100}
              height={48}
              className="h-12 w-auto object-contain"
              style={{ width: 'auto', height: '3rem' }}
            />
          </div>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <CheckCircle
                className="w-12 h-12"
                style={{ color: 'var(--primary-foreground)' }}
                strokeWidth={2}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4"
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family-heading)'
          }}
        >
          {t('thankYou.title')}
        </motion.h1>

        {/* Congratulations Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-4"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-family-body)'
          }}
        >
          {t('thankYou.subtitle')}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-3"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-body)',
            lineHeight: '1.6'
          }}
        >
          {t('thankYou.description')}
        </motion.p>

        {/* Inquiry Number removed per user request */}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
        >
          {onGoHome && (
            <Button
              variant="outline"
              to="/"
              icon={Home}
              iconPosition="left"
              fullWidth
            >
              {t('thankYou.goToHomepage')}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onCreateNew}
            icon={Plus}
            iconPosition="left"
          >
            {t('thankYou.createNewRequest')}
          </Button>
          {hasBookingData && (
            <Button
              variant="outline"
              onClick={onDownloadPdf}
              icon={Download}
              iconPosition="left"
              isLoading={isGenerating}
              disabled={isGenerating}
            >
              {t('thankYou.downloadPdf')}
            </Button>
          )}
        </motion.div>

        <div className="h-4" />

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-6"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p
            className="mb-3"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family-body)'
            }}
          >
            Contact
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="tel:+41311234567"
              className="inline-flex items-center gap-2 transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-family-body)',
                textDecoration: 'none'
              }}
            >
              <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              +41 31 123 45 67
            </Link>
            <Link
              href="mailto:events@aky-bern.ch"
              className="inline-flex items-center gap-2 transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-family-body)',
                textDecoration: 'none'
              }}
            >
              <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              events@aky-bern.ch
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Variant 2: Split Layout
function SplitVariant({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  t,
  onDownloadPdf,
  isGenerating,
  hasBookingData
}: Omit<ThankYouScreenProps, 'variant'> & { t: any; onDownloadPdf: () => void; isGenerating: boolean; hasBookingData: boolean }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Side - Success Message */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <div className="max-w-md text-center lg:text-left">
          {/* Logo and Success Icon in one line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center lg:justify-start gap-4 mb-6"
          >
            {/* Logo */}
            <div className="bg-white p-3 rounded-lg shadow-md">
              <Image
                src="/assets/oliv-logo.png"
                alt="OLIV Logo"
                width={100}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <CheckCircle
                  className="w-12 h-12"
                  style={{ color: 'var(--primary)' }}
                  strokeWidth={2}
                />
              </div>
            </motion.div>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--background)' }}>
            {t('thankYou.title')}
          </h1>
          <p className="text-xl mb-6 opacity-90" style={{ color: 'var(--background)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('thankYou.subtitle')}
          </p>
          <p className="text-lg mb-8 opacity-80 leading-relaxed" style={{ color: 'var(--background)' }}>
            {t('thankYou.description')}
          </p>

          {/* Inquiry Number removed per user request */}
        </div>
      </motion.div>

      {/* Right Side - Actions & Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8 lg:p-12"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--primary)' }}>
            {t('thankYou.whatsNext')}
          </h2>

          <div className="space-y-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
              style={{
                backgroundColor: 'var(--background)',
                border: '2px solid var(--primary)',
                borderLeftWidth: '6px'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Clock className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step1Title')}
                  </h3>
                  <p className="text-sm opacity-80" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step1Desc')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
              style={{
                backgroundColor: 'var(--background)',
                border: '2px solid var(--primary)',
                borderLeftWidth: '6px'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <FileCheck className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step2Title')}
                  </h3>
                  <p className="text-sm opacity-80" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step2Desc')}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="p-5 rounded-xl relative overflow-hidden group hover:shadow-md transition-all"
              style={{
                backgroundColor: 'var(--background)',
                border: '2px solid var(--primary)',
                borderLeftWidth: '6px'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Utensils className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step3Title')}
                  </h3>
                  <p className="text-sm opacity-80" style={{ color: 'var(--primary)' }}>
                    {t('thankYou.step3Desc')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <Button
              variant="primary"
              onClick={onCreateNew}
              icon={Plus}
              iconPosition="left"
              fullWidth
            >
              {t('thankYou.createNewRequest')}
            </Button>
            {onGoHome && (
              <Button
                variant="outline"
                to="/"
                icon={Home}
                iconPosition="left"
                fullWidth
              >
                {t('thankYou.goToHomepage')}
              </Button>
            )}
            {hasBookingData && (
              <Button
                variant="primary"
                onClick={onDownloadPdf}
                icon={Download}
                iconPosition="left"
                fullWidth
                isLoading={isGenerating}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
              >
                {t('thankYou.downloadPdf')}
              </Button>
            )}
          </div>


          {/* Contact Section */}
          <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p
              className="mb-3 text-center"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-body)'
              }}
            >
              {t('thankYou.questions')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="tel:+41311234567"
                className="inline-flex items-center gap-2 transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family-body)',
                  textDecoration: 'none'
                }}
              >
                <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                +41 31 123 45 67
              </Link>
              <Link
                href="mailto:events@aky-bern.ch"
                className="inline-flex items-center gap-2 transition-colors"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-family-body)',
                  textDecoration: 'none'
                }}
              >
                <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                events@aky-bern.ch
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Variant 3: Minimal Clean Layout
function MinimalVariant({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  t,
  onDownloadPdf,
  isGenerating,
  hasBookingData
}: Omit<ThankYouScreenProps, 'variant'> & { t: any; onDownloadPdf: () => void; isGenerating: boolean; hasBookingData: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Logo and Success Icon in one line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {/* Logo */}
          <div className="bg-white p-3 rounded-lg shadow-md">
            <Image
              src="/assets/oliv-logo.png"
              alt="OLIV Logo"
              width={100}
              height={48}
              className="h-12 w-auto object-contain"
              style={{ width: 'auto', height: '3rem' }}
            />
          </div>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--primary)',
                boxShadow: '0 10px 40px rgba(157, 174, 145, 0.3)'
              }}
            >
              <CheckCircle
                className="w-12 h-12"
                style={{ color: 'var(--primary-foreground)' }}
                strokeWidth={2.5}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-3"
          style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-family-heading)'
          }}
        >
          Your inquiry has been submitted!
        </motion.h1>

        {/* Congratulations Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center mb-6"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-family-body)'
          }}
        >
          Congratulations on taking the first step!
        </motion.p>

        {/* Inquiry Number removed per user request */}

        {hasBookingData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex justify-center mb-8"
          >
            <Button
              variant="outline"
              onClick={onDownloadPdf}
              icon={Download}
              iconPosition="left"
              isLoading={isGenerating}
              disabled={isGenerating}
              className="border-primary text-primary hover:bg-primary/5"
            >
              Download PDF Summary
            </Button>
          </motion.div>
        )}

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-10 max-w-lg mx-auto"
          style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-body)',
            lineHeight: '1.7'
          }}
        >
          Thank you for choosing our catering service! We've received your custom menu request and will reach out within 24 hours to finalize the details.
        </motion.p>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid sm:grid-cols-2 gap-4 mb-6"
        >
          <button
            onClick={onCreateNew}
            className="p-6 rounded-xl text-left transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            <Plus
              className="w-8 h-8 mb-3"
              style={{ color: 'var(--primary)' }}
            />
            <h3
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-body)',
                marginBottom: '0.5rem'
              }}
            >
              New Request
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-family-body)'
            }}>
              Create another custom menu inquiry
            </p>
          </button>

        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)'
          }}
        >
          <p
            className="mb-4"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family-body)'
            }}
          >
            Need immediate assistance?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+41311234567"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-body)',
                backgroundColor: 'var(--background)',
                textDecoration: 'none'
              }}
            >
              <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              +41 31 123 45 67
            </a>
            <a
              href="mailto:events@aky-bern.ch"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-family-body)',
                backgroundColor: 'var(--background)',
                textDecoration: 'none'
              }}
            >
              <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              events@aky-bern.ch
            </a>
          </div>
        </motion.div>

        {/* Optional Homepage Link */}
        {onGoHome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6"
          >
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--primary)',
                fontFamily: 'var(--font-family-body)',
                fontWeight: 'var(--font-weight-medium)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <Home className="w-4 h-4" />
              Return to homepage
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}