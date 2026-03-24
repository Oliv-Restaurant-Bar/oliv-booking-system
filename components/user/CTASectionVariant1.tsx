'use client';

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import Link from "next/link";
import { useLandingTranslation } from '@/lib/i18n/client';

const imgDiningWarm = "https://cdn.picflow.com/assets/images/9bb36043-7b02-4db1-ba3d-f1abaeea4fc0/base/9bb36043-7b02-4db1-ba3d-f1abaeea4fc0.jpg";
const GOLD = "#9dae91";
const DARK = "#262d39";

export function CTASectionVariant1() {
  const t = useLandingTranslation();
  return (
    <section className="bg-[#fafafa] py-28" id="cta">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-12">
          <div className="col-span-12">
            <div
              className="relative rounded-[20px] overflow-hidden"
              style={{ background: DARK }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={imgDiningWarm}
                  alt="Olive catering event"
                  className="w-full h-full object-cover opacity-25"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${DARK} 30%, rgba(38,45,57,0.7) 60%, rgba(157,174,145,0.15) 100%)`,
                  }}
                />
              </div>

              {/* Decorative elements */}
              <div
                className="absolute -top-20 -right-20 size-[300px] rounded-full opacity-[0.06]"
                style={{ backgroundColor: GOLD }}
              />
              <div
                className="absolute -bottom-32 -left-32 size-[400px] rounded-full opacity-[0.04]"
                style={{ backgroundColor: GOLD }}
              />

              {/* Content */}
              <div className="relative z-10 py-24 px-8 flex flex-col items-center text-center">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-[10px] px-5 py-[9px] rounded-full border mb-8"
                  style={{
                    borderColor: "rgba(157,174,145,0.4)",
                    background: "rgba(157,174,145,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                    <span
                      className="font-['Hanken_Grotesk',sans-serif] font-semibold text-[12px] tracking-[0.14em] uppercase"
                      style={{ color: GOLD }}
                    >
                      {t('cta.readyToBegin')}
                    </span>
                  </div>

                  <h2
                    className="font-['Hanken_Grotesk',sans-serif] font-semibold text-white max-w-[680px]"
                    style={{
                      fontSize: "clamp(28px, 3.5vw, 48px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {t('cta.subtitle')} <span style={{ color: GOLD }}>{t('cta.minutes')}</span>
                  </h2>

                  <p
                    className="font-['Hanken_Grotesk',sans-serif] font-normal text-[rgba(255,255,255,0.65)] max-w-[540px] mt-6"
                    style={{ fontSize: "clamp(15px, 1.2vw, 17px)", lineHeight: 1.7 }}
                  >
                    {t('cta.body')}
                  </p>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                    <Link
                      href="/wizard"
                      className="h-[52px] px-8 rounded-[8px] font-['Hanken_Grotesk',sans-serif] font-medium text-[15px] flex items-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                      style={{ backgroundColor: GOLD, color: DARK }}
                    >
                      {t('cta.button')}
                    </Link>
                    <a
                      href="https://images.romystreit.com/raumforum-oliv-24/snrf6ty9je"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-[52px] px-8 rounded-[8px] font-['Hanken_Grotesk',sans-serif] font-medium text-[15px] text-white flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1.5px solid rgba(255,255,255,0.22)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {t('cta.viewGallery')}
                    </a>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}