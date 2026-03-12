'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string;
}

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30'
];

export function TimePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialTime
}: TimePickerModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || '');

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onSelect(time);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-border"
              style={{ fontFamily: 'var(--font-family)' }}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border" style={{ backgroundColor: 'var(--primary)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--primary-foreground)' }}>
                    Uhrzeit wählen
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Wählen Sie eine Uhrzeit für Ihr Event
                </p>
              </div>

              {/* Time Slots */}
              <div className="px-6 py-5 max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map(time => {
                    const isSelected = time === selectedTime;
                    return (
                    <motion.button
                      key={time}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        px-4 py-4 rounded-xl text-base font-semibold transition-all
                        ${isSelected
                          ? ' text-white shadow-lg border-0'
                          : 'bg-card text-foreground border-2 border-border hover:border-primary hover:shadow-md'
                        }
                      `}
                      style={isSelected ? { backgroundColor: 'var(--primary)' } : { borderRadius: 'var(--radius)' }}
                    >
                      {time}
                    </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted border-t border-border">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-semibold text-base bg-card text-foreground border border-border hover:bg-accent hover:shadow-sm transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  Abbrechen
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
