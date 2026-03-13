'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  initialDate?: string;
  initialTime?: string;
  minDate?: Date;
}

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30'
];

// Helper to parse time slot string to hours and minutes
const parseTimeSlot = (timeSlot: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  return { hours, minutes };
};

// Helper to check if a specific date + time combination is at least 24 hours in the future
const isDateTimeAvailable = (dateKey: string, timeSlot: string, minDate: Date): boolean => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const { hours, minutes } = parseTimeSlot(timeSlot);

  const selectedDateTime = new Date(year, month - 1, day, hours, minutes);
  return selectedDateTime >= minDate;
};

export function DateTimePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  onSelectTime,
  initialDate,
  initialTime,
  minDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
}: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '');
  const [selectedTime, setSelectedTime] = useState<string>(initialTime || '');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus management when modal opens/closes
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Previous month days
    const prevMonthDays = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - (prevMonthDays.length + daysInMonth);
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if a date has ANY available time slots
  const hasAvailableTimeSlots = (date: Date): boolean => {
    const dateKey = formatDateKey(date);
    const minDateKey = formatDateKey(minDate);

    // If date is before min date, no slots available
    if (dateKey < minDateKey) return false;

    // If date is more than 1 day after min date, all slots are available
    const dayAfterMinDate = new Date(minDate);
    dayAfterMinDate.setDate(dayAfterMinDate.getDate() + 1);
    if (dateKey >= formatDateKey(dayAfterMinDate)) return true;

    // For the day of minDate, check if any time slot is available
    return TIME_SLOTS.some(timeSlot => isDateTimeAvailable(dateKey, timeSlot, minDate));
  };

  const isDateDisabled = (date: Date) => {
    return !hasAvailableTimeSlots(date);
  };

  const isTimeSlotDisabled = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    return !isDateTimeAvailable(selectedDate, timeSlot, minDate);
  };

  const isDateSelected = (date: Date) => {
    return formatDateKey(date) === selectedDate;
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      const dateKey = formatDateKey(date);
      setSelectedDate(dateKey);
      onSelectDate(dateKey);

      // If the previously selected time is not available for this date, clear it
      if (selectedTime && isTimeSlotDisabled(selectedTime)) {
        setSelectedTime('');
        onSelectTime('');
      }
    }
  };

  const handleTimeSelect = (time: string) => {
    if (!isTimeSlotDisabled(time)) {
      setSelectedTime(time);
      onSelectTime(time);
    }
  };

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  // Get disabled time slots for the selected date
  const getDisabledTimeSlots = () => {
    if (!selectedDate) return new Set<string>();
    const disabled = new Set<string>();
    TIME_SLOTS.forEach(slot => {
      if (isTimeSlotDisabled(slot)) {
        disabled.add(slot);
      }
    });
    return disabled;
  };

  const disabledTimeSlots = getDisabledTimeSlots();

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
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="datetime-picker-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border max-h-[90vh]"
              style={{ fontFamily: 'var(--font-family)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border" style={{ backgroundColor: 'var(--primary)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 id="datetime-picker-title" className="text-xl font-semibold" style={{ color: 'var(--primary-foreground)' }}>
                    Datum & Uhrzeit
                  </h2>
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Schließen"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Vorheriger Monat"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-lg font-semibold" style={{ color: 'var(--primary-foreground)' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Nächster Monat"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="flex flex-col md:flex-row">
                {/* Left: Calendar */}
                <div className="flex-1 px-6 py-4 border-r border-border">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2" role="row">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2" role="columnheader">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Kalender">
                    {calendarDays.map((dayObj, index) => {
                      const disabled = isDateDisabled(dayObj.date);
                      const selected = isDateSelected(dayObj.date);
                      const dateLabel = dayObj.date.toLocaleDateString('de-CH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });

                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: disabled ? 1 : 1.05 }}
                          whileTap={{ scale: disabled ? 1 : 0.95 }}
                          onClick={() => handleDateSelect(dayObj.date)}
                          disabled={disabled}
                          role="gridcell"
                          aria-label={dateLabel}
                          aria-selected={selected}
                          aria-disabled={disabled}
                          className={`
                            aspect-square rounded-xl text-sm font-medium transition-all relative
                            ${disabled
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : 'cursor-pointer hover:shadow-md'
                            }
                            ${!dayObj.isCurrentMonth ? 'text-muted-foreground/50' : ''}
                            ${selected && !disabled
                              ? ' text-white shadow-lg'
                              : !disabled && dayObj.isCurrentMonth
                                ? 'hover:bg-muted text-foreground'
                                : ''
                            }
                          `}
                          style={selected && !disabled ? { backgroundColor: 'var(--primary)' } : {}}
                        >
                          {dayObj.date.getDate()}
                          {selected && (
                            <motion.div
                              layoutId="selectedDate"
                              className="absolute inset-0 rounded-xl -z-10"
                              style={{ backgroundColor: 'var(--primary)' }}
                              initial={false}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Time Slots */}
                <div className="w-full md:w-48 bg-muted px-5 py-4 overflow-y-auto max-h-[500px]">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Uhrzeit
                  </h3>
                  <div className="flex flex-col gap-2" role="listbox" aria-label="Verfügbare Uhrzeiten">
                    {TIME_SLOTS.map(time => {
                      const isSelected = time === selectedTime;
                      const isDisabled = isTimeSlotDisabled(time);

                      return (
                        <motion.button
                          key={time}
                          whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                          whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                          onClick={() => handleTimeSelect(time)}
                          disabled={isDisabled}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={isDisabled}
                          className={`
                            px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left relative
                            ${isDisabled
                              ? 'text-muted-foreground/40 cursor-not-allowed bg-card/30 border-2 border-border/30'
                              : isSelected
                                ? ' text-white shadow-lg border-0'
                                : 'bg-card text-foreground border-2 border-border hover:border-primary hover:shadow-md'
                            }
                          `}
                          style={isSelected && !isDisabled ? { backgroundColor: 'var(--primary)' } : { borderRadius: 'var(--radius)' }}
                        >
                          <span className={isDisabled ? 'line-through' : ''}>{time}</span>
                          {isDisabled && (
                            <span className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {selectedDate && disabledTimeSlots.size > 0 && (
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Graue Zeiten sind nicht verfügbar (mind. 24h im Voraus)
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-auto py-4 bg-muted border-t border-border">
                <button
                  ref={lastFocusableRef}
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl font-semibold text-base bg-card text-foreground border border-border hover:bg-accent hover:shadow-sm transition-all"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  Select
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
