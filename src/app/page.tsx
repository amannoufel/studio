import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Users, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Wrench className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-4xl">Welcome to Tenant Tracker</CardTitle>
            <CardDescription className="text-lg">
              Efficiently manage tenant complaints and job requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 items-center">
            <p className="text-center text-muted-foreground">
              Please login to access your dashboard and manage requests.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-center w-full">
                <div className="p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <h3 className="font-semibold text-lg">For Tenants</h3>
                    <p className="text-sm text-muted-foreground">Submit new complaints and track their status easily.</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <h3 className="font-semibold text-lg">For Admins</h3>
                    <p className="text-sm text-muted-foreground">Manage all complaints, update job statuses, and assign tasks.</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
