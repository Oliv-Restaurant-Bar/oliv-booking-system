'use client';

import { useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { SectionHeading } from './SectionHeading';
import { Button } from './Button';

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const sliderRef = useRef<Slider>(null);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1758648207365-df458d3e83f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGludGVyaW9yJTIwZGluaW5nfGVufDF8fHx8MTc3MDQ2Mzk4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Elegant restaurant interior'
    },
    {
      url: 'https://images.unsplash.com/photo-1755811248279-1ab13b7d4384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwZm9vZCUyMHBsYXRpbmclMjBmaW5lJTIwZGluaW5nfGVufDF8fHx8MTc3MDQ4MzQ0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Gourmet food plating'
    },
    {
      url: 'https://images.unsplash.com/photo-1758977404304-30ff5f68753c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdGFibGUlMjBzZXR0aW5nJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzA0ODM0NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Elegant table setting'
    },
    {
      url: 'https://images.unsplash.com/photo-1671713682290-3289d0291790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwYmFyJTIwZHJpbmtzJTIwY29ja3RhaWxzfGVufDF8fHx8MTc3MDM3NTcxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Bar and cocktails'
    },
    {
      url: 'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMGtpdGNoZW4lMjByZXN0YXVyYW50fGVufDF8fHx8MTc3MDQ4MzQ0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Chef cooking in kitchen'
    },
    {
      url: 'https://images.unsplash.com/photo-1769184617504-be7e08f3a8b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwb3V0ZG9vciUyMHRlcnJhY2UlMjBkaW5pbmd8ZW58MXx8fHwxNzcwNDgzNDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Outdoor terrace dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1726884979054-3bcad533c5af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwd2luZSUyMGNlbGxhciUyMGJvdHRsZXN8ZW58MXx8fHwxNzcwNDgzNzcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Wine cellar'
    },
    {
      url: 'https://images.unsplash.com/photo-1769638913500-4a0b6ac4561a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMHByaXZhdGUlMjBkaW5pbmclMjByb29tfGVufDF8fHx8MTc3MDQ4Mzc3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Private dining room'
    },
    {
      url: 'https://images.unsplash.com/photo-1759277513461-41fde7d24083?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZGVzc2VydCUyMHBsYXRpbmclMjBwYXN0cnl8ZW58MXx8fHwxNzcwNDgzNzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Dessert plating'
    },
    {
      url: 'https://images.unsplash.com/photo-1663530761401-15eefb544889?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwY2hlZiUyMHByZXBhcmluZyUyMGZvb2R8ZW58MXx8fHwxNzcwNDgzNzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      alt: 'Chef preparing food'
    }
  ];

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    lazyLoad: 'ondemand' as const,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <section id="gallery" className="py-[50px] bg-background relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <SectionHeading 
            badge="OUR RESTAURANT"
            title="Gallery"
            description="Explore our restaurant through images"
            align="left"
          />
          
          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="p-3 rounded-full bg-card border border-border hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="p-3 rounded-full bg-card border border-border hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="gallery-carousel">
          <Slider ref={sliderRef} {...settings}>
            {images.map((image, index) => (
              <div key={index} className="px-3">
                <div 
                  onClick={() => openLightbox(index)}
                  className="relative h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <ImageWithFallback 
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      View Image
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="flex justify-center mt-12">
          <Button variant="secondary" icon={ArrowRight} iconPosition="right" to="/wizard">
            Create Menu Now
          </Button>
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery lightbox"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white hover:text-primary transition-colors p-2 z-10"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 sm:left-8 text-white hover:text-primary transition-colors p-2 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>

            {/* Image Container */}
            <div 
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={images[selectedImage].url}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                style={{ borderRadius: 'var(--radius-card)' }}
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/80 backdrop-blur-md text-white px-6 py-2 rounded-full">
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 sm:right-8 text-white hover:text-primary transition-colors p-2 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .gallery-carousel .slick-slide > div {
          height: 100%;
        }
        
        .gallery-carousel .slick-track {
          display: flex;
          align-items: stretch;
        }
      `}</style>
    </section>
  );
}