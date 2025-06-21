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
          <>
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <CardTitle>Complaint Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div><b>Complaint ID:</b> {complaint.id}</div>
                <div><b>Date Registered:</b> {new Date(complaint.date_registered).toLocaleDateString()}</div>
                <div><b>Building:</b> {complaint.bldg_name}</div>
                <div><b>Flat No.:</b> {complaint.flat_no}</div>
                <div><b>Mobile No.:</b> {complaint.mobile_no}</div>
                <div><b>Preferred Time:</b> {complaint.preferred_time}</div>
                <div><b>Category:</b> {complaint.category}</div>
                <div className="md:col-span-2"><b>Description:</b> {complaint.description}</div>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                {complaint.jobs && complaint.jobs.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {complaint.jobs.map((job) => (
                      <li key={job.id} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <span>
                          <b>Attended:</b> {job.date_attended} {job.time_attended} | <b>Staff:</b> {job.staff_attended?.join(', ') || 'N/A'} | <b>Status:</b> {complaint.status}
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
          </>
        )}
      </div>
    </MainLayout>
  );
}
