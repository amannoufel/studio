
'use server';

import { revalidatePath } from 'next/cache';
import type { Complaint, Job, ComplaintStatus, BuildingName } from './definitions';
import {
  addComplaint as addComplaintData,
  addJob as addJobData,
} from './placeholder-data'; // Assuming these are the data manipulation functions

// Server Action for creating a new complaint
export async function createComplaintAction(
  complaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & { tenant_id?: string }
): Promise<Complaint> {
  const newComplaint = await addComplaintData(complaintData);
  
  // Revalidate paths that might be affected
  revalidatePath('/admin/dashboard');
  if (complaintData.tenant_id) {
    revalidatePath('/tenant/my-complaints'); // Or more specific path if tenants have unique complaint URLs
  }
  
  return newComplaint;
}

// Server Action for updating a job and complaint status
export async function updateJobAction(
  jobData: Omit<Job, 'id'>,
  complaintStatusUpdate: ComplaintStatus,
  reasonIfNotCompleted?: string | null // Ensure this can be null if not provided
): Promise<Job> {
  const updatedJob = await addJobData(jobData, complaintStatusUpdate, reasonIfNotCompleted || undefined);
  
  // Revalidate paths
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/complaints/${jobData.complaint_id}`);
  
  // Potentially revalidate tenant's view if their complaint status changed
  // This might require fetching the complaint to get tenant_id if not directly available
  revalidatePath('/tenant/my-complaints'); 
  
  return updatedJob;
}
