import { apiClient } from '@/src/api/client';
import {
  AuthResponse,
  EmergencyReport,
  NotificationItem,
  RescueTask,
  Resource,
  ResourceDistribution,
  Shelter,
} from '@/src/types/api';

export const authService = {
  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', payload),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    address?: string;
    phone_number?: string;
    role_id?: number;
  }) => apiClient.post<AuthResponse>('/auth/register', payload),
  profile: () => apiClient.get<{ user: AuthResponse['user'] }>('/auth/profile'),
};

// ✅ FIXED: emergencyService now includes createReport()
export const emergencyService = {
  createReport: (payload: {
    disaster_type: string;
    location_desc: string;
    latitude?: number;
    longitude?: number;
  }) => apiClient.post('/emergencies', payload),

  listMine: () => apiClient.get<{ reports: EmergencyReport[] }>('/emergencies/my-reports'),
  listAll: () => apiClient.get<{ reports: EmergencyReport[] }>('/emergencies'),
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/emergencies/${id}/status`, { status }),
  analytics: () => apiClient.get('/emergencies/analytics'),
};

export const shelterService = {
  list: () => apiClient.get<{ shelters: Shelter[] }>('/shelters'),
  available: () => apiClient.get<{ shelters: Shelter[] }>('/shelters/available'),
  create: (payload: {
    shelter_name: string;
    managed_by?: string;
    capacity: number;
    street_no?: string;
    street_name?: string;
    shelter_contact?: string;
  }) => apiClient.post('/shelters', payload),
  updateOccupancy: (shelterId: number, current_occupancy: number) =>
    apiClient.patch(`/shelters/${shelterId}/occupancy`, { current_occupancy }),
  occupancyAnalytics: () => apiClient.get('/shelters/analytics/occupancy'),
};

export const resourceService = {
  list: () => apiClient.get<{ resources: Resource[] }>('/resources'),
  listAvailable: () => apiClient.get<{ resources: Resource[] }>('/resources/available'),
  create: (payload: {
    resource_type: string;
    resource_quantity: number;
    resource_desc?: string;
    resource_expiry_date?: string;
    distribution_location_address?: string;
  }) => apiClient.post('/resources', payload),
  update: (
    resourceId: number,
    payload: Partial<Pick<Resource, 'resource_type' | 'resource_desc' | 'resource_quantity'>> & {
      resource_availability_status?: string;
    }
  ) => apiClient.patch(`/resources/${resourceId}`, payload),
  distributions: () =>
    apiClient.get<{ distributions: ResourceDistribution[] }>('/resources/distributions'),
  createDistribution: (payload: {
    resource_id: number;
    shelter_id: number;
    quantity_distributed: number;
    assigned_to?: number;
    remarks?: string;
  }) => apiClient.post('/resources/distribute', payload),
  updateDistributionStatus: (
    distributionId: number,
    payload: {
      status: string;
      dispatched_at?: string;
      delivered_at?: string;
    }
  ) => apiClient.patch(`/resources/distributions/${distributionId}`, payload),
};

export const taskService = {
  listMine: () => apiClient.get<{ tasks: RescueTask[] }>('/tasks/my-tasks'),
  listAll: () => apiClient.get<{ tasks: RescueTask[] }>('/tasks'),
  create: (payload: {
    report_id: number;
    task_description: string;
    assigned_worker_id?: number;
    remarks?: string;
  }) => apiClient.post('/tasks', payload),
  assign: (taskId: number, assigned_worker_id: number) =>
    apiClient.patch(`/tasks/${taskId}/assign`, { assigned_worker_id }),
  updateStatus: (taskId: number, task_status: string, remarks?: string) =>
    apiClient.patch(`/tasks/${taskId}/status`, { task_status, remarks }),
};

export const notificationService = {
  active: () => apiClient.get<{ notifications: NotificationItem[] }>('/notifications/active'),
  all: () => apiClient.get<{ notifications: NotificationItem[] }>('/notifications'),
  create: (payload: { title: string; message: string }) =>
    apiClient.post('/notifications', payload),
  update: (
    notificationId: number,
    payload: { title?: string; message?: string; is_active?: boolean }
  ) => apiClient.patch(`/notifications/${notificationId}`, payload),
  remove: (notificationId: number) => apiClient.delete(`/notifications/${notificationId}`),
};

