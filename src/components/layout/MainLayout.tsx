"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/definitions';

interface MainLayoutProps {
  children: React.ReactNode;
  initialUserRole?: UserRole; 
}

export default function MainLayout({ children, initialUserRole }: MainLayoutProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(initialUserRole || null);
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    if (storedRole) {
      setUserRole(storedRole);
    } else if (
        !initialUserRole &&
        pathname !== '/login' &&
        pathname !== '/' &&
        pathname !== '/signup' // Added /signup to public paths
      ) {
      // Potentially redirect to login if not on a public page and no role
      // router.push('/login'); // Be cautious with redirects to avoid loops
    }
  }, [router, initialUserRole, pathname]);
  
  useEffect(() => {
    if (initialUserRole) {
      setUserRole(initialUserRole);
      // Only set localStorage if initialUserRole is explicitly provided (e.g., after login/signup)
      // Avoids overwriting on pages that pass null like login/signup itself
      localStorage.setItem('userRole', initialUserRole);
    }
  }, [initialUserRole]);


  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('tenantMobile');
    localStorage.removeItem('tenantBuilding');
    localStorage.removeItem('tenantFlat');
    router.push('/login');
  };

  const showSidebar = userRole && (pathname.startsWith('/tenant') || pathname.startsWith('/admin'));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader userRole={userRole} onLogout={handleLogout} />
        <div className="flex flex-1">
          {showSidebar && <AppSidebar userRole={userRole as UserRole} />} {/* Ensure userRole is not null here */}
          <SidebarInset className={showSidebar ? "" : "md:ml-0"}>
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
