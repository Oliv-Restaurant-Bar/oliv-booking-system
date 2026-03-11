'use client';

import { useEffect } from 'react';
import { Home, Plus, Phone, Mail, Edit2, CheckCircle, Clock, FileCheck, Utensils } from 'lucide-react';
import { Button } from './Button';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { useWizardTranslation } from '@/lib/i18n/client';

interface ThankYouScreenProps {
  inquiryNumber: string;
  onCreateNew: () => void;
  onEditOrder: () => void;
  onGoHome?: () => void;
  variant?: 'centered' | 'split' | 'minimal';
}

export function ThankYouScreen({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  variant = 'centered'
}: ThankYouScreenProps) {
  const t = useWizardTranslation();

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
    />;
  }

  if (variant === 'split') {
    return <SplitVariant
      inquiryNumber={inquiryNumber}
      onCreateNew={onCreateNew}
      onEditOrder={onEditOrder}
      onGoHome={onGoHome}
      t={t}
    />;
  }

  return <MinimalVariant
    inquiryNumber={inquiryNumber}
    onCreateNew={onCreateNew}
    onEditOrder={onEditOrder}
    onGoHome={onGoHome}
    t={t}
  />;
}

// Variant 1: Centered Card (Original)
function CenteredVariant({
  inquiryNumber,
  onCreateNew,
  onEditOrder,
  onGoHome,
  t
}: Omit<ThankYouScreenProps, 'variant'> & { t: any }) {
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
            <img
              src="/assets/oliv-logo.png"
              alt="OLIV Logo"
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

        {/* Inquiry Number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-body)'
          }}
        >
          {t('thankYou.inquiryNumber')} <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--foreground)' }}>{inquiryNumber}</span>
        </motion.p>

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
        </motion.div>

        {/* Edit Order Link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onEditOrder}
          className="inline-flex items-center gap-2 mb-8 transition-colors"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-family-body)',
            fontWeight: 'var(--font-weight-medium)',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <Edit2 className="w-4 h-4" />
          {t('thankYou.editOrder')}
        </motion.button>

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
            <a
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
            </a>
            <a
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
            </a>
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
  t
}: Omit<ThankYouScreenProps, 'variant'> & { t: any }) {
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
              <img
                src="/assets/oliv-logo.png"
                alt="OLIV Logo"
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

          <h1
            className="mb-4"
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-family-heading)'
            }}
          >
            Request Submitted Successfully!
          </h1>

          {/* Congratulations Subheading */}
          <p
            className="mb-6"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-family-body)',
              opacity: 0.95
            }}
          >
            Congratulations on taking the first step!
          </p>

          <p
            className="mb-6"
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--primary-foreground)',
              opacity: 0.85,
              fontFamily: 'var(--font-family-body)',
              lineHeight: '1.6'
            }}
          >
            Your custom menu inquiry has been received. Our team will review your request and get back to you shortly.
          </p>

          <div
            className="inline-block px-4 py-2 rounded-lg mb-6"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--primary)'
            }}
          >
            <p style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-body)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              Inquiry #{inquiryNumber}
            </p>
          </div>
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
          <h2
            className="mb-6"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-family-heading)'
            }}
          >
            What's next?
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
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family-body)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    1. Confirmation Call
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-family-body)',
                    lineHeight: '1.5'
                  }}>
                    We'll contact you within 24 hours to confirm details
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
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family-body)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    2. Menu Finalization
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-family-body)',
                    lineHeight: '1.5'
                  }}>
                    Together we'll perfect your custom menu selections
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
                  <h3
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-family-body)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    3. Event Preparation
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-family-body)',
                    lineHeight: '1.5'
                  }}>
                    We'll prepare everything for your special event
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
              Create new request
            </Button>
            {onGoHome && (
              <Button
                variant="outline"
                to="/"
                icon={Home}
                iconPosition="left"
                fullWidth
              >
                Go to homepage
              </Button>
            )}
          </div>

          <button
            onClick={onEditOrder}
            className="w-full flex items-center justify-center gap-2 py-3 transition-colors"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--primary)',
              fontFamily: 'var(--font-family-body)',
              fontWeight: 'var(--font-weight-medium)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Edit2 className="w-4 h-4" />
            Edit your order
          </button>

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
              Questions? Contact us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
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
              </a>
              <a
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
              </a>
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
  t
}: Omit<ThankYouScreenProps, 'variant'> & { t: any }) {
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
            <img
              src="/assets/oliv-logo.png"
              alt="OLIV Logo"
              className="h-12 w-auto object-contain"
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

        {/* Inquiry Number Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--primary)'
            }}
          >
            <p style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-body)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--primary)'
            }}>
              Reference: {inquiryNumber}
            </p>
          </div>
        </motion.div>

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

          <button
            onClick={onEditOrder}
            className="p-6 rounded-xl text-left transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            <Edit2
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
              Edit Order
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-family-body)'
            }}>
              Make changes to your submitted request
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