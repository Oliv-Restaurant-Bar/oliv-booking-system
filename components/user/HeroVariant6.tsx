import { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from './Button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useLandingTranslation, useTranslation } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';

export function HeroVariant6() {
  const t = useLandingTranslation();
  const tOccasion = useTranslation('occasion');
  const tCommon = useTranslations('common');

  return (
    <section id="hero" className="relative min-h-screen lg:max-h-[750px] flex items-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="relative w-full min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] lg:max-h-[750px] overflow-hidden rounded-3xl" style={{ borderRadius: 'var(--radius-card)' }}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1580802841960-bb47baa91eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGNhdGVyaW5nJTIwZm9vZCUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzcwNDY2NjYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Elegant catering food display"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content - Text on Dark Overlay */}
            <div className="space-y-8 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-primary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('hero.welcome')}
                </span>
              </div>

              {/* Main Heading */}
              <h1
                className="text-white leading-tight"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: '1.1'
                }}
              >
                {t('hero.title').split(' ').map((word: string, i: number) => (
                  <span key={i}>
                    {word === 'Unforgettable' || word === 'unvergessliche' ? (
                      <span className="text-primary">{word}</span>
                    ) : (
                      word
                    )}
                    {' '}
                  </span>
                ))}
              </h1>

              {/* Description */}
              <p
                className="text-white/80 leading-relaxed max-w-lg"
                style={{ fontSize: 'var(--text-h4)' }}
              >
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="primary" icon={ArrowRight} iconPosition="right" className="sm:flex-1" to="/wizard">
                  {t('hero.getStarted')}
                </Button>

                <Button
                  variant="outline"
                  to="#how-it-works"
                  className="sm:flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white hover:border-white/20"
                >
                  {t('hero.seeHowItWorks')}
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="text-primary" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {t('hero.stats.events')}
                  </div>
                  <div className="text-white/70" style={{ fontSize: 'var(--text-small)' }}>
                    {t('hero.eventsCatered')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-primary" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {t('hero.stats.menus')}
                  </div>
                  <div className="text-white/70" style={{ fontSize: 'var(--text-small)' }}>
                    {t('hero.menuOptions')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-primary" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {t('hero.stats.rating')}
                  </div>
                  <div className="text-white/70" style={{ fontSize: 'var(--text-small)' }}>
                    {t('hero.clientRating')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Feature Cards Floating */}
            <div className="relative hidden lg:block">
              <div className="space-y-6">
                {/* Weddings Card */}
                <div
                  className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-transform group"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('hero.eventTypes.weddings')}
                      </h3>
                      <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                        {t('hero.guestRange', { min: 150, max: 300 })}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-primary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          {t('hero.premiumPackages')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corporate Events Card - Offset */}
                <div
                  className="bg-primary p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform ml-12 group"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-foreground/30 transition-colors">
                      <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-primary-foreground mb-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('hero.eventTypes.corporate')}
                      </h3>
                      <p className="text-primary-foreground/80 mb-3" style={{ fontSize: 'var(--text-base)' }}>
                        {t('hero.guestRange', { min: 50, max: 200 })}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-foreground/20 rounded-full">
                        <span className="text-primary-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          {t('hero.professionalSolutions')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Celebrations Card */}
                <div
                  className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-transform group"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-secondary/90 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary transition-colors">
                      <svg className="w-8 h-8 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-foreground mb-2" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {t('hero.eventTypes.celebrations')}
                      </h3>
                      <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                        {t('hero.guestRange', { min: 20, max: 100 })}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-full">
                        <span className="text-secondary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          {t('hero.customizableExperiences')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}