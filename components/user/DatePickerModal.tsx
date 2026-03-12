'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  minDate?: Date;
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialDate,
  minDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || '');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const isDateDisabled = (date: Date) => {
    const dateKey = formatDateKey(date);
    const minDateKey = minDate.toISOString().split('T')[0];
    return dateKey < minDateKey;
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
      onSelect(dateKey);
      onClose();
    }
  };

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

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
                  <button
                    onClick={goToPrevMonth}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <span className="text-lg font-semibold" style={{ color: 'var(--primary-foreground)' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="px-6 py-5">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dayObj, index) => {
                    const disabled = isDateDisabled(dayObj.date);
                    const selected = isDateSelected(dayObj.date);

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: disabled ? 1 : 1.05 }}
                        whileTap={{ scale: disabled ? 1 : 0.95 }}
                        onClick={() => handleDateSelect(dayObj.date)}
                        disabled={disabled}
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
