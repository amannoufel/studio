import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, UserCircle, LogOut, Wrench } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  userRole: 'tenant' | 'admin' | 'supervisor' | null;
  onLogout: () => void;
}

export default function AppHeader({ userRole, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Wrench className="h-6 w-6" />
          <span className="font-headline">Tenant Tracker</span>
        </Link>
        <div className="flex items-center gap-4">
          {userRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account ({userRole})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
           {!userRole && (
             <Button asChild variant="outline">
                <Link href="/login">Login</Link>
             </Button>
           )}
        </div>
      </div>
    </header>
  );
}
