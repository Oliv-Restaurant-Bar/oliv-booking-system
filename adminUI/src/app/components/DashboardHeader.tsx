import { useState, useRef, useEffect } from 'react';
import { User, Menu, LogOut, UserCircle, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  userName?: string;
  isScrolled?: boolean;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function DashboardHeader({ onMenuClick, userName = 'Admin User', isScrolled = false, currentPage = 'dashboard', onNavigate }: DashboardHeaderProps) {
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
      subtitle: `Welcome back, ${userName}! Here's what's happening today.`
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

  return (
    <div 
      className={`mx-4 md:mx-8 mt-3 md:mt-5 mb-3 md:mb-5 flex items-center justify-between bg-card rounded-2xl px-4 md:px-[32px] py-3 md:py-[10px] border border-border transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        {/* Menu Button for mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer flex-shrink-0"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="min-w-0 flex-1">
          <h1 className="truncate" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
            {currentPageInfo.title}
          </h1>
          <p className="text-muted-foreground mt-1 hidden sm:block truncate" style={{ fontSize: 'var(--text-base)' }}>
            {currentPageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* User Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 md:gap-3 p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden md:inline" style={{ fontSize: 'var(--text-base)' }}>{userName}</span>
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onNavigate?.('profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span style={{ fontSize: 'var(--text-base)' }}>Profile</span>
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Handle logout action
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