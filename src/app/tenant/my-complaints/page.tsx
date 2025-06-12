
"use client";
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import { getComplaints } from '@/lib/placeholder-data'; 
import type { Complaint } from '@/lib/definitions';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyComplaintsPage() {
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    const storedTenantId = localStorage.getItem('tenantId');
    setTenantId(storedTenantId);
  }, []);

  useEffect(() => {
    // This effect depends on tenantId, which is set from localStorage in the previous effect.
    // It also checks if the userRole is 'tenant' before proceeding.
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'tenant' && tenantId === null) {
        // If not a tenant or tenantId hasn't been fetched yet, don't attempt to load complaints.
        // Or handle as an error/redirect if a non-tenant accesses this page.
        // For now, setting loading to false and showing empty if tenantId is not resolved.
        setLoading(false);
        setMyComplaints([]);
        return;
    }
    
    // Only proceed if tenantId has been resolved from localStorage.
    if (tenantId === null && userRole === 'tenant') {
        // tenantId is still being fetched from localStorage, wait.
        return;
    }


    async function fetchComplaints() {
      setLoading(true);
      const allComplaints = await getComplaints();
      if (tenantId) {
        setMyComplaints(allComplaints.filter(c => c.tenant_id === tenantId));
      } else {
        // If tenantId is not found (e.g., user is not a tenant or error in login)
        setMyComplaints([]);
      }
      setLoading(false);
    }

    fetchComplaints();
  }, [tenantId]); // Re-fetch when tenantId is set or changes.

  if (loading) {
    return (
      <MainLayout initialUserRole="tenant">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-9 w-48 rounded" />
            <Skeleton className="h-10 w-56 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout initialUserRole="tenant">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-headline font-semibold">My Complaints</h1>
          <Button asChild>
            <Link href="/tenant/new-complaint">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Complaint
            </Link>
          </Button>
        </div>

        {myComplaints.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl font-semibold">No Complaints Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You haven't submitted any complaints yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/tenant/new-complaint">Submit Your First Complaint</Link>
                </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myComplaints.map((complaint: Complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
