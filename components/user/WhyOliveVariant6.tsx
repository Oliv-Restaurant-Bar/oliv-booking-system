'use client';

import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { SectionHeading } from './SectionHeading';
import { Button } from './Button';
import { useLandingTranslation } from '@/lib/i18n/client';

export function WhyOliveVariant6() {
  const t = useLandingTranslation();

  const features = [
    {
      title: t('whyOlive.cuisine.title'),
      description: t('whyOlive.cuisine.description'),
      image: 'https://images.unsplash.com/photo-1757358957218-67e771ec07bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwY3Vpc2luZSUyMGZvb2R8ZW58MXx8fHwxNzcwNDkwNjUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Fine dining cuisine'
    },
    {
      title: t('whyOlive.ambience.title'),
      description: t('whyOlive.ambience.description'),
      image: 'https://images.unsplash.com/photo-1761499101631-92cde2434bc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZXZlbnQlMjB2ZW51ZSUyMGludGVyaW9yfGVufDF8fHx8MTc3MDQxODUzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Elegant event venue'
    },
    {
      title: t('whyOlive.care.title'),
      description: t('whyOlive.care.description'),
      image: 'https://images.unsplash.com/photo-1769812343266-323d6b508f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRlcmluZyUyMHNlcnZpY2UlMjBob3NwaXRhbGl0eXxlbnwxfHx8fDE3NzA0OTA2NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Catering service hospitality'
    }
  ];

  return (
    <section id="why-olive" className="py-[50px] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge={t('whyOlive.title')}
          title={t('whyOlive.subtitle')}
          description={t('whyOlive.description')}
        />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl h-[400px] md:h-[500px]"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              {/* Background Image - NO OVERLAY */}
              <ImageWithFallback
                src={feature.image}
                alt={feature.alt}
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Glass Effect Content at Bottom */}
              <div className="absolute bottom-4 left-4 right-4 p-5 backdrop-blur-md bg-white/10 border-t border-white/20 rounded-lg" style={{ borderRadius: 'var(--radius-card)' }}>
                <h3 
                  className="text-white mb-2"
                  style={{ 
                    fontSize: 'var(--text-h3)', 
                    fontWeight: 'var(--font-weight-semibold)' 
                  }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="text-white/95"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="secondary" icon={ArrowRight} iconPosition="right" to="/wizard">
            {t('howItWorks.createMenu')}
          </Button>
        </div>
      </div>
    </section>
  );
}