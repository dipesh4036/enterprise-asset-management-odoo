import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => dashboardService.getKPIs(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useDashboardRecentActivity() {
  return useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: () => dashboardService.getRecentActivity(),
  });
}

export function useDashboardOverdueReturns() {
  return useQuery({
    queryKey: ["dashboard-overdue"],
    queryFn: () => dashboardService.getOverdueReturns(),
  });
}
