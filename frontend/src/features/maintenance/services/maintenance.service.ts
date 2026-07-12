import { api } from "@/lib/axios";

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  asset: {
    id: string;
    assetTag: string;
    name: string;
    status: string;
  };
  raisedById: string;
  raisedBy: {
    id: string;
    name: string;
    email: string;
  };
  issue: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  photoUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
  technicianId: string | null;
  technician?: {
    id: string;
    name: string;
    email: string;
  } | null;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const maintenanceService = {
  /**
   * Fetch all maintenance requests with optional filtering
   */
  async getRequests(filters?: {
    status?: string;
    priority?: string;
    assetId?: string;
  }): Promise<MaintenanceResponse<MaintenanceRequest[]>> {
    const res = await api.get<MaintenanceResponse<MaintenanceRequest[]>>("/maintenance", {
      params: filters,
    });
    return res.data;
  },

  /**
   * Raise a new maintenance request
   */
  async raiseRequest(data: {
    assetId: string;
    issue: string;
    priority: string;
    photoUrl?: string;
  }): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.post<MaintenanceResponse<MaintenanceRequest>>("/maintenance", data);
    return res.data;
  },

  /**
   * Approve a maintenance request (Admin/Manager only)
   */
  async approveRequest(id: string): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.patch<MaintenanceResponse<MaintenanceRequest>>(`/maintenance/${id}/approve`);
    return res.data;
  },

  /**
   * Reject a maintenance request (Admin/Manager only)
   */
  async rejectRequest(id: string, notes: string): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.patch<MaintenanceResponse<MaintenanceRequest>>(`/maintenance/${id}/reject`, { notes });
    return res.data;
  },

  /**
   * Assign a technician to an approved request (Admin/Manager only)
   */
  async assignTechnician(id: string, technicianId: string): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.patch<MaintenanceResponse<MaintenanceRequest>>(`/maintenance/${id}/assign-technician`, {
      technicianId,
    });
    return res.data;
  },

  /**
   * Start work on a request (Assigned Technician, Admin, or Manager only)
   */
  async startWork(id: string): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.patch<MaintenanceResponse<MaintenanceRequest>>(`/maintenance/${id}/start-work`);
    return res.data;
  },

  /**
   * Resolve a request with comments (Assigned Technician, Admin, or Manager only)
   */
  async resolveRequest(id: string, notes: string): Promise<MaintenanceResponse<MaintenanceRequest>> {
    const res = await api.patch<MaintenanceResponse<MaintenanceRequest>>(`/maintenance/${id}/resolve`, { notes });
    return res.data;
  },
};
