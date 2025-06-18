"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { getComplaintsAction } from '@/lib/actions';
import type { Complaint } from '@/lib/definitions';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupervisorDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaintsAction().then((data) => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

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
              complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardHeader>
                    <CardTitle>
                      {complaint.category} - {complaint.bldg_name} {complaint.flat_no}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><b>Date:</b> {complaint.date_registered}</p>
                    <p><b>Status:</b> {complaint.status}</p>
                    <p><b>Description:</b> {complaint.description}</p>
                    <Link href={`/supervisor/dashboard/${complaint.id}`}>
                      <Button className="mt-3">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
