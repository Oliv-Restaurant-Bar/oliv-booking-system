'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Menu, LogOut, UserCircle, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  user?: any;
  userName?: string;
  isScrolled?: boolean;
  currentPage?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({
  user,
  userName,
  isScrolled = false,
  currentPage = 'dashboard',
  onMenuClick
}: DashboardHeaderProps) {
  const router = useRouter();
  const userData = user?.user || user;
  const displayUserName = userName || userData?.name || 'Admin User';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Page titles and subtitles
  const pageInfo: Record<string, { title: string; subtitle: string }> = {
    'dashboard': {
      title: 'Dashboard',
      subtitle: `Welcome back, ${displayUserName}! Here's what's happening today.`
    },
    'bookings': {
      title: 'Bookings',
      subtitle: 'Manage and track all restaurant bookings'
    },
    'reports': {
      title: 'Reports',
      subtitle: 'View analytics and performance reports'
    },
    'menu-config': {
      title: 'Menu Config',
      subtitle: 'Configure your restaurant menu items'
    },
    'user-management': {
      title: 'User Management',
      subtitle: 'Manage staff and user permissions'
    },
    'settings': {
      title: 'Settings',
      subtitle: 'Configure your restaurant settings'
    },
    'profile': {
      title: 'Profile',
      subtitle: 'Manage your account and preferences'
    },
    'help': {
      title: 'Help',
      subtitle: 'Get help and support'
    }
  };

  const currentPageInfo = pageInfo[currentPage] || pageInfo['dashboard'];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div
      className={`mx-4 md:mx-8 mt-3 md:mt-5 mb-4 md:mb-5 flex items-center bg-card rounded-2xl px-4 md:px-[32px] py-[10px] border border-border transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'
        }`}
    >
      {/* Mobile menu button - visible only on small screens */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1">
        <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }} className="text-lg md:text-[26px]">
          {currentPageInfo.title}
        </h1>
        <p className="text-muted-foreground mt-1 hidden md:block" style={{ fontSize: 'var(--text-base)' }}>
          {currentPageInfo.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* User Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              {userData?.image ? (
                <img
                  src={userData.image}
                  alt={displayUserName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <span style={{ fontSize: 'var(--text-base)' }} className="hidden md:block">{displayUserName}</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/admin/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span style={{ fontSize: 'var(--text-base)' }}>Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left border-t border-border cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                <span style={{ fontSize: 'var(--text-base)' }}>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
