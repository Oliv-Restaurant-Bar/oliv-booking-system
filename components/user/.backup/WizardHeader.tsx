'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function WizardHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Back
            </span>
          </Link>

          {/* Logo - Centered */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/59e4409f00962b160c922c848df8eb1ebce3a245.png"
                alt="Olive Restaurant & Bar"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Spacer for alignment */}
          <div className="w-20"></div>
        </div>
      </nav>
    </header>
  );
}