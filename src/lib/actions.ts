
'use server';

import { revalidatePath } from 'next/cache';
import type { Complaint, Job, ComplaintStatus, Tenant, BuildingName } from './definitions';
import {
  addTenantService,
  getTenantByMobileAndPasswordService,
  getComplaintsService,
  getComplaintByIdService,
  addComplaintService,
  addJobService,
} from './supabaseService'; // Import from Supabase service

// --- Tenant Actions ---
export async function createTenantAction(
  tenantData: Omit<Tenant, 'id' | 'password_hash'> & { password_raw: string }
): Promise<Tenant> {
  const newTenant = await addTenantService(tenantData);
  // No direct revalidation needed here usually, as it's part of signup flow
  return newTenant;
}

export async function loginTenantAction(mobile_no: string, password_raw: string): Promise<Tenant | null> {
  const tenant = await getTenantByMobileAndPasswordService(mobile_no, password_raw);
  return tenant;
}

// --- Complaint Actions ---
export async function createComplaintAction(
  complaintData: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & { tenant_id?: string }
): Promise<Complaint> {
  const newComplaint = await addComplaintService(complaintData);
  revalidatePath('/admin/dashboard');
  if (complaintData.tenant_id) {
    revalidatePath('/tenant/my-complaints');
  }
  return newComplaint;
}

export async function getComplaintsAction(): Promise<Complaint[]> {
  const complaints = await getComplaintsService();
  return complaints;
}

export async function getTenantComplaintsAction(tenantId: string): Promise<Complaint[]> {
  const allComplaints = await getComplaintsService();
  return allComplaints.filter(c => c.tenant_id === tenantId);
}

export async function getComplaintByIdAction(id: string): Promise<Complaint | null> {
  const complaint = await getComplaintByIdService(id);
  return complaint;
}

// --- Job Actions ---
export async function updateJobAction(
  jobData: Omit<Job, 'id'>,
  complaintStatusUpdate: ComplaintStatus,
  reasonIfNotCompleted?: string | null
): Promise<Job> {
  const updatedJob = await addJobService(jobData, complaintStatusUpdate, reasonIfNotCompleted || undefined);
  revalidatePath('/admin/dashboard');
  revalidatePath(`/admin/complaints/${jobData.complaint_id}`);
  revalidatePath('/tenant/my-complaints');
  return updatedJob;
}
