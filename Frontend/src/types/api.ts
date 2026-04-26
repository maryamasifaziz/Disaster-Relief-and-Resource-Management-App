export type UserRole = 'Citizen' | 'Rescue Worker' | 'NGO' | 'Government';

export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  address?: string | null;
  phone_number?: string | null;
  roles: UserRole[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface EmergencyReport {
  report_id: number;
  user_id: number;
  disaster_type: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled';
  date_time: string;
  location_desc: string;
  latitude?: number | null;
  longitude?: number | null;
  reporter_name?: string;
  reporter_email?: string;
}

export interface Shelter {
  shelter_id: number;
  shelter_name: string;
  managed_by?: string | null;
  capacity: number;
  current_occupancy: number;
  is_active: 0 | 1;
  street_no?: string | null;
  street_name?: string | null;
  shelter_contact?: string | null;
  last_updated?: string;
}

export interface Resource {
  resource_id: number;
  resource_type: string;
  resource_quantity: number;
  resource_desc?: string | null;
  resource_expiry_date?: string | null;
  resource_availability_status: string;
  distribution_location_address?: string | null;
  ngo_id?: number | null;
  ngo_name?: string | null;
  last_updated?: string;
}

export interface ResourceDistribution {
  distribution_id: number;
  resource_id: number;
  shelter_id: number;
  quantity_distributed: number;
  date_distributed: string;
  requested_at?: string;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  status: string;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  remarks?: string | null;
  resource_type?: string;
  shelter_name?: string;
}

export interface RescueTask {
  task_id: number;
  report_id: number;
  task_description: string;
  assigned_worker_id?: number | null;
  assigned_worker_name?: string | null;
  task_status: 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
  assigned_date?: string;
  last_updated?: string;
  remarks?: string | null;
  disaster_type?: string;
  location_desc?: string;
  latitude?: number | null;
  longitude?: number | null;
  reporter_name?: string;
  reporter_phone?: string | null;
  report_status?: string;
}

export interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  datetime_sent: string;
  is_active: 0 | 1;
  created_by?: number;
  created_by_name?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

