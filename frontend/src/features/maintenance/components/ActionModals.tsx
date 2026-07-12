import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { maintenanceService } from "../services/maintenance.service";

// ============================================================================
// 1. REJECT REQUEST MODAL
// ============================================================================
const rejectSchema = z.object({
  notes: z.string().min(5, "Please explain why in at least 5 characters"),
});

type RejectInput = z.infer<typeof rejectSchema>;

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export function RejectRequestModal({ isOpen, onClose, requestId }: RejectRequestModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: RejectInput) => maintenanceService.rejectRequest(requestId, data.notes),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Maintenance request rejected successfully");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
        reset();
        onClose();
      } else {
        toast.error(res.message || "Failed to reject request");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Reject Maintenance Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Rejection Reason / Notes
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Explain the reason for rejecting this request..."
              disabled={mutation.isPending}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              variant="destructive"
              className="cursor-pointer"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// 2. ASSIGN TECHNICIAN MODAL
// ============================================================================
const assignSchema = z.object({
  technicianId: z.string().min(1, "Please select a technician"),
});

type AssignInput = z.infer<typeof assignSchema>;

interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

interface EmployeeOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function AssignTechnicianModal({ isOpen, onClose, requestId }: AssignTechnicianModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignInput>({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: "" },
  });

  // Fetch employees list
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<EmployeeOption[]>({
    queryKey: ["employees-technicians-list"],
    queryFn: async () => {
      const response = await api.get("/organization/employees");
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: AssignInput) =>
      maintenanceService.assignTechnician(requestId, data.technicianId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Technician assigned successfully");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
        reset();
        onClose();
      } else {
        toast.error(res.message || "Failed to assign technician");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Assign Technician
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Technician
            </label>
            {isLoadingEmployees ? (
              <div className="flex items-center space-x-2 text-zinc-500 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading employee directory...</span>
              </div>
            ) : (
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={mutation.isPending}
                {...register("technicianId")}
              >
                <option value="">-- Choose a Technician --</option>
                {employees
                  ?.filter((e) => e.role !== "ADMIN") // Any employee can be a tech
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role.replace("_", " ")}) - {emp.email}
                    </option>
                  ))}
              </select>
            )}
            {errors.technicianId && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.technicianId.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// 3. RESOLVE REQUEST MODAL
// ============================================================================
const resolveSchema = z.object({
  notes: z.string().min(5, "Please explain resolution in at least 5 characters"),
});

type ResolveInput = z.infer<typeof resolveSchema>;

interface ResolveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export function ResolveRequestModal({ isOpen, onClose, requestId }: ResolveRequestModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResolveInput>({
    resolver: zodResolver(resolveSchema),
    defaultValues: { notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: ResolveInput) => maintenanceService.resolveRequest(requestId, data.notes),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Maintenance request resolved successfully! Asset is now available.");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
        reset();
        onClose();
      } else {
        toast.error(res.message || "Failed to resolve request");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Resolve Maintenance Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Resolution Notes / Action Taken
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Battery replaced, screen driver re-installed..."
              disabled={mutation.isPending}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resolve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
