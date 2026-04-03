'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/admin/DashboardSidebar';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { DashboardFooter } from '@/components/admin/DashboardFooter';

export function AdminLayoutClient({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: any;
}) {
  const [session, setSession] = useState<any>(initialSession);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Fetch session on mount (only if not provided by SSR)
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/get-session');
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    }

    const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');
    if (!isLoginPage && !initialSession) {
      fetchSession();
    }
  }, [pathname, initialSession]);

  // Don't show sidebar/header on login page
  const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');

  // Determine current page from pathname
  const getCurrentPage = () => {
    if (!pathname) return 'dashboard';
    if (pathname === '/admin' || pathname === '/admin/') return 'dashboard';
    const segment = pathname.split('/')[2];
    if (segment === 'bookings') return 'bookings';
    if (segment === 'reports') return 'reports';
    if (segment === 'menu-config') return 'menu-config';
    if (segment === 'user-management') return 'user-management';
    if (segment === 'settings') return 'settings';
    if (segment === 'profile') return 'profile';
    if (segment === 'login') return 'login';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If it's the login page, render children without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block sticky top-0 h-screen self-start">
        <DashboardSidebar user={session?.user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <DashboardSidebar user={session?.user} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader
              user={session?.user}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              isScrolled={isScrolled}
              currentPage={currentPage}
            />
          </div>

          {/* Main Content */}
          <main key={pathname} ref={mainRef} className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Sticky Footer */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
