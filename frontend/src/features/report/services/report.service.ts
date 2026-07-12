import { api } from "@/lib/axios";

export interface UtilizationItem {
  departmentId: string;
  departmentName: string;
  totalAssets: number;
  allocatedAssets: number;
  utilizationRate: number;
}

export interface MaintenanceFrequencyItem {
  month: string;
  count: number;
}

export interface IdleAssetItem {
  id: string;
  assetTag: string;
  name: string;
  condition: string;
  location: string;
  status: string;
  updatedAt: string;
  department?: {
    name: string;
  } | null;
  category?: {
    name: string;
  };
}

export interface HeatmapItem {
  day: number;
  hour: number;
  count: number;
}

export interface DepartmentSummaryItem {
  departmentId: string;
  departmentName: string;
  totalAssets: number;
  totalValue: number;
  employeesCount: number;
  pendingRepairs: number;
}

export interface DueMaintenanceItem {
  id: string;
  assetTag: string;
  name: string;
  condition: string;
  location: string;
  status: string;
  updatedAt: string;
  department?: {
    name: string;
  } | null;
  category?: {
    name: string;
  };
}

export interface ReportResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const reportService = {
  /**
   * Fetch asset utilization rates per department
   */
  async getUtilization(): Promise<ReportResponse<UtilizationItem[]>> {
    const res = await api.get<ReportResponse<UtilizationItem[]>>("/reports/utilization");
    return res.data;
  },

  /**
   * Fetch maintenance repair tickets frequency
   */
  async getMaintenanceFrequency(): Promise<ReportResponse<MaintenanceFrequencyItem[]>> {
    const res = await api.get<ReportResponse<MaintenanceFrequencyItem[]>>("/reports/maintenance-frequency");
    return res.data;
  },

  /**
   * Fetch list of idle assets
   */
  async getIdleAssets(): Promise<ReportResponse<IdleAssetItem[]>> {
    const res = await api.get<ReportResponse<IdleAssetItem[]>>("/reports/idle-assets");
    return res.data;
  },

  /**
   * Fetch resource booking heatmap frequencies
   */
  async getBookingHeatmap(): Promise<ReportResponse<HeatmapItem[]>> {
    const res = await api.get<ReportResponse<HeatmapItem[]>>("/reports/booking-heatmap");
    return res.data;
  },

  /**
   * Fetch department summary details
   */
  async getDepartmentSummary(): Promise<ReportResponse<DepartmentSummaryItem[]>> {
    const res = await api.get<ReportResponse<DepartmentSummaryItem[]>>("/reports/department-summary");
    return res.data;
  },

  /**
   * Fetch list of assets due for repairs
   */
  async getDueMaintenance(): Promise<ReportResponse<DueMaintenanceItem[]>> {
    const res = await api.get<ReportResponse<DueMaintenanceItem[]>>("/reports/due-maintenance");
    return res.data;
  },

  /**
   * Authenticated CSV export downloader
   */
  async downloadCSV(): Promise<string> {
    const res = await api.get<string>("/reports/export", { responseType: "text" });
    return res.data;
  },
};
export default reportService;
