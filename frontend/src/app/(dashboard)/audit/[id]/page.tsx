"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { auditService } from "@/features/audit/services/audit.service";
import ChecklistTable from "@/features/audit/components/ChecklistTable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [closedReport, setClosedReport] = useState<any | null>(null);

  // Query details of cycle
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["audit-cycle", id],
    queryFn: () => auditService.getCycleDetail(id),
    enabled: !!id,
  });

  const cycle = response?.data;

  // Mutation to close cycle
  const closeMutation = useMutation({
    mutationFn: () => auditService.closeCycle(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Audit cycle closed successfully. Asset statuses synchronized.");
        setClosedReport(res.data.discrepancyReport);
        queryClient.invalidateQueries({ queryKey: ["audit-cycle", id] });
        queryClient.invalidateQueries({ queryKey: ["audit-cycles"] });
      } else {
        toast.error(res.message || "Failed to close audit cycle");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="table" rows={8} />;
  }

  if (isError || !cycle) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-rose-250 dark:border-rose-900/40 rounded-xl bg-rose-50/10 text-rose-600 dark:text-rose-400">
        <p className="font-semibold">Audit cycle not found or failed to load details.</p>
        <Button variant="outline" className="mt-3" onClick={() => router.push("/audit")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Audits
        </Button>
      </div>
    );
  }

  const isAssignedAuditor = cycle.assignments.some((a) => a.auditor.id === currentUser?.id);
  const isAuditor = isAssignedAuditor || currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";
  const isClosed = cycle.status === "CLOSED";

  // Filter missing/damaged entries to preview discrepancies
  const missingEntries = cycle.entries?.filter((e) => e.status === "MISSING") || [];
  const damagedEntries = cycle.entries?.filter((e) => e.status === "DAMAGED") || [];
  const discrepanciesCount = missingEntries.length + damagedEntries.length;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/audit")}
          className="cursor-pointer border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Audits
        </Button>
      </div>

      {/* Main Details and KPIs grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cycle Specs */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm lg:col-span-2">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{cycle.name}</h2>
              <Badge
                className={`text-[10px] font-semibold border ${
                  isClosed
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
                }`}
                variant="outline"
              >
                {isClosed ? "Locked (Closed)" : "Active Audit"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-650 dark:text-zinc-400">
              <div className="space-y-1">
                {cycle.department && (
                  <p className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-zinc-400 shrink-0" />
                    <span className="truncate">Department: {cycle.department.name}</span>
                  </p>
                )}
                {cycle.location && (
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-zinc-400 shrink-0" />
                    <span>Location: {cycle.location}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-zinc-400 shrink-0" />
                  <span>
                    Range: {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-900" />

            {/* Auditors list */}
            <div>
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Assigned Auditors:</p>
              <div className="flex flex-wrap gap-1.5">
                {cycle.assignments.map((asg) => (
                  <Badge
                    key={asg.id}
                    variant="outline"
                    className="text-[10px] bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-0.5 px-2"
                  >
                    {asg.auditor.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Action Card */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm flex flex-col justify-between">
          <CardHeader className="p-5 pb-2">
            <h3 className="font-bold text-sm text-zinc-850 dark:text-zinc-100">Audit Status Overview</h3>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
            {cycle.stats && (
              <div className="space-y-3 flex-1 pt-1">
                {/* Stats figures */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Total Assets</p>
                    <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{cycle.stats.total}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Checked</p>
                    <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{cycle.stats.completed}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-500">Progress</span>
                    <span>{cycle.stats.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/20">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isClosed ? "bg-emerald-500" : "bg-zinc-800 dark:bg-zinc-300"
                      }`}
                      style={{ width: `${cycle.stats.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Discrepancy quick info */}
                <div className="flex space-x-4 text-xs font-semibold pt-1">
                  <p className="text-rose-600 dark:text-rose-455 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                    {cycle.stats.missing} Missing
                  </p>
                  <p className="text-amber-600 dark:text-amber-455 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5 shrink-0" />
                    {cycle.stats.damaged} Damaged
                  </p>
                </div>
              </div>
            )}

            {/* Admin Action: Close Cycle */}
            {!isClosed && isAdmin && cycle.stats && (
              <div className="pt-2">
                <Button
                  onClick={() => setIsCloseDialogOpen(true)}
                  disabled={cycle.stats.pending > 0 || closeMutation.isPending}
                  className="w-full cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center disabled:opacity-50"
                >
                  {closeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1.5 h-4 w-4" />
                      Close & Lock Audit
                    </>
                  )}
                </Button>
                {cycle.stats.pending > 0 && (
                  <p className="text-[10px] text-zinc-400 mt-2 italic text-center">
                    * All scoped assets must be checked before locking the cycle.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checklist Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-150 pl-1">Audit Scoped Assets</h3>
        <ChecklistTable
          entries={cycle.entries || []}
          cycleId={id}
          isClosed={isClosed}
          isAuditor={isAuditor}
        />
      </div>

      {/* Discrepancy Preview Section */}
      {discrepanciesCount > 0 && (
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-455">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-bold text-base">Discrepancy Preview List ({discrepanciesCount} items)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing */}
            {missingEntries.length > 0 && (
              <div className="space-y-2 border border-rose-100 dark:border-rose-950/40 rounded-xl p-3 bg-rose-50/5">
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                  Confirmed Missing ({missingEntries.length} items)
                </h4>
                <div className="space-y-1.5 text-xs">
                  {missingEntries.map((e) => (
                    <div key={e.id} className="flex justify-between items-start bg-rose-50/20 dark:bg-rose-950/10 p-2 rounded border border-rose-100/50 dark:border-rose-950/20">
                      <div>
                        <span className="font-mono font-bold text-rose-900 dark:text-rose-400 mr-2">{e.asset.assetTag}</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{e.asset.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic shrink-0 max-w-[120px] truncate">{e.notes || "No comments"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Damaged */}
            {damagedEntries.length > 0 && (
              <div className="space-y-2 border border-amber-100 dark:border-amber-950/40 rounded-xl p-3 bg-amber-50/5">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  Confirmed Damaged ({damagedEntries.length} items)
                </h4>
                <div className="space-y-1.5 text-xs">
                  {damagedEntries.map((e) => (
                    <div key={e.id} className="flex justify-between items-start bg-amber-50/20 dark:bg-amber-950/10 p-2 rounded border border-amber-100/50 dark:border-amber-950/20">
                      <div>
                        <span className="font-mono font-bold text-amber-900 dark:text-amber-450 mr-2">{e.asset.assetTag}</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{e.asset.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic shrink-0 max-w-[120px] truncate">{e.notes || "No comments"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Post-Close results display */}
      {isClosed && closedReport && (
        <Card className="bg-emerald-500/5 border border-emerald-250 dark:border-emerald-950/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-bold text-base">Cycle Closed — Discrepancies Synchronized</h3>
          </div>
          <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
            The audit cycle is locked. All missing assets have been marked as **LOST** and all damaged assets have been marked as **UNDER_MAINTENANCE** in the system registry. Notifications have been dispatched to administrators.
          </p>
        </Card>
      )}

      {/* Irreversible Close Confirmation dialog */}
      <ConfirmDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onConfirm={() => closeMutation.mutate()}
        title="Confirm Irreversible Cycle Closure"
        description="Are you absolutely sure you want to lock this cycle? This action is permanent and will immediately update the status of scoped assets in the registry (Missing items set to 'LOST', Damaged items set to 'Under Maintenance')."
        confirmText="Confirm Lock"
        variant="danger"
      />
    </div>
  );
}
