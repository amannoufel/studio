
'use server';

import { revalidatePath } from 'next/cache';
import type { Complaint, Job, ComplaintStatus, BuildingName } from './definitions';
import {
  addComplaint as addComplaintData,
  addJob as addJobData,
  getComplaintById as getComplaintByIdData, // Import the data fetching function
} from './placeholder-data';

// Server Action for creating a new complaint
export async function createComplaintAction(
  complaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & { tenant_id?: string }
): Promise<Complaint> {
  const newComplaint = await addComplaintData(complaintData);
  
  revalidatePath('/admin/dashboard');
  if (complaintData.tenant_id) {
    revalidatePath('/tenant/my-complaints');
  }
  
  return newComplaint;
}

// Server Action for updating a job and complaint status
export async function updateJobAction(
  jobData: Omit<Job, 'id'>,
  complaintStatusUpdate: ComplaintStatus,
  reasonIfNotCompleted?: string | null
): Promise<Job> {
  const updatedJob = await addJobData(jobData, complaintStatusUpdate, reasonIfNotCompleted || undefined);
  
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/complaints/${jobData.complaint_id}`);
  revalidatePath('/tenant/my-complaints'); 
  
  return updatedJob;
}

// Server Action for fetching a single complaint's details
export async function getComplaintByIdAction(id: string): Promise<Complaint | null> {
  // This function will run on the server and access the server-side placeholder data
  const complaint = await getComplaintByIdData(id);
  return complaint || null;
}
