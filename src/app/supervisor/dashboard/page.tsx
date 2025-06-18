"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getComplaintsAction, approveJobAction } from '@/lib/actions';
import type { Complaint } from '@/lib/definitions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupervisorDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<{ [jobId: string]: boolean }>({});

  useEffect(() => {
    getComplaintsAction().then((data) => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (jobId: string) => {
    setApproving((prev) => ({ ...prev, [jobId]: true }));
    await approveJobAction(jobId);
    // Refresh complaints list
    const data = await getComplaintsAction();
    setComplaints(data);
    setApproving((prev) => ({ ...prev, [jobId]: false }));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500';
      case 'Attended':
        return 'text-blue-500';
      case 'Completed':
        return 'text-green-600';
      case 'Not Completed':
        return 'text-red-500';
      case 'Tenant Not Available':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <MainLayout initialUserRole="supervisor">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-headline font-semibold mb-6">All Jobs / Complaints</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <p>No jobs or complaints found.</p>
            ) : (
              complaints.map((complaint) => {
                // Find the latest job for this complaint
                const latestJob = complaint.jobs && complaint.jobs.length > 0 ? complaint.jobs[complaint.jobs.length - 1] : null;
                return (
                  <Card key={complaint.id}>
                    <CardHeader>
                      <CardTitle>
                        {complaint.category} - {complaint.bldg_name} {complaint.flat_no}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><b>Date:</b> {complaint.date_registered}</p>
                      <p><b>Status:</b> <span className={statusColor(complaint.status)}>{complaint.status}</span></p>
                      <p><b>Description:</b> {complaint.description}</p>
                      <div className="flex gap-2 items-center mt-3">
                        <Link href={`/supervisor/dashboard/${complaint.id}`}>
                          <Button>View Details</Button>
                        </Link>
                        {latestJob && (
                          <Button
                            variant={latestJob.approved ? "default" : "outline"}
                            disabled={!!latestJob.approved || approving[latestJob.id]}
                            onClick={() => handleApprove(latestJob.id)}
                          >
                            {latestJob.approved ? "Approved" : approving[latestJob.id] ? "Approving..." : "Approve"}
                          </Button>
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
