import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgService } from "@/features/organization/services/org.service";
import { auditService } from "../services/audit.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const createCycleFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  departmentId: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  auditorIds: z.array(z.string()).min(1, "Please assign at least one auditor"),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

type CreateCycleFormInput = z.infer<typeof createCycleFormSchema>;

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCycleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCycleModalProps) {
  const queryClient = useQueryClient();
  const [selectedAuditors, setSelectedAuditors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCycleFormInput>({
    resolver: zodResolver(createCycleFormSchema),
    defaultValues: {
      name: "",
      departmentId: "",
      location: "",
      startDate: "",
      endDate: "",
      auditorIds: [],
    },
  });

  // Query departments
  const { data: deptsResponse, isLoading: isLoadingDepts } = useQuery({
    queryKey: ["org-departments-options"],
    queryFn: () => orgService.getDepartments(),
    enabled: isOpen,
  });

  // Query employees (to select auditors)
  const { data: employeesResponse, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["org-employees-options"],
    queryFn: () => orgService.getEmployees(),
    enabled: isOpen,
  });

  const departments = deptsResponse?.data || [];
  const employees = employeesResponse?.data || [];

  const mutation = useMutation({
    mutationFn: (data: CreateCycleFormInput) =>
      auditService.createCycle({
        name: data.name,
        departmentId: data.departmentId || undefined,
        location: data.location || undefined,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        auditorIds: data.auditorIds,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Audit cycle successfully scheduled with scoped assets");
        queryClient.invalidateQueries({ queryKey: ["audit-cycles"] });
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Failed to create audit cycle");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error creating audit cycle");
    },
  });

  const handleAuditorChange = (empId: string, checked: boolean) => {
    let updated: string[];
    if (checked) {
      updated = [...selectedAuditors, empId];
    } else {
      updated = selectedAuditors.filter((id) => id !== empId);
    }
    setSelectedAuditors(updated);
    setValue("auditorIds", updated, { shouldValidate: true });
  };

  const handleClose = () => {
    reset();
    setSelectedAuditors([]);
    onClose();
  };

  const onSubmit = (data: CreateCycleFormInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Schedule Audit Cycle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-2">
          {/* Cycle Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Audit Cycle Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Q3 2026 Electronics Audit"
              disabled={mutation.isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Department Scoping */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Scope: Department (Optional)
              </label>
              {isLoadingDepts ? (
                <div className="text-xs text-zinc-500 flex items-center space-x-1.5 py-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={mutation.isPending}
                  {...register("departmentId")}
                >
                  <option value="">All Departments</option>
                  {departments
                    .filter((d) => d.status === "ACTIVE")
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Location Scoping */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Scope: Location (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Floor 3"
                disabled={mutation.isPending}
                {...register("location")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Start Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={mutation.isPending}
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                End Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={mutation.isPending}
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Assigned Auditors Multiselect (Checkbox Grid) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Assign Auditors
            </label>
            {isLoadingEmployees ? (
              <div className="text-xs text-zinc-500 flex items-center space-x-1.5 py-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading employee registry...</span>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {employees
                  .filter((emp) => emp.status === "ACTIVE")
                  .map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center space-x-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 p-1 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAuditors.includes(emp.id)}
                        disabled={mutation.isPending}
                        onChange={(e) => handleAuditorChange(emp.id, e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-950 dark:border-zinc-800"
                      />
                      <span>
                        {emp.name} ({emp.role.replace("_", " ").toLowerCase()})
                      </span>
                    </label>
                  ))}
              </div>
            )}
            {errors.auditorIds && (
              <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                {errors.auditorIds.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={handleClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Audit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
