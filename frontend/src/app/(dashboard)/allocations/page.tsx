"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { orgService } from "@/features/organization/services/org.service";
import { allocationService, AllocationItem, TransferRequestItem } from "@/features/allocation/services/allocation.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle, ArrowRightLeft, UserCheck, Calendar, ShieldAlert, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

const allocateSchema = z.object({
  assetId: z.string().min(1, "Please select an asset"),
  employeeId: z.string().min(1, "Please select an employee"),
  expectedReturnAt: z.string().optional().or(z.string().length(0)),
});

type AllocateInput = z.infer<typeof allocateSchema>;

interface AssetOption {
  id: string;
  name: string;
  assetTag: string;
  status: string;
}

export default function AllocationsPage() {
  const queryClient = useQueryClient();

  const [conflictData, setConflictData] = useState<{
    holder: { name: string; department: string };
    assetId: string;
    canRequestTransfer: boolean;
  } | null>(null);

  // Return modal state
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null);
  const [conditionNotes, setConditionNotes] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AllocateInput>({
    resolver: zodResolver(allocateSchema),
    defaultValues: { assetId: "", employeeId: "", expectedReturnAt: "" },
  });

  const selectedAssetId = watch("assetId");

  // Fetch AVAILABLE assets
  const { data: assetsRes, isLoading: loadingAssets } = useQuery<AssetOption[]>({
    queryKey: ["allocatable-assets"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return (res.data.data || []).filter((a: any) => a.status === "AVAILABLE");
    },
  });

  // Fetch employees
  const { data: employeesRes, isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: () => orgService.getEmployees(),
  });

  // Fetch overdue allocations
  const { data: overdueRes, isLoading: loadingOverdue } = useQuery({
    queryKey: ["overdue-allocations"],
    queryFn: () => allocationService.getOverdueAllocations(),
  });

  // Fetch transfer requests
  const { data: transfersRes, isLoading: loadingTransfers } = useQuery({
    queryKey: ["transfer-requests"],
    queryFn: () => allocationService.getTransferRequests(),
  });

  const assets = assetsRes || [];
  const employees = employeesRes?.data || [];
  const overdueAllocations = overdueRes?.data || [];
  const transferRequests = transfersRes?.data || [];

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: (data: AllocateInput) =>
      allocationService.createAllocation({
        assetId: data.assetId,
        employeeId: data.employeeId,
        expectedReturnAt: data.expectedReturnAt || undefined,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asset allocated successfully!");
        setConflictData(null);
        reset();
        queryClient.invalidateQueries({ queryKey: ["allocatable-assets"] });
        queryClient.invalidateQueries({ queryKey: ["overdue-allocations"] });
      }
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        const errorBody = err.response.data;
        setConflictData({
          holder: errorBody.data.holder,
          assetId: selectedAssetId,
          canRequestTransfer: errorBody.data.canRequestTransfer,
        });
        toast.warning(errorBody.message || "Conflict: Asset is already allocated.");
      } else {
        toast.error(err.response?.data?.message || "An error occurred");
      }
    },
  });

  const returnMutation = useMutation({
    mutationFn: (args: { id: string; notes: string }) =>
      allocationService.returnAsset(args.id, { conditionNotes: args.notes }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Asset returned successfully to inventory");
        setSelectedAllocation(null);
        setConditionNotes("");
        queryClient.invalidateQueries({ queryKey: ["allocatable-assets"] });
        queryClient.invalidateQueries({ queryKey: ["overdue-allocations"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to return asset");
    },
  });

  const requestTransferMutation = useMutation({
    mutationFn: (args: { assetId: string; reason: string }) =>
      allocationService.requestTransfer({ assetId: args.assetId, reason: args.reason }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Transfer request submitted successfully to current holder");
        setConflictData(null);
        queryClient.invalidateQueries({ queryKey: ["transfer-requests"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to request transfer");
    },
  });

  const approveTransferMutation = useMutation({
    mutationFn: (id: string) => allocationService.approveTransfer(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Transfer request approved! Asset re-allocated.");
        queryClient.invalidateQueries({ queryKey: ["transfer-requests"] });
        queryClient.invalidateQueries({ queryKey: ["allocatable-assets"] });
        queryClient.invalidateQueries({ queryKey: ["overdue-allocations"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve transfer");
    },
  });

  const rejectTransferMutation = useMutation({
    mutationFn: (id: string) => allocationService.rejectTransfer(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Transfer request rejected");
        queryClient.invalidateQueries({ queryKey: ["transfer-requests"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reject transfer");
    },
  });

  const onSubmit = (data: AllocateInput) => {
    allocateMutation.mutate(data);
  };

  const handleRequestTransferClick = () => {
    if (!conflictData) return;
    requestTransferMutation.mutate({
      assetId: conflictData.assetId,
      reason: "Urgent deployment requirement in my scoped team.",
    });
  };

  const isLoading = loadingAssets || loadingEmployees || loadingOverdue || loadingTransfers;

  if (isLoading) {
    return <LoadingSkeleton type="table" rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Asset Allocations Checkout
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Allocate equipment to active employees, monitor overdue items, and process team-to-team transfer requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocate Form Panel */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-zinc-400" />
              Checkout Asset Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Asset Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Asset
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={allocateMutation.isPending}
                  {...register("assetId")}
                >
                  <option value="">-- Available Assets --</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetTag} - {asset.name}
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                    {errors.assetId.message}
                  </p>
                )}
              </div>

              {/* Employee Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Allocate To Employee
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={allocateMutation.isPending}
                  {...register("employeeId")}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees
                    .filter((e) => e.status === "ACTIVE")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department?.name || "Shared"})
                      </option>
                    ))}
                </select>
                {errors.employeeId && (
                  <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              {/* Expected Return Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Expected Return Date (Optional)
                </label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={allocateMutation.isPending}
                  {...register("expectedReturnAt")}
                />
              </div>

              <Button
                type="submit"
                disabled={allocateMutation.isPending}
                className="w-full cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {allocateMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Confirm Checkout
              </Button>
            </form>

            {/* Conflict Transfer warning alert */}
            {conflictData && (
              <div className="p-3 border border-amber-200 dark:border-amber-900/50 bg-amber-50/10 rounded-xl space-y-2 text-xs">
                <div className="flex items-start space-x-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <p className="font-medium leading-normal">
                    This asset is currently checked out to **{conflictData.holder.name}** ({conflictData.holder.department}).
                  </p>
                </div>
                {conflictData.canRequestTransfer ? (
                  <div>
                    <Button
                      size="sm"
                      onClick={handleRequestTransferClick}
                      disabled={requestTransferMutation.isPending}
                      className="w-full h-8 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                    >
                      {requestTransferMutation.isPending ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
                      )}
                      Request Allocation Transfer
                    </Button>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400 italic">
                    * You cannot request transfer for an asset already held in your department.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Requests and Overdue Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Requests Review Panel */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-zinc-400" />
                Asset Ownership Transfer Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Current Holder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-zinc-400 text-xs">
                        No pending transfer requests
                      </TableCell>
                    </TableRow>
                  ) : (
                    transferRequests.map((tr) => (
                      <TableRow key={tr.id} className="text-xs">
                        <TableCell className="font-mono font-bold">{tr.asset.assetTag}</TableCell>
                        <TableCell className="font-semibold">{tr.asset.name}</TableCell>
                        <TableCell>{tr.toUser.name}</TableCell>
                        <TableCell>{tr.fromUser.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[9px] py-0 px-1.5 ${
                              tr.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-700"
                                : tr.status === "REJECTED"
                                ? "bg-rose-500/10 text-rose-700"
                                : "bg-amber-500/10 text-amber-700"
                            }`}
                            variant="outline"
                          >
                            {tr.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {tr.status === "REQUESTED" ? (
                            <div className="flex justify-end space-x-1.5">
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[10px] h-7 border-emerald-500/35 hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                                onClick={() => approveTransferMutation.mutate(tr.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[10px] h-7 border-rose-500/35 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                onClick={() => rejectTransferMutation.mutate(tr.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">Resolved</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Overdue Allocations Panel */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-455 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                Overdue Allocation Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Checked out to</TableHead>
                    <TableHead>Expected Return</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueAllocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-zinc-400 text-xs">
                        All allocations are within expected return dates!
                      </TableCell>
                    </TableRow>
                  ) : (
                    overdueAllocations.map((alloc) => (
                      <TableRow key={alloc.id} className="text-xs">
                        <TableCell className="font-mono font-bold text-rose-900 dark:text-rose-450">{alloc.asset.assetTag}</TableCell>
                        <TableCell className="font-semibold">{alloc.asset.name}</TableCell>
                        <TableCell>{alloc.employee.name}</TableCell>
                        <TableCell className="text-rose-600 font-semibold">
                          {alloc.expectedReturnAt ? new Date(alloc.expectedReturnAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setSelectedAllocation(alloc)}
                            className="text-[10px] h-7 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                          >
                            Return Asset
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Return Asset Dialog Modal */}
      {selectedAllocation && (
        <Dialog open={!!selectedAllocation} onOpenChange={(open) => !open && setSelectedAllocation(null)}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Record Asset Return
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="text-xs text-zinc-500 space-y-1">
                <p>Asset: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedAllocation.asset.name} ({selectedAllocation.asset.assetTag})</span></p>
                <p>Held by: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedAllocation.employee.name}</span></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Return Condition Notes
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Record condition of the asset (e.g. Good condition, Screen scratched, Fan noisy...)"
                  value={conditionNotes}
                  disabled={returnMutation.isPending}
                  onChange={(e) => setConditionNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={returnMutation.isPending}
                onClick={() => setSelectedAllocation(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={returnMutation.isPending || !conditionNotes.trim()}
                onClick={() => returnMutation.mutate({ id: selectedAllocation.id, notes: conditionNotes })}
                className="cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800"
              >
                {returnMutation.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
                Process Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
