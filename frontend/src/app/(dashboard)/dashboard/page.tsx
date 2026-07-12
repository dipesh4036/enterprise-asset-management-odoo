"use client";

import { useAuthStore } from "@/store/auth.store";
import {
  useDashboardKPIs,
  useDashboardRecentActivity,
  useDashboardOverdueReturns,
} from "@/features/dashboard/hooks/useDashboard";
import KPICard from "@/features/dashboard/components/KPICard";
import OverdueAlert from "@/features/dashboard/components/OverdueAlert";
import QuickActions from "@/features/dashboard/components/QuickActions";
import RecentActivity from "@/features/dashboard/components/RecentActivity";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import {
  Laptop,
  CheckCircle,
  Wrench,
  Calendar,
  RefreshCw,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: kpiResponse, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: activityResponse, isLoading: activityLoading } = useDashboardRecentActivity();
  const { data: overdueResponse, isLoading: overdueLoading } = useDashboardOverdueReturns();

  const kpis = kpiResponse?.data;
  const activities = activityResponse?.data || [];
  const overdueItems = overdueResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Welcome header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-zinc-550" />
            Dashboard
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, {user?.name || "User"}. Here is an overview of your assets and schedule.
          </p>
        </div>
      </div>

      {/* Top Warning banner for overdue returns */}
      <OverdueAlert items={overdueItems} isLoading={overdueLoading} />

      {/* Grid of KPI Stats Cards */}
      {kpisLoading ? (
        <LoadingSkeleton type="card" rows={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          <KPICard
            label="Available Assets"
            value={kpis?.available ?? 0}
            icon={Laptop}
            color="blue"
            description="Ready in inventory"
            allowedRoles={["ADMIN", "ASSET_MANAGER"]}
          />
          <KPICard
            label="Allocated Assets"
            value={kpis?.allocated ?? 0}
            icon={CheckCircle}
            color="emerald"
            description="In use by employees"
            allowedRoles={["ADMIN", "ASSET_MANAGER"]}
          />
          <KPICard
            label="Under Maintenance"
            value={kpis?.maintenance ?? 0}
            icon={Wrench}
            color="amber"
            description="Repair status today"
            allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}
          />
          <KPICard
            label="Active Bookings"
            value={kpis?.bookings ?? 0}
            icon={Calendar}
            color="indigo"
            description="Scheduled meetings & devices"
          />
          <KPICard
            label="Pending Transfers"
            value={kpis?.transfers ?? 0}
            icon={RefreshCw}
            color="zinc"
            description="Awaiting verification"
            allowedRoles={["ADMIN", "ASSET_MANAGER"]}
          />
          <KPICard
            label="Overdue Returns"
            value={kpis?.overdue ?? 0}
            icon={AlertTriangle}
            color="rose"
            description="Returns past due date"
            allowedRoles={["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"]}
          />
        </div>
      )}

      {/* Quick actions panel */}
      <QuickActions />

      {/* Two-column layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} isLoading={activityLoading} />
        </div>
        <div className="space-y-6">
          {/* Custom Side Card layout panel details */}
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/20 backdrop-blur-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Portal Guidelines</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              As an authorized system user, please ensure that all bookings are recorded at least 24 hours in advance. Report any device damage immediately using the Quick Action report.
            </p>
            <div className="pt-2 text-xs font-semibold text-zinc-650 dark:text-zinc-300">
              Need Help? Contact system admin support at support@company.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
