'use client';
import { HeaderVariant6 } from './Header';
import { HeroVariant6 } from './Hero';
import { HowItWorksVariant6 } from './HowItWorks';
import { WhyOliveVariant6 } from './WhyOlive';
import { Gallery } from './Gallery';
import { CTASectionVariant1 } from './CTASection';
import { FooterVariant6 } from './Footer';

export function LandingPageVariant6() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderVariant6 />
      <HeroVariant6 />
      <HowItWorksVariant6 />
      {/* <WhyOliveVariant6 />
      <Gallery /> */}
      <CTASectionVariant1 />
      <FooterVariant6 />
    </div>
  );
}