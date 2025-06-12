"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { LogIn, Wrench } from 'lucide-react';
import type { UserRole } from '@/lib/definitions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (role: UserRole) => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    // Stubbed login:
    // In a real app, you'd validate credentials against a backend.
    // For this stub, we'll just set the role and redirect.
    localStorage.setItem('userRole', role as string);
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/tenant/my-complaints');
    }
  };

  return (
    <MainLayout initialUserRole={null}> {/* Pass null so layout knows not to expect a role yet */}
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
          <CardFooter className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">For demonstration purposes:</p>
            <div className="flex gap-2 w-full">
              <Button onClick={() => handleLogin('tenant')} className="flex-1" variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> Login as Tenant
              </Button>
              <Button onClick={() => handleLogin('admin')} className="flex-1">
                <LogIn className="mr-2 h-4 w-4" /> Login as Admin
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
