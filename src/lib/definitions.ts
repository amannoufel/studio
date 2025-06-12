export type ComplaintCategory = "electrical" | "plumbing" | "aircond";
export type ComplaintStatus = "Pending" | "Attended" | "Completed" | "Not Completed" | "Tenant Not Available";
export type UserRole = "tenant" | "admin" | null;

export type BuildingName = "Tower A" | "Tower B" | "Tower C";
export const buildingNames: BuildingName[] = ["Tower A", "Tower B", "Tower C"];

export interface Complaint {
  id: string;
  date_registered: string; // ISO date string
  bldg_name: string;
  flat_no: string;
  mobile_no: string;
  preferred_time: string; // e.g., "8-9", "9-10"
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  duplicate_generated: boolean;
  tenant_id?: string; // Optional: Link to a tenant user
  jobs?: Job[];
}

export interface MaterialUsed {
  code: string;
  name: string;
  qty: number;
}

export interface Job {
  id: string;
  complaint_id: string;
  date_attended: string; // ISO date string
  time_attended: string; // HH:mm
  staff_attended: string[]; // Array of names or IDs
  job_card_no: string;
  materials_used: MaterialUsed[];
  time_completed?: string | null; // HH:mm
  reason_not_completed?: string | null;
}

export interface MaterialMaster {
  code: string;
  name: string;
}

export interface Tenant {
  id: string;
  mobile_no: string;
  building_name: BuildingName;
  room_no: string;
  password_hash: string; // In a real app, this would be a securely hashed password
}


export const complaintCategories: ComplaintCategory[] = ["electrical", "plumbing", "aircond"];
export const complaintStatuses: ComplaintStatus[] = ["Pending", "Attended", "Completed", "Not Completed", "Tenant Not Available"];
export const preferredTimeSlots: string[] = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00"
];
