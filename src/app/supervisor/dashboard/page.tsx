"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getComplaintsAction, approveJobAction } from '@/lib/actions';
import type { Complaint } from '@/lib/definitions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupervisorDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<{ [jobId: string]: boolean }>({});

  useEffect(() => {
    getComplaintsAction().then((data) => {
      // Sort complaints by date, newest first
      const sortedComplaints = [...data].sort((a, b) => 
        new Date(b.date_registered).getTime() - new Date(a.date_registered).getTime()
      );
      setComplaints(sortedComplaints);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (jobId: string) => {
    setApproving((prev) => ({ ...prev, [jobId]: true }));
    await approveJobAction(jobId);
    const data = await getComplaintsAction();
    const sortedComplaints = [...data].sort((a, b) => 
      new Date(b.date_registered).getTime() - new Date(a.date_registered).getTime()
    );
    setComplaints(sortedComplaints);
    setApproving((prev) => ({ ...prev, [jobId]: false }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Attended':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Not Completed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Tenant Not Available':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <MainLayout initialUserRole="supervisor">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8 border-b border-muted-foreground/10 pb-4">
          <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-3xl font-headline font-semibold tracking-tight">Jobs Dashboard</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="border border-primary/20">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {complaints.length === 0 ? (
              <Card className="border border-primary/20 py-12 bg-muted/40">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-lg font-medium text-muted-foreground">No jobs or complaints found</p>
                </CardContent>
              </Card>
            ) : (
              complaints.map((complaint) => {
                const latestJob = complaint.jobs && complaint.jobs.length > 0 
                  ? complaint.jobs[complaint.jobs.length - 1] 
                  : null;
                return (
                  <Card key={complaint.id} className="border border-primary/20 hover:border-primary/40 transition-colors bg-background/90 shadow-sm rounded-xl">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-semibold tracking-tight">
                          {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)} Issue
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {complaint.bldg_name} - Flat {complaint.flat_no}
                        </CardDescription>
                      </div>
                      <Badge className={`border ${getStatusStyle(complaint.status)} px-3 py-1 text-base font-medium rounded-full shadow-sm`}>{complaint.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Date Filed:</span>{' '}
                            {new Date(complaint.date_registered).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time Slot:</span>{' '}
                            {complaint.preferred_time}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Description:</span>{' '}
                          {complaint.description.length > 100 
                            ? complaint.description.substring(0, 100) + '...'
                            : complaint.description}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mt-2">
                        <Link href={`/supervisor/dashboard/${complaint.id}`}>
                          <Button variant="secondary" className="rounded-full px-5 font-medium shadow-sm">View Details</Button>
                        </Link>
                        {latestJob && !latestJob.approved && (
                          <Button
                            variant="default"
                            disabled={approving[latestJob.id]}
                            onClick={() => handleApprove(latestJob.id)}
                            className="rounded-full px-5 font-medium shadow-sm"
                          >
                            {approving[latestJob.id] ? (
                              <>
                                <span className="animate-spin mr-2">⌛</span>
                                Approving...
                              </>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                        )}
                        {latestJob && latestJob.approved && (
                          <Badge className="bg-green-100 text-green-800 border-green-300 border rounded-full px-3 py-1 text-base font-medium shadow-sm">
                            Approved
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
