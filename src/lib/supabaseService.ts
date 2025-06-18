import { supabase } from './supabaseClient';
import type { Tenant, Complaint, Job, ComplaintStatus, BuildingName, MaterialUsed, MaterialMaster, Staff } from './definitions';

// --- Tenant Functions ---

export async function addTenantService(
  tenantData: Omit<Tenant, 'id' | 'password_hash'> & { password_raw: string }
): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .insert([
      {
        mobile_no: tenantData.mobile_no,
        building_name: tenantData.building_name,
        room_no: tenantData.room_no,
        password_hash: tenantData.password_raw, // IMPORTANT: Hash passwords in production
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding tenant:', error);
    throw new Error(`Error adding tenant: ${error.message}`);
  }
  // Supabase returns an array, so we take the first element.
  // The 'select().single()' should ensure only one object or null.
  return data as Tenant;
}

export async function getTenantByMobileAndPasswordService(
  mobile_no: string,
  password_raw: string
): Promise<Tenant | null> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('mobile_no', mobile_no)
    .eq('password_hash', password_raw) // IMPORTANT: Compare hashed passwords in production
    .maybeSingle(); // Returns a single record or null if not found

  if (error) {
    console.error('Error fetching tenant:', error);
    throw new Error(`Error fetching tenant: ${error.message}`);
  }
  return data || null;
}

// --- Complaint Functions ---

export async function getComplaintsService(tenantId?: string): Promise<Complaint[]> {
  let query = supabase
    .from('complaints')
    .select(`
      *,
      jobs (*)
    `)
    .order('date_registered', { ascending: false });

  // If tenantId is provided, filter by it
  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data: complaints, error: complaintsError } = await query;

  if (complaintsError) {
    console.error('Error fetching complaints:', complaintsError);
    throw new Error(`Error fetching complaints: ${complaintsError.message}`);
  }

  return (complaints as Complaint[] || []).map(c => ({
    ...c,
    // Ensure date_registered is in 'YYYY-MM-DD' if Supabase returns full timestamp
    date_registered: c.date_registered ? new Date(c.date_registered).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    jobs: (c.jobs || []).map(j => ({
      ...j,
      date_attended: j.date_attended ? new Date(j.date_attended).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }))
  }));
}

export async function getComplaintByIdService(id: string): Promise<Complaint | null> {
  const { data: complaint, error } = await supabase
    .from('complaints')
    .select(`
      *,
      jobs (*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching complaint ${id}:`, error);
    throw new Error(`Error fetching complaint ${id}: ${error.message}`);
  }
  if (!complaint) return null;
  
  return {
    ...complaint,
    date_registered: complaint.date_registered ? new Date(complaint.date_registered).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    jobs: (complaint.jobs || []).map((j: Job) => ({
        ...j,
        date_attended: j.date_attended ? new Date(j.date_attended).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }))
  } as Complaint;
}


export async function addComplaintService(
  complaint: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & { tenant_id?: string }
): Promise<Complaint> {  const newComplaintData = {
    ...complaint,
    status: 'Pending' as ComplaintStatus,
    duplicate_generated: false,
    date_registered: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for DATE type
    tenant_id: complaint.tenant_id || null
  };

  const { data, error } = await supabase
    .from('complaints')
    .insert([newComplaintData])
    .select()
    .single();

  if (error) {
    console.error('Error adding complaint:', error);
    throw new Error(`Error adding complaint: ${error.message}`);
  }
  return {
    ...data,
    date_registered: data.date_registered ? new Date(data.date_registered).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  } as Complaint;
}

// --- Job Functions ---

export async function addJobService(
  job: Omit<Job, 'id'>,
  complaintStatusUpdate: ComplaintStatus,
  reasonIfNotCompleted?: string
): Promise<Job> {
  // Use a transaction to update complaint and add job
  // Supabase JS client doesn't directly support transactions in the same way as server-side SDKs.
  // We'll perform operations sequentially and handle potential inconsistencies.
  // For complex transactions, consider using Supabase Edge Functions.

  // 1. Add the Job
  const newJobData = {
    ...job,
    reason_not_completed: reasonIfNotCompleted || null,
  };
  const { data: createdJob, error: jobError } = await supabase
    .from('jobs')
    .insert([newJobData])
    .select()
    .single();

  if (jobError) {
    console.error('Error adding job:', jobError);
    throw new Error(`Error adding job: ${jobError.message}`);
  }

  // 2. Update the Complaint Status
  const { error: complaintUpdateError } = await supabase
    .from('complaints')
    .update({ status: complaintStatusUpdate })
    .eq('id', job.complaint_id);

  if (complaintUpdateError) {
    console.error('Error updating complaint status:', complaintUpdateError);
    // Potentially roll back job creation or log inconsistency
    throw new Error(`Error updating complaint status: ${complaintUpdateError.message}`);
  }

  // 3. Handle 'Not Completed' or 'Tenant Not Available' by creating a duplicate complaint
  if (complaintStatusUpdate === 'Not Completed' || complaintStatusUpdate === 'Tenant Not Available') {
    const { data: originalComplaint, error: fetchError } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', job.complaint_id)
      .single();

    if (fetchError || !originalComplaint) {
      console.error('Error fetching original complaint for duplication:', fetchError);
      throw new Error('Could not fetch original complaint for duplication.');
    }
    
    // Mark original as duplicate generated
    const { error: markDuplicateError } = await supabase
      .from('complaints')
      .update({ duplicate_generated: true })
      .eq('id', job.complaint_id);

    if (markDuplicateError) {
        console.error('Error marking original complaint as duplicate_generated:', markDuplicateError);
        // Continue, but log this issue
    }

    const duplicatedComplaintData: Omit<Complaint, 'id' | 'jobs' | 'created_at'> = {
      date_registered: new Date().toISOString().split('T')[0],
      bldg_name: originalComplaint.bldg_name,
      flat_no: originalComplaint.flat_no,
      mobile_no: originalComplaint.mobile_no,
      preferred_time: originalComplaint.preferred_time,
      category: originalComplaint.category,
      description: `(Duplicated from complaint ID ${originalComplaint.id}) ${originalComplaint.description} - Reason: ${reasonIfNotCompleted || 'Status requires follow-up'}`,
      status: 'Pending' as ComplaintStatus,
      duplicate_generated: false,
      tenant_id: originalComplaint.tenant_id,
    };

    const { error: duplicateError } = await supabase
      .from('complaints')
      .insert([duplicatedComplaintData]);

    if (duplicateError) {
      console.error('Error creating duplicated complaint:', duplicateError);
      throw new Error(`Error creating duplicated complaint: ${duplicateError.message}`);
    }
  }
  
  return {
    ...createdJob,
    date_attended: createdJob.date_attended ? new Date(createdJob.date_attended).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  } as Job;
}

export async function setJobApproved(jobId: string, approved: boolean): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({ approved })
    .eq('id', jobId);
  if (error) {
    throw new Error(`Error updating job approval: ${error.message}`);
  }
}

// --- Material Functions ---
export async function getMaterialMasterService(): Promise<MaterialMaster[]> {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('code');
    
    if (error) throw error;
    return data as MaterialMaster[];} catch (error) {
    console.log('Error fetching materials:', error);
    return [];
  }
}

// --- Staff Functions ---
export async function getStaffService(): Promise<Staff[]> {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data as Staff[];
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}
