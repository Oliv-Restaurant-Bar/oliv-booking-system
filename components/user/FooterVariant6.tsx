'use client';

import { Facebook, Instagram, Linkedin } from 'lucide-react';

export function FooterVariant6() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-6">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>O</span>
            </div>
            <span className="text-secondary-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-bold)' }}>Oliv</span>
          </div>

          {/* Center: Terms and Privacy Links */}
          <div className="flex gap-6">
            <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors" style={{ fontSize: 'var(--text-base)' }}>
              Terms
            </a>
            <a href="#" className="text-secondary-foreground/70 hover:text-primary transition-colors" style={{ fontSize: 'var(--text-base)' }}>
              Privacy
            </a>
          </div>

          {/* Right: Copyright */}
          <p className="text-secondary-foreground/60" style={{ fontSize: 'var(--text-small)' }}>
            © {new Date().getFullYear()} Oliv Catering. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}