import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Play,
  UserCheck,
} from "lucide-react";
import { MaintenanceRequest, maintenanceService } from "../services/maintenance.service";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  RejectRequestModal,
  AssignTechnicianModal,
  ResolveRequestModal,
} from "./ActionModals";

interface KanbanBoardProps {
  requests: MaintenanceRequest[];
}

const COLUMNS = [
  { id: "PENDING", title: "Pending Approval", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  { id: "APPROVED", title: "Approved", color: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20" },
  { id: "TECHNICIAN_ASSIGNED", title: "Tech Assigned", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" },
  { id: "RESOLVED", title: "Resolved", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
] as const;

export default function KanbanBoard({ requests }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  // Modal active states
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"reject" | "assign" | "resolve" | "approve" | "start" | null>(null);

  const isManagerOrAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "ASSET_MANAGER";

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.approveRequest(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Request approved and asset status set to under maintenance");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  const startWorkMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.startWork(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Work started on asset repair");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/50";
      case "HIGH":
        return "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-450 border-orange-200 dark:border-orange-900/50";
      case "MEDIUM":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
      case "LOW":
      default:
        return "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    }
  };

  const handleActionClick = (id: string, action: "reject" | "assign" | "resolve" | "approve" | "start") => {
    setSelectedRequestId(id);
    setActiveModal(action);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 h-full">
      {COLUMNS.map((col) => {
        // Filter requests by column status
        const columnRequests = requests.filter((r) => r.status === col.id);

        return (
          <div key={col.id} className="flex flex-col min-w-[250px] bg-zinc-100/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3 h-[calc(100vh-12rem)] min-h-[500px]">
            {/* Column Header */}
            <div className={`flex justify-between items-center px-2 py-1.5 rounded-lg border ${col.color} mb-3 font-semibold text-xs tracking-wide`}>
              <span>{col.title}</span>
              <span className="bg-zinc-200/50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md text-[10px]">
                {columnRequests.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {columnRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 text-xs py-6">
                  No requests
                </div>
              ) : (
                columnRequests.map((req) => {
                  const isAssignedTech = req.technicianId === currentUser?.id;
                  const canResolveOrStart = isAssignedTech || isManagerOrAdmin;

                  return (
                    <Card
                      key={req.id}
                      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:shadow-md transition-all rounded-xl overflow-hidden"
                    >
                      <CardHeader className="p-3 pb-2 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                            {req.asset.assetTag}
                          </span>
                          <Badge className={`text-[10px] py-0.5 px-2 font-semibold capitalize border ${getPriorityColor(req.priority)}`} variant="outline">
                            {req.priority.toLowerCase()}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                          {req.asset.name}
                        </h4>
                      </CardHeader>

                      <CardContent className="p-3 pt-0 space-y-3">
                        {/* Issue description */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {req.issue}
                        </p>

                        <hr className="border-zinc-100 dark:border-zinc-900" />

                        {/* Metadata fields */}
                        <div className="space-y-1 text-[10px] text-zinc-400">
                          <div className="flex items-center space-x-1.5">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">Raised by: {req.raisedBy.name}</span>
                          </div>
                          {req.technician && (
                            <div className="flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 font-medium">
                              <Wrench className="h-3 w-3 shrink-0" />
                              <span className="truncate">Tech: {req.technician.name}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action buttons based on status & role */}
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {/* PENDING State Actions */}
                          {req.status === "PENDING" && isManagerOrAdmin && (
                            <>
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[10px] h-7 border-emerald-500/35 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 cursor-pointer flex-1"
                                onClick={() => handleActionClick(req.id, "approve")}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="text-[10px] h-7 border-rose-500/35 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 cursor-pointer flex-1"
                                onClick={() => handleActionClick(req.id, "reject")}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* APPROVED & TECHNICIAN_ASSIGNED State Actions */}
                          {(req.status === "APPROVED" || req.status === "TECHNICIAN_ASSIGNED") && isManagerOrAdmin && (
                            <Button
                              size="xs"
                              className="text-[10px] h-7 w-full cursor-pointer"
                              variant="outline"
                              onClick={() => handleActionClick(req.id, "assign")}
                            >
                              <UserCheck className="mr-1.5 h-3 w-3" />
                              {req.status === "APPROVED" ? "Assign Tech" : "Re-assign Tech"}
                            </Button>
                          )}

                          {/* TECHNICIAN_ASSIGNED State Actions (For Assigned Tech) */}
                          {req.status === "TECHNICIAN_ASSIGNED" && canResolveOrStart && (
                            <Button
                              size="xs"
                              className="text-[10px] h-7 w-full cursor-pointer bg-indigo-650 hover:bg-indigo-700 text-white"
                              onClick={() => handleActionClick(req.id, "start")}
                            >
                              <Play className="mr-1.5 h-3 w-3 fill-current" />
                              Start Work
                            </Button>
                          )}

                          {/* IN_PROGRESS State Actions */}
                          {req.status === "IN_PROGRESS" && canResolveOrStart && (
                            <Button
                              size="xs"
                              className="text-[10px] h-7 w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleActionClick(req.id, "resolve")}
                            >
                              <CheckCircle2 className="mr-1.5 h-3 w-3" />
                              Resolve Request
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Action Dialogs */}
      {selectedRequestId && (
        <>
          {/* Approve confirmation */}
          <ConfirmDialog
            isOpen={activeModal === "approve"}
            onClose={() => {
              setSelectedRequestId(null);
              setActiveModal(null);
            }}
            onConfirm={() => approveMutation.mutate(selectedRequestId)}
            title="Approve Maintenance Request"
            description="Are you sure you want to approve this request? The asset status will automatically transition to 'Under Maintenance'."
            confirmText="Approve"
          />

          {/* Start work confirmation */}
          <ConfirmDialog
            isOpen={activeModal === "start"}
            onClose={() => {
              setSelectedRequestId(null);
              setActiveModal(null);
            }}
            onConfirm={() => startWorkMutation.mutate(selectedRequestId)}
            title="Start Maintenance Work"
            description="Confirm that you are starting the repair work on this asset. The request will enter the 'In Progress' phase."
            confirmText="Start Work"
            variant="info"
          />

          {/* Reject request modal */}
          <RejectRequestModal
            isOpen={activeModal === "reject"}
            onClose={() => {
              setSelectedRequestId(null);
              setActiveModal(null);
            }}
            requestId={selectedRequestId}
          />

          {/* Assign technician modal */}
          <AssignTechnicianModal
            isOpen={activeModal === "assign"}
            onClose={() => {
              setSelectedRequestId(null);
              setActiveModal(null);
            }}
            requestId={selectedRequestId}
          />

          {/* Resolve request modal */}
          <ResolveRequestModal
            isOpen={activeModal === "resolve"}
            onClose={() => {
              setSelectedRequestId(null);
              setActiveModal(null);
            }}
            requestId={selectedRequestId}
          />
        </>
      )}
    </div>
  );
}
