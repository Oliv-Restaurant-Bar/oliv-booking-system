'use client';
import { HeaderVariant6 } from './HeaderVariant6';
import { HeroVariant6 } from './HeroVariant6';
import { HowItWorksVariant6 } from './HowItWorksVariant6';
import { WhyOliveVariant6 } from './WhyOliveVariant6';
import { Gallery } from './Gallery';
import { CTASectionVariant1 } from './CTASectionVariant1';
import { FooterVariant6 } from './FooterVariant6';

export function LandingPageVariant6() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderVariant6 />
      <HeroVariant6 />
      <HowItWorksVariant6 />
      <WhyOliveVariant6 />
      <Gallery />
      <CTASectionVariant1 />
      <FooterVariant6 />
    </div>
  );
}