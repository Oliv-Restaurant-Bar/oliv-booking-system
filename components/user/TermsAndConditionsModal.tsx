import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Clock, UserCheck, AlertCircle } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div 
        className="bg-white rounded-[32px] w-full max-w-[700px] max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-[#f3f4f6] flex-shrink-0 bg-gradient-to-r from-white to-[#f9fafb]">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-[#9dae91]/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#9dae91]" />
            </div>
            <div>
              <h2 className="font-extrabold text-[24px] text-[#2c2f34] tracking-tight">Allgemeine Geschäftsbedingungen</h2>
              <p className="text-[#9ca3af] text-[13px] font-medium uppercase tracking-wider">Oliv Restaurant & Catering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-8 size-10 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb] hover:rotate-90 transition-all duration-300 group"
          >
            <X className="w-5 h-5 text-[#6b7280] group-hover:text-[#2c2f34]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <div className="space-y-10">
            {/* Section 1 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#2c2f34]" />
                </div>
                <h3 className="font-bold text-[18px] text-[#2c2f34]">1. Buchung & Personenzahl</h3>
              </div>
              <div className="pl-11 space-y-3">
                <p className="text-[15px] text-[#6b7280] leading-relaxed">
                  Um die höchste Service- und Zutatenqualität zu gewährleisten, benötigen wir die endgültige Gästezahl mindestens <span className="font-bold text-[#2c2f34]">4 Werktage</span> vor Ihrer Veranstaltung.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex gap-2.5 text-[14px] text-[#6b7280]">
                    <div className="size-1.5 rounded-full bg-[#9dae91] mt-2 shrink-0" />
                    Die 4 Tage im Voraus mitgeteilte Gästezahl gilt als Mindestanzahl für die Rechnungsstellung.
                  </li>
                  <li className="flex gap-2.5 text-[14px] text-[#6b7280]">
                    <div className="size-1.5 rounded-full bg-[#9dae91] mt-2 shrink-0" />
                    Kurzfristige Erhöhungen der Gästezahl hängen von der Verfügbarkeit und der Küchenkapazität ab.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-[#2c2f34]" />
                </div>
                <h3 className="font-bold text-[18px] text-[#2c2f34]">2. Stornierungsbedingungen</h3>
              </div>
              <div className="pl-11 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#fffaf0] border border-amber-100">
                    <p className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-1">Standard</p>
                    <p className="text-[14px] text-amber-900 leading-snug">Stornierungen bis zu <span className="font-bold">48 Stunden</span> vorher sind kostenlos.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                    <p className="text-[12px] font-bold text-red-700 uppercase tracking-wider mb-1">Spät</p>
                    <p className="text-[14px] text-red-900 leading-snug">Stornierungen innerhalb von <span className="font-bold">24 Stunden</span> werden zu <span className="font-bold">100 %</span> berechnet.</p>
                  </div>
                </div>
                <p className="text-[14px] text-[#6b7280] italic">
                  *Bei Grossanlässen oder speziellen Raummieten (UG1 Exklusiv) können abweichende Bedingungen gelten.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-[#2c2f34]" />
                </div>
                <h3 className="font-bold text-[18px] text-[#2c2f34]">3. Ernährungsbedürfnisse</h3>
              </div>
              <div className="pl-11 space-y-3 text-[15px] text-[#6b7280] leading-relaxed">
                <p>
                  Wir nehmen Allergien und Diätvorgaben sehr ernst. Bitte stellen Sie sicher, dass alle Anforderungen während des Buchungsprozesses oder in der Check-in-E-Mail mitgeteilt werden.
                </p>
                <div className="p-4 bg-[#f9fafb] rounded-2xl border border-[#f3f4f6] flex items-start gap-4">
                  <div className="size-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-[13px] text-[#6b7280]">
                    Obwohl wir strenge Hygienestandards einhalten, verarbeitet unsere Küche Nüsse, Gluten und Milchprodukte. Wir können eine zu 100 % spurenfreie Umgebung nicht garantieren.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#2c2f34]" />
                </div>
                <h3 className="font-bold text-[18px] text-[#2c2f34]">4. Zahlung & Preise</h3>
              </div>
              <div className="pl-11 space-y-3 text-[15px] text-[#6b7280] leading-relaxed">
                <p>
                  Alle Preise verstehen sich in <span className="font-bold text-[#2c2f34]">CHF</span> und enthalten die gesetzliche Mehrwertsteuer (MwSt.), sofern nicht anders angegeben.
                </p>
                <p>
                  Die abgebildeten Kosten wurden auf Basis der jeweils teuersten Auswahl pro Kategorie berechnet.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-[#f3f4f6] text-[14px]">
                    <span>Zahlungsmethoden</span>
                    <span className="font-bold text-[#2c2f34]">EC-Karte, Kreditkarte, Rechnung</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#f3f4f6] text-[14px]">
                    <span>Zahlungsfrist</span>
                    <span className="font-bold text-[#2c2f34]">10 Tage für Rechnungen</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 text-center border-t border-[#f3f4f6]">
              <p className="text-[12px] text-[#9ca3af]">
                Version 1.2 • Stand: März 2024 • Oliv Bern
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#f9fafb] border-t border-[#f3f4f6] flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#2c2f34] text-white text-[14px] font-bold rounded-2xl hover:bg-[#1a1c1f] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#2c2f34]/10"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
