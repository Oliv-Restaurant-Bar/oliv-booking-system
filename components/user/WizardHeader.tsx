'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface WizardHeaderProps {
  onBack?: () => void;
  fullWidth?: boolean;
}

export function WizardHeader({ onBack, fullWidth = false }: WizardHeaderProps) {
  return (
    <header className="bg-white border-b border-[#f3f4f6]">
      <nav className={`w-full px-4 sm:px-6 lg:px-8 ${fullWidth ? '' : 'max-w-7xl mx-auto'}`}>
        <div className="flex items-center justify-between h-16 relative">
          {/* Back Button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[#9ca3af] hover:text-[#2c2f34] transition-colors group z-10 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium">Back</span>
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[#9ca3af] hover:text-[#2c2f34] transition-colors group z-10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[13px] font-medium">Back</span>
            </Link>
          )}

          {/* Logo - Centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link href="/" className="flex items-center pointer-events-auto">
              <Image
                src="/assets/oliv-logo.png"
                alt="Olive Restaurant & Bar"
                width={120}
                height={48}
                priority
                className="h-12 w-auto"
                style={{ width: 'auto', height: 'auto' }}
                loading="eager"
              />
            </Link>
          </div>

          {/* Spacer/Right alignment element if needed */}
          <div className="w-10"></div>
        </div>
      </nav>
    </header>
  );
}