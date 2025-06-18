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
      <div className="max-w-2xl mx-auto py-8">
        {loading ? (
          <p>Loading...</p>
        ) : !complaint ? (
          <p>Complaint not found.</p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><b>Category:</b> {complaint.category}</p>
              <p><b>Building:</b> {complaint.bldg_name}</p>
              <p><b>Flat:</b> {complaint.flat_no}</p>
              <p><b>Date Registered:</b> {complaint.date_registered}</p>
              <p><b>Status:</b> {complaint.status}</p>
              <p><b>Description:</b> {complaint.description}</p>
              <h3 className="mt-4 font-semibold">Job History</h3>
              {complaint.jobs && complaint.jobs.length > 0 ? (
                <ul className="list-disc ml-6">
                  {complaint.jobs.map((job) => (
                    <li key={job.id} className="flex items-center gap-4 mb-2">
                      <span>
                        Attended: {job.date_attended} {job.time_attended} | Staff: {job.staff_attended?.join(', ')} | Status: {complaint.status}
                      </span>
                      {job.approved ? (
                        <span className="text-green-600 font-semibold ml-2">Approved</span>
                      ) : (
                        <Button size="sm" onClick={() => handleApprove(job.id)} disabled={approving} className="ml-2">
                          {approving ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No job history.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
