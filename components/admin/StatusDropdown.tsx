'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useAdminTranslation } from '@/lib/i18n/client';

interface StatusOption {
  value: string;
  label: string;
  dotColor?: string;
  icon?: LucideIcon;
}

interface StatusDropdownProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function StatusDropdown({
  options,
  value,
  onChange,
  placeholder = undefined,
  className = '',
  disabled = false
}: StatusDropdownProps) {
  const t = useAdminTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Use translation for default placeholder if not provided
  const dropdownPlaceholder = placeholder || t('statusDropdown.selectStatus');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Auto-scroll dropdown menu into view when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        menuRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }, 50);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-background border border-border text-foreground rounded-lg transition-colors flex items-center gap-2 justify-between whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'}`}
        style={{ fontSize: 'var(--text-base)' }}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.dotColor && (
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedOption.dotColor }}
            />
          )}
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4" />}
          <span className="truncate">{selectedOption?.label || dropdownPlaceholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Matching admin dropdown style */}
      {isOpen && (
        <div ref={menuRef} className="absolute right-0 mt-2 min-w-full w-max max-w-[250px] bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
          {options.map((option, index) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left cursor-pointer ${option.value === value ? 'bg-accent' : ''
                } ${index > 0 ? 'border-t border-border' : ''}`}
            >
              {option.dotColor && (
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: option.dotColor }}
                />
              )}
              {option.icon && <option.icon className="w-4 h-4" />}
              <span className="text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-base)' }}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}