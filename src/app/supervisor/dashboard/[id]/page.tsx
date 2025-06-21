"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getComplaintByIdAction, approveJobAction } from '@/lib/actions';
import type { Complaint, Job } from '@/lib/definitions';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupervisorJobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params?.id as string;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (complaintId) {
      getComplaintByIdAction(complaintId).then((data) => {
        setComplaint(data);
        setLoading(false);
      });
    }
  }, [complaintId]);

  const handleApprove = async (jobId: string) => {
    setApproving(true);
    await approveJobAction(jobId);
    setApproving(false);
    // Refresh complaint data
    if (complaintId) {
      const updated = await getComplaintByIdAction(complaintId);
      setComplaint(updated);
    }
  };

  return (
    <MainLayout initialUserRole="supervisor">
      <div className="max-w-3xl mx-auto py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></span>
            <span className="text-lg text-muted-foreground">Loading...</span>
          </div>
        ) : !complaint ? (
          <Card className="p-8 text-center bg-muted/40 border border-primary/20">
            <span className="text-destructive font-semibold text-lg">Complaint not found.</span>
          </Card>
        ) : (
          <>
            <Card className="mb-6 shadow-sm border border-primary/20 bg-background/90 rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-muted-foreground/10">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                <CardTitle className="text-2xl font-headline tracking-tight">Complaint Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div><span className="font-medium text-muted-foreground">Complaint ID:</span> <span className="font-semibold">{complaint.id}</span></div>
                  <div><span className="font-medium text-muted-foreground">Date Registered:</span> <span>{new Date(complaint.date_registered).toLocaleDateString()}</span></div>
                  <div><span className="font-medium text-muted-foreground">Building:</span> <span>{complaint.bldg_name}</span></div>
                  <div><span className="font-medium text-muted-foreground">Flat No.:</span> <span>{complaint.flat_no}</span></div>
                  <div><span className="font-medium text-muted-foreground">Mobile No.:</span> <span>{complaint.mobile_no}</span></div>
                  <div><span className="font-medium text-muted-foreground">Preferred Time:</span> <span>{complaint.preferred_time}</span></div>
                  <div><span className="font-medium text-muted-foreground">Category:</span> <span className="capitalize">{complaint.category}</span></div>
                  <div><span className="font-medium text-muted-foreground">Status:</span> <span className={`font-semibold px-2 py-1 rounded-full shadow-sm border ${complaint.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-300' : complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-blue-100 text-blue-700 border-blue-300'}`}>{complaint.status}</span></div>
                  <div className="md:col-span-2 mt-2"><span className="font-medium text-muted-foreground">Description:</span> <span>{complaint.description}</span></div>
                  {complaint.image_url && (
                    <div className="md:col-span-2 flex flex-col items-start mt-2">
                      <span className="font-medium text-muted-foreground mb-1">Uploaded Photo:</span>
                      <img
                        src={complaint.image_url}
                        alt="Complaint Upload"
                        className="rounded border max-w-xs max-h-64 object-contain bg-white shadow"
                        style={{ marginTop: 4 }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border border-primary/20 bg-background/90 rounded-xl">
              <CardHeader className="flex flex-row items-center gap-2 pb-2 border-b border-muted-foreground/10">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4h-2M9 17v2a2 2 0 002 2h2a2 2 0 002-2v-2" /></svg>
                <CardTitle className="text-2xl font-headline tracking-tight">Job History</CardTitle>
              </CardHeader>
              <CardContent>
                {complaint.jobs && complaint.jobs.length > 0 ? (
                  <ul className="list-disc ml-6 space-y-3">
                    {complaint.jobs.map((job) => (
                      <li key={job.id} className="flex flex-col md:flex-row md:items-center gap-2 mb-2 p-2 rounded bg-muted/40 border border-muted-foreground/10">
                        <span>
                          <span className="font-medium text-muted-foreground">Attended:</span> {job.date_attended} {job.time_attended} | <span className="font-medium text-muted-foreground">Staff:</span> {job.staff_attended?.join(', ') || 'N/A'} | <span className="font-medium text-muted-foreground">Status:</span> <span className={`font-semibold ${complaint.status === 'Completed' ? 'text-green-700' : complaint.status === 'Pending' ? 'text-yellow-700' : 'text-blue-700'}`}>{complaint.status}</span>
                        </span>
                        {job.approved ? (
                          <span className="text-green-600 font-semibold ml-2">Approved</span>
                        ) : (
                          <Button size="sm" onClick={() => handleApprove(job.id)} disabled={approving} className="ml-2 rounded-full px-4 font-medium shadow-sm">
                            {approving ? 'Approving...' : 'Approve'}
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <svg className="h-10 w-10 text-muted-foreground mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-muted-foreground">No job history for this complaint.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
