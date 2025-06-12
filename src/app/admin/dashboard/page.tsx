import MainLayout from '@/components/layout/MainLayout';
import ComplaintTable from '@/components/complaints/ComplaintTable';
import { getComplaints } from '@/lib/placeholder-data'; // Simulated data fetching
import { FileText } from 'lucide-react';

export default async function AdminDashboardPage() {
  const complaints = await getComplaints();

  return (
    <MainLayout initialUserRole="admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-semibold flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            Complaints Dashboard
          </h1>
          {/* Add any dashboard-level actions here, e.g., Export button */}
        </div>
        <ComplaintTable complaints={complaints} />
      </div>
    </MainLayout>
  );
}
