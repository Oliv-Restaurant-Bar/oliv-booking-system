'use client';

import { CheckCircle2, ClipboardList, Sparkles, Send, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Button } from './Button';

export function HowItWorksVariant6() {
  const steps = [
    {
      icon: ClipboardList,
      title: 'Event Details',
      description: 'Share your contact details, event date, and number of guests with us.'
    },
    {
      icon: Sparkles,
      title: 'Choose Menu',
      description: 'Select from our curated offerings - from appetizers to desserts.'
    },
    {
      icon: CheckCircle2,
      title: 'Review & Submit',
      description: "We'll contact you to review your request and confirm availability."
    }
  ];

  return (
    <section id="how-it-works" className="py-[50px] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading 
          badge="OUR PROCESS"
          title="How It Works"
          description="Three simple steps to create your perfect catering experience"
          className="mb-12"
        />

        {/* Horizontal Stepper */}
        <div className="relative">
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-border" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full bg-card border-4 border-primary flex items-center justify-center mb-6 relative z-10 shadow-lg hover:scale-105 transition-transform">
                      <Icon className="w-16 h-16 text-primary" />
                    </div>
                    <div className="absolute top-36 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground z-20" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)' }}>
                      {index + 1}
                    </div>
                    <h3 className="text-foreground mb-3 mt-4" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-20 -right-4 w-8 h-8 text-primary z-30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <Button variant="secondary" icon={ArrowRight} iconPosition="right" to="/wizard">
            Create Menu Now
          </Button>
        </div>
      </div>
    </section>
  );
}