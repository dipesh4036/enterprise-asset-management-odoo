import { api } from "@/lib/axios";
import { ActivityItem } from "../components/RecentActivity";
import { OverdueItem } from "../components/OverdueAlert";

export interface KPIData {
  available: number;
  allocated: number;
  maintenance: number;
  bookings: number;
  transfers: number;
  upcoming: number;
  overdue: number;
}

export interface DashboardDataResponse {
  success: boolean;
  message: string;
  data: KPIData;
}

export interface RecentActivityResponse {
  success: boolean;
  message: string;
  data: ActivityItem[];
}

export interface OverdueResponse {
  success: boolean;
  message: string;
  data: OverdueItem[];
}

export const dashboardService = {
  async getKPIs(): Promise<DashboardDataResponse> {
    const res = await api.get<DashboardDataResponse>("/dashboard/kpis");
    return res.data;
  },

  async getRecentActivity(): Promise<RecentActivityResponse> {
    const res = await api.get<RecentActivityResponse>("/dashboard/recent-activity");
    return res.data;
  },

  async getOverdueReturns(): Promise<OverdueResponse> {
    const res = await api.get<OverdueResponse>("/allocations/overdue");
    return res.data;
  },
};
