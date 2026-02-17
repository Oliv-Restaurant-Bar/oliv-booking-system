'use client';

import { Home, Users, ShoppingBag, BarChart3, Settings, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface DashboardSidebarProps {
  activeItem?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ activeItem = 'dashboard', onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home },
    { id: 'bookings', label: 'Bookings', href: '/admin/bookings', icon: ShoppingBag },
    { id: 'reports', label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { id: 'menu-config', label: 'Menu Config', href: '/admin/menu-config', icon: UtensilsCrossed },
    { id: 'user-management', label: 'User Management', href: '/admin/user-management', icon: Users },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="p-5 h-screen">
      <div className="w-64 bg-card h-full flex flex-col rounded-2xl shadow-sm border border-border">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 flex justify-center items-center">
          <ImageWithFallback
            src="https://img.enacton.com/ShareX/2026/02/chrome_PHT9Ca0HbK.png"
            alt="oliv logo"
            className="h-10 w-auto"
          />
        </div>


        {/* Menu Items */}
        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.id === activeItem && pathname === '/admin');

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleNavigate}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                    )}

                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
