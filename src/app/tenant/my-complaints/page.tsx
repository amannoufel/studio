import MainLayout from '@/components/layout/MainLayout';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import { getComplaints } from '@/lib/placeholder-data'; // Simulated data fetching
import type { Complaint } from '@/lib/definitions';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MyComplaintsPage() {
  // In a real app, filter by logged-in tenant_id
  const allComplaints = await getComplaints();
  // Simulate filtering for a specific tenant (e.g., tenant1)
  const myComplaints = allComplaints.filter(c => c.tenant_id === 'tenant1' || !c.tenant_id);


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
