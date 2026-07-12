"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { reportService } from "@/features/report/services/report.service";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  DollarSign,
  Percent,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Wrench,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ReportsDashboard() {
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: utilizationRes, isLoading: loadingUtil } = useQuery({
    queryKey: ["report-utilization"],
    queryFn: () => reportService.getUtilization(),
  });

  const { data: frequencyRes, isLoading: loadingFreq } = useQuery({
    queryKey: ["report-frequency"],
    queryFn: () => reportService.getMaintenanceFrequency(),
  });

  const { data: idleRes, isLoading: loadingIdle } = useQuery({
    queryKey: ["report-idle-assets"],
    queryFn: () => reportService.getIdleAssets(),
  });

  const { data: heatmapRes, isLoading: loadingHeatmap } = useQuery({
    queryKey: ["report-booking-heatmap"],
    queryFn: () => reportService.getBookingHeatmap(),
  });

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ["report-summary"],
    queryFn: () => reportService.getDepartmentSummary(),
  });

  const { data: dueRes, isLoading: loadingDue } = useQuery({
    queryKey: ["report-due-maintenance"],
    queryFn: () => reportService.getDueMaintenance(),
  });

  const utilizationData = utilizationRes?.data || [];
  const frequencyData = frequencyRes?.data || [];
  const idleAssets = idleRes?.data || [];
  const heatmapData = heatmapRes?.data || [];
  const summaryData = summaryRes?.data || [];
  const dueMaintenance = dueRes?.data || [];

  // Computed KPIs
  const totalValue = summaryData.reduce((sum, item) => sum + item.totalValue, 0);
  const avgUtilization =
    utilizationData.length > 0
      ? Math.round(utilizationData.reduce((sum, item) => sum + item.utilizationRate, 0) / utilizationData.length)
      : 0;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const csvData = await reportService.downloadCSV();
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "department-assets-summary.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report downloaded successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  // Find max count in heatmap for color scaling
  const maxBookingCount = Math.max(...heatmapData.map((h) => h.count), 1);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900/60";
    const opacity = Math.min(Math.max(count / maxBookingCount, 0.15), 1);
    // Render shades of emerald
    if (opacity < 0.3) return "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/10";
    if (opacity < 0.6) return "bg-emerald-500/50 text-white border border-emerald-500/20";
    return "bg-emerald-600 text-white font-bold border border-emerald-700/30";
  };

  const isLoading =
    loadingUtil || loadingFreq || loadingIdle || loadingHeatmap || loadingSummary || loadingDue;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="table" rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoadingSkeleton type="card" rows={3} />
          <LoadingSkeleton type="card" rows={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Analytics & Reports
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time business intelligence across asset utilization, maintenance requests, and resources booking.
          </p>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-100">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Inventory Value</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-100">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Average Utilization</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{avgUtilization}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-100">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Overdue Repairs</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{dueMaintenance.length} assets</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-100">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Idle Assets (&gt;60 Days)</p>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{idleAssets.length} assets</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Charts & Booking Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Utilization Bar Chart */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
                <Layers className="h-4 w-4 text-zinc-400" />
                Asset Utilization Rate by Department
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="departmentName" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} unit="%" />
                    <RechartsTooltip cursor={{ fill: "#f4f4f5" }} />
                    <Bar dataKey="utilizationRate" fill="#18181b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Ticket Line Chart */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
                <Wrench className="h-4 w-4 text-zinc-400" />
                Monthly Repair Request Volume (Frequencies)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={frequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="month" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Heatmap Calendar Grid */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-100">
                <Calendar className="h-4 w-4 text-zinc-400" />
                Resource Booking Heatmap (Weekly Schedule)
              </CardTitle>
              <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-zinc-400">
                <span>Fewer</span>
                <span className="h-2.5 w-2.5 bg-zinc-50 dark:bg-zinc-900 border rounded" />
                <span className="h-2.5 w-2.5 bg-emerald-500/20 rounded" />
                <span className="h-2.5 w-2.5 bg-emerald-500/50 rounded" />
                <span className="h-2.5 w-2.5 bg-emerald-600 rounded" />
                <span>More Bookings</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 overflow-x-auto">
              <div className="min-w-[650px] space-y-1.5">
                {/* Hours Header Row */}
                <div className="flex">
                  <div className="w-12 shrink-0" />
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 text-[9px] text-center text-zinc-400 font-bold">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <span key={h}>{String(h).padStart(2, "0")}</span>
                    ))}
                  </div>
                </div>

                {/* Day Rows */}
                {DAYS_OF_WEEK.map((dayName, d) => (
                  <div key={dayName} className="flex items-center">
                    {/* Day label */}
                    <div className="w-12 shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {dayName}
                    </div>
                    {/* Hours block grid */}
                    <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
                      {Array.from({ length: 24 }).map((_, h) => {
                        const cell = heatmapData.find((x) => x.day === d && x.hour === h) || { count: 0 };
                        return (
                          <div
                            key={h}
                            className={`h-5 rounded flex items-center justify-center text-[8px] transition-all hover:scale-105 ${getHeatmapColor(
                              cell.count
                            )}`}
                            title={`${dayName} at ${h}:00 - ${cell.count} Bookings`}
                          >
                            {cell.count > 0 && cell.count}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Idle & Due Lists */}
        <div className="space-y-6">
          {/* Idle Assets List */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-zinc-850 dark:text-zinc-150">
                <Clock className="h-4 w-4 text-zinc-400" />
                Idle Assets Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {idleAssets.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-4">No idle assets in this cycle</p>
                ) : (
                  idleAssets.map((asset) => {
                    const days = Math.round(
                      (new Date().getTime() - new Date(asset.updatedAt).getTime()) / (1000 * 3600 * 24)
                    );
                    return (
                      <div
                        key={asset.id}
                        className="p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl flex flex-col space-y-1.5 bg-zinc-50/20 dark:bg-zinc-950"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold text-zinc-450 uppercase">{asset.assetTag}</span>
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">
                            Idle {days} days
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{asset.name}</h4>
                        <p className="text-[10px] text-zinc-400">
                          {asset.category?.name} • {asset.department?.name || "Shared"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Due Maintenance List */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-455">
                <AlertTriangle className="h-4 w-4" />
                Overdue Maintenance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {dueMaintenance.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-4">All equipment is nominal!</p>
                ) : (
                  dueMaintenance.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 border border-rose-100 dark:border-rose-950/40 rounded-xl flex flex-col space-y-1.5 bg-rose-50/5"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-rose-900 dark:text-rose-450 uppercase">
                          {asset.assetTag}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-250/20">
                          {asset.condition} Condition
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{asset.name}</h4>
                      <p className="text-[10px] text-zinc-400">
                        {asset.category?.name} • {asset.department?.name || "Shared"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
