import type { Complaint, Job, MaterialMaster, ComplaintStatus, ComplaintCategory } from './definitions';

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
    tenant_id: "tenant1",
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

// Functions to interact with placeholder data (simulating API/DB)
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

export const addComplaint = async (complaint: Omit<Complaint, 'id' | 'jobs' | 'duplicate_generated' | 'status'>): Promise<Complaint> => {
  const newComplaint: Complaint = {
    ...complaint,
    id: `C${complaintIdCounter++}`,
    status: "Pending",
    duplicate_generated: false,
    date_registered: new Date().toISOString().split('T')[0], // Set current date
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
