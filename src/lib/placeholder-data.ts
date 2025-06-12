import type { Complaint, Job, MaterialMaster, ComplaintStatus, ComplaintCategory, Tenant, BuildingName } from './definitions';

export const materialsMaster: MaterialMaster[] = [
  { code: "MAT001", name: "Wire 2.5mm (meter)" },
  { code: "MAT002", name: "Switch - 1 Gang" },
  { code: "MAT003", name: "PVC Pipe 1/2in (meter)" },
  { code: "MAT004", name: "Faucet Tap" },
  { code: "MAT005", name: "AC Gas R32 (kg)" },
  { code: "MAT006", name: "Circuit Breaker 10A" },
];

let complaintIdCounter = 1;
let jobIdCounter = 1;
let tenantIdCounter = 1;

export let tenantsData: Tenant[] = [];

export const complaintsData: Complaint[] = [
  {
    id: `C${complaintIdCounter++}`,
    date_registered: "2024-07-20",
    bldg_name: "Tower A",
    flat_no: "101",
    mobile_no: "555-0101",
    preferred_time: "10:00 - 11:00",
    category: "electrical",
    description: "Main light in living room not working.",
    status: "Pending",
    duplicate_generated: false,
    tenant_id: "tenant1", // This would ideally map to a Tenant.id
  },
  {
    id: `C${complaintIdCounter++}`,
    date_registered: "2024-07-21",
    bldg_name: "Tower B",
    flat_no: "205",
    mobile_no: "555-0205",
    preferred_time: "14:00 - 15:00",
    category: "plumbing",
    description: "Kitchen sink is leaking.",
    status: "Attended",
    duplicate_generated: false,
    tenant_id: "tenant2",
  },
  {
    id: `C${complaintIdCounter++}`,
    date_registered: "2024-07-22",
    bldg_name: "Tower A",
    flat_no: "303",
    mobile_no: "555-0303",
    preferred_time: "09:00 - 10:00",
    category: "aircond",
    description: "AC not cooling properly.",
    status: "Completed",
    duplicate_generated: false,
    tenant_id: "tenant1",
  },
];

export const jobsData: Job[] = [
  {
    id: `J${jobIdCounter++}`,
    complaint_id: "C2", // Corresponds to Tower B, 205 plumbing issue
    date_attended: "2024-07-22",
    time_attended: "14:30",
    staff_attended: ["John Doe", "Jane Smith"],
    job_card_no: "JC001",
    materials_used: [
      { code: "MAT003", name: "PVC Pipe 1/2in (meter)", qty: 1 },
      { code: "MAT004", name: "Faucet Tap", qty: 1 },
    ],
    time_completed: "15:30",
    reason_not_completed: null,
  },
  {
    id: `J${jobIdCounter++}`,
    complaint_id: "C3", // Corresponds to Tower A, 303 AC issue
    date_attended: "2024-07-22",
    time_attended: "10:00",
    staff_attended: ["Mike Brown"],
    job_card_no: "JC002",
    materials_used: [
      { code: "MAT005", name: "AC Gas R32 (kg)", qty: 0.5 },
    ],
    time_completed: "10:45",
    reason_not_completed: null,
  },
];

// Tenant Data Functions
export const addTenant = async (tenantData: Omit<Tenant, 'id' | 'password_hash'> & { password_raw: string }): Promise<Tenant> => {
  const newTenant: Tenant = {
    id: `T${tenantIdCounter++}`,
    mobile_no: tenantData.mobile_no,
    building_name: tenantData.building_name,
    room_no: tenantData.room_no,
    // IMPORTANT: In a real app, hash the password securely.
    // Storing raw password (even named password_hash) is a major security risk.
    password_hash: tenantData.password_raw,
  };
  tenantsData.push(newTenant);
  return newTenant;
};

export const getTenantByMobileAndPassword = async (mobile_no: string, password_raw: string): Promise<Tenant | undefined> => {
  // IMPORTANT: In a real app, compare hashed passwords. This is insecure.
  return tenantsData.find(t => t.mobile_no === mobile_no && t.password_hash === password_raw);
};


// Complaint and Job Functions
export const getComplaints = async (): Promise<Complaint[]> => {
  return complaintsData.map(c => ({
    ...c,
    jobs: jobsData.filter(j => j.complaint_id === c.id)
  }));
};

export const getComplaintById = async (id: string): Promise<Complaint | undefined> => {
  const complaint = complaintsData.find(c => c.id === id);
  if (complaint) {
    return {
      ...complaint,
      jobs: jobsData.filter(j => j.complaint_id === id)
    };
  }
  return undefined;
};

export const addComplaint = async (complaint: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status' | 'date_registered'> & {tenant_id?: string}): Promise<Complaint> => {
  const newComplaint: Complaint = {
    ...complaint,
    id: `C${complaintIdCounter++}`,
    status: "Pending",
    duplicate_generated: false,
    date_registered: new Date().toISOString().split('T')[0], // Set current date
    // tenant_id: complaint.tenant_id, // Ensure tenant_id is passed through
  };
  complaintsData.push(newComplaint);
  return newComplaint;
};

export const addJob = async (job: Omit<Job, 'id'>, complaintStatusUpdate: ComplaintStatus, reasonIfNotCompleted?: string): Promise<Job> => {
  const newJob: Job = {
    ...job,
    id: `J${jobIdCounter++}`,
  };
  jobsData.push(newJob);

  const complaintIndex = complaintsData.findIndex(c => c.id === job.complaint_id);
  if (complaintIndex !== -1) {
    complaintsData[complaintIndex].status = complaintStatusUpdate;
    if (complaintStatusUpdate === "Not Completed" || complaintStatusUpdate === "Tenant Not Available") {
      complaintsData[complaintIndex].duplicate_generated = true;
      // Simulate duplication
      const originalComplaint = complaintsData[complaintIndex];
      const duplicatedComplaint: Complaint = {
        id: `C${complaintIdCounter++}`,
        date_registered: new Date().toISOString().split('T')[0],
        bldg_name: originalComplaint.bldg_name,
        flat_no: originalComplaint.flat_no,
        mobile_no: originalComplaint.mobile_no,
        preferred_time: originalComplaint.preferred_time,
        category: originalComplaint.category,
        description: `(Duplicated) ${originalComplaint.description}`,
        status: "Pending",
        duplicate_generated: false,
        tenant_id: originalComplaint.tenant_id,
      };
      complaintsData.push(duplicatedComplaint);
    }
  }
  return newJob;
};

export const getMaterialsMaster = async (): Promise<MaterialMaster[]> => {
  return materialsMaster;
};
