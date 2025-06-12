
"use client"; 
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import UpdateJobForm from '@/components/forms/UpdateJobForm';
import JobHistoryItem from '@/components/complaints/JobHistoryItem';
import { getComplaintByIdAction } from '@/lib/actions'; // Use the server action for fetching
import type { Complaint, Job } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, CalendarDays, ClipboardList, Info, ListChecks, Phone, Tag, User, Hash, Clock, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const statusStyles: Record<Complaint['status'], string> = {
  Pending: "bg-yellow-500 hover:bg-yellow-600",
  Attended: "bg-blue-500 hover:bg-blue-600",
  Completed: "bg-green-500 hover:bg-green-600",
  "Not Completed": "bg-red-500 hover:bg-red-600",
  "Tenant Not Available": "bg-orange-500 hover:bg-orange-600",
};

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchComplaintDetails = useCallback(async () => {
    setLoading(true);
    if (complaintId) {
      const data = await getComplaintByIdAction(complaintId); // Call server action
      setComplaint(data || null);
    }
    setLoading(false);
  }, [complaintId]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails, refetchTrigger]); // Add refetchTrigger to dependencies

  const handleJobUpdated = () => {
    router.refresh(); // Refresh RSCs and server data for the route
    setRefetchTrigger(prev => prev + 1); // Trigger client-side re-fetch of its own data
  };

  if (loading) {
    return (
      <MainLayout initialUserRole="admin">
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
        </div>
      </MainLayout>
    );
  }

  if (!complaint) {
    return (
      <MainLayout initialUserRole="admin">
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-semibold">Complaint Not Found</h1>
          <p className="text-muted-foreground">The complaint with ID "{complaintId}" could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout initialUserRole="admin">
      <div className="space-y-8">
        <div>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-headline font-semibold flex items-center">
              <ClipboardList className="mr-3 h-8 w-8 text-primary" />
              Complaint Details: {complaint.id}
            </h1>
            <Badge className={`${statusStyles[complaint.status]} text-primary-foreground text-base px-3 py-1`}>
              {complaint.status}
            </Badge>
          </div>
           {complaint.duplicate_generated && (
            <p className="text-sm text-orange-600 mt-1">This complaint has been superseded by a new one.</p>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Complaint Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            <InfoItem icon={Hash} label="Complaint ID" value={complaint.id} />
            <InfoItem icon={CalendarDays} label="Date Registered" value={new Date(complaint.date_registered).toLocaleDateString()} />
            <InfoItem icon={User} label="Building" value={complaint.bldg_name} />
            <InfoItem icon={User} label="Flat No." value={complaint.flat_no} />
            <InfoItem icon={Phone} label="Mobile No." value={complaint.mobile_no} />
            <InfoItem icon={Clock} label="Preferred Time" value={complaint.preferred_time} />
            <InfoItem icon={Tag} label="Category" value={complaint.category} className="capitalize" />
            <div className="md:col-span-2 lg:col-span-3">
                 <InfoItem icon={Info} label="Description" value={complaint.description} isFullWidth />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
            <ListChecks className="mr-3 h-7 w-7 text-primary" />
            Job History
          </h2>
          {complaint.jobs && complaint.jobs.length > 0 ? (
            complaint.jobs.map((job: Job) => (
              <JobHistoryItem key={job.id} job={job} />
            ))
          ) : (
            <Card className="text-center py-8">
                <CardContent>
                    <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No job history found for this complaint.</p>
                </CardContent>
            </Card>
          )}
        </div>
        
        {complaint.status !== 'Completed' && !complaint.duplicate_generated && (
          <UpdateJobForm complaintId={complaint.id} onJobUpdated={handleJobUpdated} />
        )}
         {complaint.status === 'Completed' && (
             <Card className="text-center py-8 bg-green-50 border-green-200">
                <CardContent>
                    <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 mb-3" />
                    <p className="text-green-700 font-medium">This complaint has been marked as completed.</p>
                </CardContent>
            </Card>
         )}

      </div>
    </MainLayout>
  );
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
    className?: string;
    isFullWidth?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, className, isFullWidth }) => (
    <div className={`flex items-start ${isFullWidth ? 'flex-col sm:flex-row sm:items-center' : ''}`}>
        <div className="flex items-center w-full sm:w-auto">
            <Icon className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <span className="font-medium text-muted-foreground whitespace-nowrap">{label}:</span>
        </div>
        <span className={`ml-1 ${className || ''} ${isFullWidth ? 'mt-1 sm:mt-0 sm:ml-2' : ''}`}>{value}</span>
    </div>
);
