"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/definitions';

interface MainLayoutProps {
  children: React.ReactNode;
  initialUserRole?: UserRole; // For pages that might already know the role
}

export default function MainLayout({ children, initialUserRole }: MainLayoutProps) {
  const [userRole, setUserRole] = useState<UserRole>(initialUserRole || null);
  const router = useRouter();

  useEffect(() => {
    // Attempt to get role from localStorage on client-side
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setUserRole(storedRole);
    } else if (!initialUserRole && window.location.pathname !== '/login' && window.location.pathname !== '/') {
      // If no role and not on login/home, redirect to login
      // router.push('/login'); // This can cause redirect loops if login itself uses MainLayout without initialUserRole
    }
  }, [router, initialUserRole]);
  
  // This effect is for pages like login that set the role
  useEffect(() => {
    if (initialUserRole) {
      setUserRole(initialUserRole);
      localStorage.setItem('userRole', initialUserRole);
    }
  }, [initialUserRole]);


  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const showSidebar = userRole && (window.location.pathname.startsWith('/tenant') || window.location.pathname.startsWith('/admin'));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader userRole={userRole} onLogout={handleLogout} />
        <div className="flex flex-1">
          {showSidebar && <AppSidebar userRole={userRole} />}
          <SidebarInset className={showSidebar ? "" : "md:ml-0"}>
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
