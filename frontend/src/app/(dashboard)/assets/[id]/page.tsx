"use client";

import { useState, use } from "react";
import { useAsset, useAssetAllocationHistory, useAssetMaintenanceHistory } from "@/features/assets/hooks/useAssets";
import { AssetAllocation, AssetMaintenance } from "@/features/assets/services/asset.service";
import { useAuthStore } from "@/store/auth.store";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import {
  Laptop,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  FileText,
  Clock,
  Wrench,
  User,
  Shield,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"allocation" | "maintenance">("allocation");

  // Fetch asset details and history
  const { data: assetResponse, isLoading: assetLoading } = useAsset(id);
  const { data: allocResponse, isLoading: allocLoading } = useAssetAllocationHistory(id);
  const { data: maintResponse, isLoading: maintLoading } = useAssetMaintenanceHistory(id);

  const asset = assetResponse?.data;
  const allocations = allocResponse?.data || [];
  const maintenanceRequests = maintResponse?.data || [];

  if (assetLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-zinc-150 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-[400px] bg-zinc-150 dark:bg-zinc-800 rounded-xl" />
          <div className="lg:col-span-2 h-[400px] bg-zinc-150 dark:bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
        <Laptop className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Asset Not Found</h2>
        <p className="text-sm text-zinc-500 max-w-sm">
          The requested asset could not be located in the corporate registry.
        </p>
        <Link href="/assets">
          <Button variant="outline" size="sm">
            Back to Registry
          </Button>
        </Link>
      </div>
    );
  }

  // Parse dynamic custom fields
  const customFields = asset.customFields ? Object.entries(asset.customFields) : [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/assets" className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 gap-1.5 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Asset Registry
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Asset Particulars */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm space-y-5">
            {/* Photo preview */}
            {asset.photoUrl ? (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-250 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={asset.photoUrl}
                  alt={asset.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg border border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Laptop className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-450 dark:text-zinc-550">
                  No Asset Photo Uploaded
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-bold text-xs uppercase tracking-wide px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200">
                  {asset.assetTag}
                </span>
                <StatusBadge status={asset.status} />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                {asset.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Category: <span className="font-semibold text-zinc-850 dark:text-zinc-300">{asset.category?.name || "Uncategorized"}</span>
              </p>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 space-y-3.5">
              {/* Serial number */}
              <div className="flex justify-between items-start text-xs">
                <span className="text-zinc-500 font-medium">Serial Number</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-250 break-all text-right max-w-[150px]">
                  {asset.serialNumber || <span className="text-zinc-400 font-normal">N/A</span>}
                </span>
              </div>

              {/* Location */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-450" />
                  Location
                </span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-250">
                  {asset.location}
                </span>
              </div>

              {/* Condition */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Condition</span>
                <span className={cn(
                  "font-bold",
                  asset.condition === "Good" && "text-emerald-600 dark:text-emerald-400",
                  asset.condition === "Fair" && "text-amber-600 dark:text-amber-400",
                  asset.condition === "Poor" && "text-rose-600 dark:text-rose-400"
                )}>
                  {asset.condition}
                </span>
              </div>

              {/* Department */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-450" />
                  Department
                </span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-250">
                  {asset.department?.name || <span className="text-zinc-400 font-normal">Unassigned</span>}
                </span>
              </div>

              {/* Bookable status */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Resource Booking</span>
                <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                  asset.isBookable
                    ? "bg-indigo-50 text-indigo-750 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/40 dark:text-zinc-500"
                )}>
                  {asset.isBookable ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Document button */}
            {asset.documentUrl && (
              <div className="pt-2">
                <a href={asset.documentUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs">
                    <FileText className="h-4 w-4" />
                    Download Invoice / Document
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Dynamic attributes / Custom Fields Card */}
          {customFields.length > 0 && (
            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Custom Attributes
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map(([key, val]) => (
                  <div key={key} className="space-y-1 p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-850">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-500 block truncate">
                      {key}
                    </span>
                    <span className="text-xs font-bold text-zinc-805 dark:text-zinc-200">
                      {val === true ? "Yes" : val === false ? "No" : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acquisition details */}
          {(asset.acquisitionCost || asset.acquisitionDate) && (
            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Acquisition Data
              </h3>
              <div className="space-y-3 text-xs">
                {asset.acquisitionDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-zinc-450" />
                      Acquisition Date
                    </span>
                    <span className="font-semibold text-zinc-850 dark:text-zinc-250">
                      {formatDate(asset.acquisitionDate)}
                    </span>
                  </div>
                )}
                {asset.acquisitionCost !== null && asset.acquisitionCost !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-zinc-450" />
                      Acquisition Cost
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                      ${Number(asset.acquisitionCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Tabulated History Panels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            {/* Timeline Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-3 bg-zinc-50/50 dark:bg-zinc-900/10">
              <button
                onClick={() => setActiveTab("allocation")}
                className={cn(
                  "pb-3 text-xs uppercase tracking-wider font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer mr-6",
                  activeTab === "allocation"
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
                )}
              >
                <Clock className="h-4 w-4" />
                Allocation History ({allocations.length})
              </button>
              <button
                onClick={() => setActiveTab("maintenance")}
                className={cn(
                  "pb-3 text-xs uppercase tracking-wider font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer",
                  activeTab === "maintenance"
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
                )}
              >
                <Wrench className="h-4 w-4" />
                Maintenance History ({maintenanceRequests.length})
              </button>
            </div>

            <div className="p-6">
              {/* ALLOCATION TIMELINE */}
              {activeTab === "allocation" && (
                allocLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-100/50 dark:bg-zinc-900/30 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : allocations.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No allocation logs found for this asset.
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800 before:h-[calc(100%-8px)]">
                    {allocations.map((alloc: AssetAllocation) => {
                      const isActive = alloc.status === "ALLOCATED" || alloc.status === "OVERDUE";
                      return (
                        <div key={alloc.id} className="flex items-start gap-4 relative">
                          <div className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border shadow-sm z-10 shrink-0",
                            isActive 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400"
                              : "bg-white border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800"
                          )}>
                            <User className="h-3 w-3" />
                          </div>
                          <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-850 p-4 rounded-xl shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                                  {alloc.employee?.name || "Assigned Employee"}
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {alloc.employee?.email}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 self-start sm:self-center">
                                <span className={cn(
                                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                                  alloc.status === "ALLOCATED" && "bg-blue-50 border-blue-100 text-blue-755 dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400",
                                  alloc.status === "RETURNED" && "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-900/30 dark:border-zinc-800 dark:text-zinc-450",
                                  alloc.status === "OVERDUE" && "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-450 animate-pulse"
                                )}>
                                  {alloc.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-850 text-xs text-zinc-505 dark:text-zinc-400">
                              <div>
                                <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">ALLOCATED</span>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">{formatDate(alloc.allocatedAt)}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">
                                  {alloc.returnedAt ? "RETURNED ON" : "EXPECTED RETURN"}
                                </span>
                                <span className={cn(
                                  "font-medium",
                                  !alloc.returnedAt && alloc.status === "OVERDUE" && "text-rose-600 dark:text-rose-400 font-bold",
                                  alloc.returnedAt ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-850 dark:text-zinc-200"
                                )}>
                                  {alloc.returnedAt ? formatDate(alloc.returnedAt) : formatDate(alloc.expectedReturnAt)}
                                </span>
                              </div>
                            </div>

                            {alloc.notes && (
                              <div className="mt-3 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-850">
                                <strong>Log Notes:</strong> {alloc.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* MAINTENANCE HISTORY */}
              {activeTab === "maintenance" && (
                maintLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-100/50 dark:bg-zinc-900/30 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : maintenanceRequests.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No maintenance tickets recorded.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceRequests.map((req: AssetMaintenance) => (
                      <div key={req.id} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl hover:shadow-sm transition-all duration-200 space-y-3 bg-zinc-50/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wide">
                              Ticket ID: {req.id.substring(0, 8)}...
                            </span>
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
                              {req.issue}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                              req.priority === "CRITICAL" && "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50",
                              req.priority === "HIGH" && "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50",
                              req.priority === "MEDIUM" && "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50",
                              req.priority === "LOW" && "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50"
                            )}>
                              {req.priority}
                            </span>
                            <span className={cn(
                              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                              req.status === "RESOLVED" && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450",
                              req.status === "PENDING" && "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450",
                              req.status === "APPROVED" && "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450",
                              req.status === "REJECTED" && "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450",
                              req.status === "IN_PROGRESS" && "bg-indigo-50 text-indigo-705 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/30"
                            )}>
                              {req.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850 text-xs text-zinc-505 dark:text-zinc-400">
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-450 block mb-0.5 uppercase">RAISED BY</span>
                            <span className="font-medium text-zinc-850 dark:text-zinc-250 flex items-center gap-1">
                              <User className="h-3 w-3 text-zinc-400" />
                              {req.raisedBy?.name || "Employee"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-450 block mb-0.5 uppercase">DATE LOGGED</span>
                            <span className="font-medium text-zinc-855 dark:text-zinc-250 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-zinc-450 block mb-0.5 uppercase">ASSIGNED TECH</span>
                            <span className="font-medium text-zinc-855 dark:text-zinc-250 flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                              {req.technician?.name || <span className="text-zinc-400 font-normal">Unassigned</span>}
                            </span>
                          </div>
                        </div>

                        {req.notes && (
                          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg text-xs text-zinc-650 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-850 mt-1">
                            <strong>Technician Notes:</strong> {req.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
