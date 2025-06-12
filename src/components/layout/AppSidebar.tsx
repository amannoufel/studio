"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, PlusCircle, LayoutDashboard, Settings, Wrench } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { UserRole } from '@/lib/definitions';

interface AppSidebarProps {
  userRole: UserRole;
}

const tenantNavItems = [
  { href: '/tenant/my-complaints', label: 'My Complaints', icon: ListChecks },
  { href: '/tenant/new-complaint', label: 'New Complaint', icon: PlusCircle },
];

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/settings', label: 'Settings', icon: Settings }, // Example, not implemented
];

export default function AppSidebar({ userRole }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = userRole === 'admin' ? adminNavItems : tenantNavItems;

  if (!userRole) return null;

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="flex items-center justify-between p-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground">
          {/* Icon can be here if not in header, or a smaller version */}
        </Link>
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {/* Footer content if any, e.g. user profile quick link */}
      </SidebarFooter>
    </Sidebar>
  );
}
