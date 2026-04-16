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
  bookingData?: any; // New prop for PDF generation
}

export function ThankYouScreen({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
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

// --- Shared Sub-components for Deduplication ---

interface BrandHeaderProps {
  iconColor?: string;
  bgColor?: string;
}

function BrandHeader({ iconColor = 'var(--primary-foreground)', bgColor = 'var(--primary)' }: BrandHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center justify-center gap-4 mb-6"
    >
      <div className="bg-white p-3 rounded-lg shadow-md">
        <Image
          src="/assets/oliv-logo.png"
          alt="OLIV Logo"
          width={100}
          height={48}
          className="h-12 w-auto object-contain"
          style={{ width: 'auto', height: 'auto' }}
          loading="eager"
        />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: bgColor, boxShadow: bgColor === 'var(--primary)' ? '0 10px 40px rgba(157, 174, 145, 0.3)' : 'none' }}
        >
          <CheckCircle
            className="w-12 h-12"
            style={{ color: iconColor }}
            strokeWidth={2}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ContentSectionProps {
  t: any;
  title: string;
  subtitle: string;
  description: string;
  align?: 'center' | 'left' | 'right';
  color?: string;
  subColor?: string;
}

function ContentSection({ t, title, subtitle, description, align = 'center', color = 'var(--foreground)', subColor = 'var(--primary)' }: ContentSectionProps) {
  return (
    <div className={`text-${align}`}>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4"
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: color,
          fontFamily: 'var(--font-family-heading)'
        }}
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mb-4"
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          color: subColor,
          fontFamily: 'var(--font-family-body)'
        }}
      >
        {subtitle}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6 leading-relaxed"
        style={{
          fontSize: 'var(--text-base)',
          color: color === 'var(--foreground)' ? 'var(--muted-foreground)' : color,
          opacity: color === 'var(--foreground)' ? 1 : 0.8,
          fontFamily: 'var(--font-family-body)'
        }}
      >
        {description}
      </motion.p>
    </div>
  );
}

interface ActionButtonsProps {
  t: any;
  onCreateNew: () => void;
  onGoHome?: () => void;
  onDownloadPdf: () => void;
  isGenerating: boolean;
  hasBookingData: boolean;
  variant?: 'flex' | 'grid';
}

function ActionButtons({ t, onCreateNew, onGoHome, onDownloadPdf, isGenerating, hasBookingData, variant = 'flex' }: ActionButtonsProps) {
  const commonBtnProps = {
    className: "transition-all active:scale-95"
  };

  const buttons = (
    <>
      {onGoHome && (
        <Button
          variant="outline"
          onClick={onGoHome}
          icon={Home}
          iconPosition="left"
          fullWidth={true}
          {...commonBtnProps}
        >
          {t('thankYou.goToHomepage')}
        </Button>
      )}
      <Button
        variant="primary"
        onClick={onCreateNew}
        icon={Plus}
        iconPosition="left"
        fullWidth={true}
        {...commonBtnProps}
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
          fullWidth={true}
          {...commonBtnProps}
        >
          {t('thankYou.downloadPdf')}
        </Button>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="grid grid-cols-1 gap-4 mb-6"
    >
      {buttons}
    </motion.div>
  );
}

interface ContactSectionProps {
  t: any;
  color?: string;
  subColor?: string;
  showQuestions?: boolean;
}

function ContactSection({ t, color = 'var(--foreground)', subColor = 'var(--muted-foreground)', showQuestions = true }: ContactSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      className="pt-6 mt-6"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {showQuestions && (
        <p
          className="mb-3 text-center"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: color,
            fontFamily: 'var(--font-family-body)'
          }}
        >
          {t('thankYou.questions')}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="tel:+41311234567"
          className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
          style={{
            fontSize: 'var(--text-sm)',
            color: subColor,
            fontFamily: 'var(--font-family-body)',
            textDecoration: 'none'
          }}
        >
          <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          +41 31 123 45 67
        </Link>
        <Link
          href="mailto:events@aky-bern.ch"
          className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
          style={{
            fontSize: 'var(--text-sm)',
            color: subColor,
            fontFamily: 'var(--font-family-body)',
            textDecoration: 'none'
          }}
        >
          <Mail className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          events@aky-bern.ch
        </Link>
      </div>
    </motion.div>
  );
}

// Variant: Split Layout (Only remaining variant)
function SplitVariant({ inquiryNumber, onCreateNew, onEditOrder, onGoHome, t, onDownloadPdf, isGenerating, hasBookingData }: any) {
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
          <BrandHeader iconColor="var(--primary)" bgColor="var(--background)" />
          <ContentSection
            t={t}
            align="left"
            color="var(--background)"
            subColor="var(--background)"
            title={t('thankYou.title')}
            subtitle={t('thankYou.subtitle')}
            description={t('thankYou.description')}
          />
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
            {[1, 2, 3].map((step) => {
              const Icon = step === 1 ? Clock : step === 2 ? FileCheck : Utensils;
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + step * 0.1 }}
                  className="p-5 rounded-xl border-2 border-primary border-l-[6px] bg-background hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-primary">
                        {t(`thankYou.step${step}Title`)}
                      </h3>
                      <p className="text-sm opacity-80 text-primary">
                        {t(`thankYou.step${step}Desc`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <ActionButtons
            t={t}
            onCreateNew={onCreateNew}
            onGoHome={onGoHome}
            onDownloadPdf={onDownloadPdf}
            isGenerating={isGenerating}
            hasBookingData={hasBookingData}
          />

          <ContactSection t={t} />
        </div>
      </motion.div>
    </div>
  );
}
