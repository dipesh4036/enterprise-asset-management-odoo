import { api } from "@/lib/axios";

export type AssetCondition = "Good" | "Fair" | "Poor";
export type AssetStatus = "AVAILABLE" | "ALLOCATED" | "RESERVED" | "UNDER_MAINTENANCE" | "LOST" | "RETIRED" | "DISPOSED";

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    customFields: any;
  };
  serialNumber: string | null;
  acquisitionDate: string | null;
  acquisitionCost: number | null;
  condition: AssetCondition;
  location: string;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  status: AssetStatus;
  isBookable: boolean;
  photoUrl: string | null;
  documentUrl: string | null;
  customFields: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetListResponse {
  success: boolean;
  message: string;
  data: {
    assets: Asset[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleAssetResponse {
  success: boolean;
  message: string;
  data: Asset;
}

export interface HistoryItem {
  id: string;
  assetId: string;
  action: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  notes?: string | null;
}

export interface AllocationHistoryResponse {
  success: boolean;
  message: string;
  data: any[]; // List of allocations
}

export interface MaintenanceHistoryResponse {
  success: boolean;
  message: string;
  data: any[]; // List of maintenance requests
}

export interface CreateAssetInput {
  name: string;
  categoryId: string;
  serialNumber?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | null;
  condition: AssetCondition;
  location: string;
  departmentId?: string | null;
  isBookable?: boolean;
  photoUrl?: string | null;
  documentUrl?: string | null;
  customFields?: Record<string, any> | null;
}

export interface UpdateAssetInput extends Partial<CreateAssetInput> {
  status?: AssetStatus;
}

export const assetService = {
  async getAssets(params?: {
    search?: string;
    categoryId?: string;
    status?: AssetStatus;
    departmentId?: string;
    location?: string;
    isBookable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AssetListResponse> {
    const res = await api.get<AssetListResponse>("/assets", { params });
    return res.data;
  },

  async getAssetById(id: string): Promise<SingleAssetResponse> {
    const res = await api.get<SingleAssetResponse>(`/assets/${id}`);
    return res.data;
  },

  async createAsset(data: CreateAssetInput): Promise<SingleAssetResponse> {
    const res = await api.post<SingleAssetResponse>("/assets", data);
    return res.data;
  },

  async updateAsset(id: string, data: UpdateAssetInput): Promise<SingleAssetResponse> {
    const res = await api.put<SingleAssetResponse>(`/assets/${id}`, data);
    return res.data;
  },

  async getAllocationHistory(id: string): Promise<AllocationHistoryResponse> {
    const res = await api.get<AllocationHistoryResponse>(`/assets/${id}/allocation-history`);
    return res.data;
  },

  async getMaintenanceHistory(id: string): Promise<MaintenanceHistoryResponse> {
    const res = await api.get<MaintenanceHistoryResponse>(`/assets/${id}/maintenance-history`);
    return res.data;
  },
};
