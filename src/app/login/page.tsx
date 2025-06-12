
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { LogIn, UserPlus, Wrench } from 'lucide-react';
import Link from 'next/link';
import type { UserRole } from '@/lib/definitions';
import { getTenantByMobileAndPassword } from '@/lib/placeholder-data';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Username for admin, mobile for tenant
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleLogin = async (role: UserRole) => {
    if (!loginIdentifier || !password) {
      setError('Please enter your credentials.');
      return;
    }
    setError('');

    if (role === 'admin') {
      if (loginIdentifier === 'admin' && password === '123') {
        localStorage.setItem('userRole', role as string);
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials.');
        toast({
          title: "Admin Login Failed",
          description: "Invalid admin username or password.",
          variant: "destructive",
        });
      }
    } else if (role === 'tenant') {
      const tenant = await getTenantByMobileAndPassword(loginIdentifier, password);
      if (tenant) {
        localStorage.setItem('userRole', role as string);
        localStorage.setItem('tenantId', tenant.id); 
        localStorage.setItem('tenantMobile', tenant.mobile_no); 
        localStorage.setItem('tenantBuilding', tenant.building_name);
        localStorage.setItem('tenantFlat', tenant.room_no);
        router.push('/tenant/my-complaints');
      } else {
        setError('Invalid mobile number or password.');
        toast({
          title: "Tenant Login Failed",
          description: "Invalid mobile number or password. Please try again or sign up.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <MainLayout initialUserRole={null}>
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
               <Wrench className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Login to Tenant Tracker</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginIdentifier">Username (Admin) / Mobile No. (Tenant)</Label>
              <Input
                id="loginIdentifier"
                type="text"
                placeholder="admin or 555-123-4567"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-6">
            <div className="flex gap-2 w-full">
              <Button onClick={() => handleLogin('tenant')} className="flex-1" variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> Login as Tenant
              </Button>
              <Button onClick={() => handleLogin('admin')} className="flex-1">
                <LogIn className="mr-2 h-4 w-4" /> Login as Admin
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Tenant and don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline inline-flex items-center">
                 <UserPlus className="mr-1 h-4 w-4" /> Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
