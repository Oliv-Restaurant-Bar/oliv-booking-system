'use client';

import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { useLandingTranslation } from '@/lib/i18n/client';

export function HeaderVariant6() {
  const t = useLandingTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('header.home'), href: '#hero' },
    { name: t('header.howItWorks'), href: '#how-it-works' },
    { name: t('header.gallery'), href: 'https://images.romystreit.com/raumforum-oliv-24/snrf6ty9je' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if it's an internal anchor link (starts with #)
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    } else {
      // For external URLs, let them navigate normally (or open in new tab)
      // Close mobile menu if open
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with Badge */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center">
              <Image
                src="/assets/oliv-logo.png"
                alt="Olive Restaurant & Bar"
                width={120}
                height={48}
                className="h-12 w-auto"
                style={{ mixBlendMode: 'multiply' }}
              />
            </a>
          </div>

          {/* Desktop Navigation - Minimal Underline */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => {
              const isExternal = item.href.startsWith('http');
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="inline-block text-muted-foreground hover:text-foreground transition-colors relative group pb-1 first-letter:uppercase"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                </a>
              );
            })}
          </div>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="primary" to="/wizard">
              {t('header.createMenu')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const isExternal = item.href.startsWith('http');
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="block text-muted-foreground hover:text-foreground hover:bg-muted transition-colors px-4 py-3 rounded-lg first-letter:uppercase"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.name}
                  </a>
                );
              })}
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Button variant="primary" fullWidth to="/wizard">
                  {t('header.createMenu')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
