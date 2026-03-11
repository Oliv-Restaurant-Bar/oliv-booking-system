import { Home, Users, ShoppingBag, BarChart3, Settings, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { UserRole } from '@/lib/db/schema';
import { useSidebarTranslation } from '@/lib/i18n/client';

interface DashboardSidebarProps {
  user?: any;
  activeItem?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ user, activeItem = 'dashboard', onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useSidebarTranslation();
  // Handle both user object and session object (which contains a user property)
  const userData = user?.user || user;
  const userRole = (userData?.role as UserRole) || 'read_only';

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), href: '/admin', icon: Home, permission: Permission.VIEW_DASHBOARD },
    { id: 'bookings', label: t('bookings'), href: '/admin/bookings', icon: ShoppingBag, permission: Permission.VIEW_BOOKINGS },
    { id: 'reports', label: t('reports'), href: '/admin/reports', icon: BarChart3, permission: Permission.VIEW_REPORTS },
    { id: 'menu-config', label: t('menuConfig'), href: '/admin/menu-config', icon: UtensilsCrossed, permission: Permission.VIEW_MENU },
    { id: 'user-management', label: t('userManagement'), href: '/admin/user-management', icon: Users, permission: Permission.VIEW_USERS },
    { id: 'settings', label: t('settings'), href: '/admin/settings', icon: Settings, permission: Permission.VIEW_SETTINGS },
  ];

  // Filter items based on user permissions
  const visibleItems = menuItems.filter(item =>
    !item.permission || hasPermission(userRole, item.permission)
  );

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
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.id === activeItem && pathname === '/admin');

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={handleNavigate}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${isActive
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
