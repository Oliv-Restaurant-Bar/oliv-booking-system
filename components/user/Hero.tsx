'use client';
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import Link from "next/link";
import { useLandingTranslation } from '@/lib/i18n/client';

const imgDiningWide = "https://cdn.picflow.com/assets/images/9ee40955-4bc5-4d2a-a8cc-2c3ca4bf3db5/base/9ee40955-4bc5-4d2a-a8cc-2c3ca4bf3db5.jpg";
const imgDiningWarm = "https://cdn.picflow.com/assets/images/9bb36043-7b02-4db1-ba3d-f1abaeea4fc0/base/9bb36043-7b02-4db1-ba3d-f1abaeea4fc0.jpg";
const imgDiningAmbient = "https://cdn.picflow.com/assets/images/21690d2d-c4f1-45f7-ad04-1d4027cbe989/base/21690d2d-c4f1-45f7-ad04-1d4027cbe989.jpg";
const imgBar = "https://cdn.picflow.com/assets/images/adc1153a-1583-4b70-94c4-4886b9a6ebb4/base/adc1153a-1583-4b70-94c4-4886b9a6ebb4.jpg";
const imgArtLounge = "https://cdn.picflow.com/assets/images/b284ebc0-0b0e-41e4-a2bb-c3f46b0b0d9f/base/b284ebc0-0b0e-41e4-a2bb-c3f46b0b0d9f.jpg";

const CAROUSEL_IMAGES = [
  { src: imgDiningWide, alt: "Olive restaurant — spacious dining hall with pendant lights" },
  { src: imgDiningWarm, alt: "Olive restaurant — warm ambient table setting" },
  { src: imgDiningAmbient, alt: "Olive restaurant — elegant interior with paper lanterns" },
  { src: imgBar, alt: "Olive restaurant — arched bar with curated spirits" },
  { src: imgArtLounge, alt: "Olive restaurant — artistic lounge with portrait gallery" },
];

const GOLD = "#9dae91";
const DARK = "#262d39";

export function HeroVariant6() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useLandingTranslation();

  const goTo = (index: number) => {
    if (index === current || fading) return;
    setPrev(current);
    setCurrent(index);
    setFading(true);
    setTimeout(() => {
      setPrev(null);
      setFading(false);
    }, 900);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const next = (current + 1) % CAROUSEL_IMAGES.length;
      goTo(next);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, fading]);

  return (
    <section id="hero" className="relative w-full h-screen min-h-[600px] overflow-hidden bg-background">
      {/* ── Slide stack ── */}
      {CAROUSEL_IMAGES.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity"
          style={{
            opacity: i === current ? 1 : 0,
            transitionDuration: "900ms",
            transitionTimingFunction: "ease-in-out",
            zIndex: i === current ? 2 : i === prev ? 1 : 0,
          }}
        >
          <ImageWithFallback
            src={img.src}
            alt={img.alt}
            fill
            className="w-full h-full object-cover"
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        </div>
      ))}

      {/* ── Dark overlay ── */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(
            160deg,
            rgba(38,45,57,0.72) 0%,
            rgba(38,45,57,0.55) 40%,
            rgba(157,174,145,0.18) 100%
          )`,
        }}
      />

      {/* ── Subtle gold vignette bottom ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(38,45,57,0.85) 0%, transparent 100%)",
        }}
      />

      {/* ── 12-col content grid ── */}
      <div className="absolute inset-0 z-20 flex flex-col">
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-12">
              {/* Content: cols 1-8 on large, full on small */}
              <div className="col-span-12 lg:col-span-8 xl:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-8 mt-16 sm:mt-0">

                {/* Eyebrow badge */}
                <div
                  className="inline-flex items-center gap-[10px] px-5 py-[9px] rounded-full border"
                  style={{
                    borderColor: `rgba(157,174,145,0.45)`,
                    background: `rgba(157,174,145,0.1)`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span
                    className="size-[7px] rounded-full shrink-0"
                    style={{ backgroundColor: GOLD }}
                  />
                  <span
                    className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[12px] tracking-[0.14em] uppercase"
                    style={{ color: GOLD }}
                  >
                    {t('hero.premiumCatering')}
                  </span>
                </div>

                {/* Heading */}
                <h1
                  className="font-['Hanken_Grotesk',sans-serif] font-semibold text-white"
                  style={{
                    fontSize: "clamp(42px, 5.5vw, 76px)",
                    lineHeight: 1.08,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {/* {t('hero.craft')}{" "} */}
                  <span style={{ color: GOLD }}>{t('hero.unforgettable')}</span>
                  <br />
                  {t('hero.diningExperiences')}
                </h1>

                {/* Subtext */}
                <p
                  className="font-['Hanken_Grotesk',sans-serif] font-normal text-[rgba(255,255,255,0.72)] max-w-[540px]"
                  style={{ fontSize: "clamp(15px, 1.4vw, 18px)", lineHeight: 1.7 }}
                >
                  {t('hero.heroDescription')}
                </p>

                {/* CTA row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/wizard"
                    className="h-[52px] px-8 rounded-[8px] font-['Hanken_Grotesk',sans-serif] font-medium text-[15px] flex items-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.97] shadow-[0_4px_24px_rgba(157,174,145,0.35)]"
                    style={{ backgroundColor: GOLD, color: DARK }}
                  >
                    {t('hero.planEvent')}
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke={DARK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>

                  <a
                    href="#how-it-works"
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.querySelector('#how-it-works');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="h-[52px] px-8 rounded-[8px] font-['Hanken_Grotesk',sans-serif] font-medium text-[15px] text-white flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1.5px solid rgba(255,255,255,0.22)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {t('hero.seeHowItWorks')}
                  </a>
                </div>

                {/* Stats row */}
                <div
                  className="flex items-center gap-0 mt-2 rounded-[10px] overflow-hidden"
                  style={{
                    background: "rgba(38,45,57,0.55)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(157,174,145,0.18)",
                  }}
                >
                  {[
                    { value: t('hero.stats.events'), label: t('hero.eventsCatered') },
                    { value: t('hero.stats.menus'), label: t('hero.menuOptions') },
                    { value: t('hero.stats.rating'), label: t('hero.clientRating') },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center px-4 sm:px-8 py-4"
                      style={{
                        borderRight:
                          i < 2 ? "1px solid rgba(157,174,145,0.18)" : "none",
                      }}
                    >
                      <span
                        className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[22px]"
                        style={{ color: GOLD }}
                      >
                        {stat.value}
                      </span>
                      <span className="font-['Hanken_Grotesk',sans-serif] font-normal text-[11px] sm:text-[12px] text-[rgba(255,255,255,0.6)] tracking-wide mt-[2px] text-center">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar: slide indicators ── */}
        <div className="pb-10">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-12">
              <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-between">
                {/* Dots */}
                <div className="flex items-center gap-3">
                  {CAROUSEL_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="transition-all duration-300 rounded-full focus:outline-none"
                      style={{
                        width: i === current ? "32px" : "8px",
                        height: "8px",
                        background:
                          i === current
                            ? GOLD
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                  ))}
                </div>

                {/* Slide label */}
                <span
                  className="font-['Hanken_Grotesk',sans-serif] text-[12px] tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(CAROUSEL_IMAGES.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}