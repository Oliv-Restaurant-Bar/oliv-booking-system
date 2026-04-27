'use client';

import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLandingTranslation } from '@/lib/i18n/client';
import Image from 'next/image';

export function FooterVariant6() {
  const t = useLandingTranslation();
  return (
    <footer className="bg-secondary text-secondary-foreground py-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center">
              <Image
                src="/assets/oliv-clear-bg.png"
                alt="Oliv Catering"
                width={120}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </a>
          </div>

          {/* Right: Copyright */}
          <p className="text-secondary-foreground/60" style={{ fontSize: 'var(--text-small)' }}>
            © {new Date().getFullYear()} Oliv Catering. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}