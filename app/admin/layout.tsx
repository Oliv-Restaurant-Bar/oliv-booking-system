'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/admin/DashboardSidebar';
import { DashboardHeader } from '@/components/admin/DashboardHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Determine current page from pathname
  const getCurrentPage = () => {
    if (pathname === '/admin' || pathname === '/admin/') return 'dashboard';
    const segment = pathname.split('/')[2];
    if (segment === 'bookings') return 'bookings';
    if (segment === 'reports') return 'reports';
    if (segment === 'menu-config') return 'menu-config';
    if (segment === 'user-management') return 'user-management';
    if (segment === 'settings') return 'settings';
    if (segment === 'profile') return 'profile';
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block sticky top-0 h-screen self-start">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      
      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
              isScrolled={isScrolled}
              currentPage={currentPage}
            />
          </div>
          
          {/* Main Content */}
          <main ref={mainRef} className="flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
