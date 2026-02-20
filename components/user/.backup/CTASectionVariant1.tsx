'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './Button';

export function CTASectionVariant1() {
  return (
    <section id="cta" className="py-[50px] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-primary rounded-3xl p-12 lg:p-16" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="absolute inset-0 opacity-10">
            <div style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} className="absolute inset-0" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                READY TO START?
              </span>
            </div>

            <h2 className="text-primary-foreground mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 'var(--font-weight-semibold)', lineHeight: '1.2' }}>
              Create Your Perfect Menu
              <br />
              In Just Minutes
            </h2>

            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto" style={{ fontSize: 'var(--text-h4)' }}>
              Join hundreds of satisfied clients who trust Olive for their catering needs. Start building your custom menu today – no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="secondary" 
                size="lg" 
                icon={ArrowRight} 
                iconPosition="right"
                to="/wizard"
              >
                Create Menu Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}