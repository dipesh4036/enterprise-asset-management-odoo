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
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { maintenanceService } from "../services/maintenance.service";

const raiseRequestFormSchema = z.object({
  assetId: z.string().min(1, "Please select an asset"),
  issue: z.string().min(10, "Please describe the issue in at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  photoUrl: z.string().url("Invalid image URL").or(z.string().length(0)).optional(),
});

type RaiseRequestFormInput = z.infer<typeof raiseRequestFormSchema>;

interface RaiseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AssetOption {
  id: string;
  assetTag: string;
  name: string;
  status: string;
}

export default function RaiseRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: RaiseRequestModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RaiseRequestFormInput>({
    resolver: zodResolver(raiseRequestFormSchema),
    defaultValues: {
      assetId: "",
      issue: "",
      priority: "MEDIUM",
      photoUrl: "",
    },
  });

  // Fetch bookable / allocatable assets
  const { data: assets, isLoading: isLoadingAssets } = useQuery<AssetOption[]>({
    queryKey: ["assets-list-options"],
    queryFn: async () => {
      const response = await api.get("/assets");
      // Extract asset list from API response
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (data: RaiseRequestFormInput) => maintenanceService.raiseRequest(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Maintenance request raised successfully");
        queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
        reset();
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to raise request");
      }
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "An error occurred while submitting the request";
      toast.error(errMsg);
    },
  });

  const onSubmit = (data: RaiseRequestFormInput) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Raise Maintenance Request
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-2">
          {/* Asset Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Asset
            </label>
            {isLoadingAssets ? (
              <div className="flex items-center space-x-2 text-zinc-500 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading assets directory...</span>
              </div>
            ) : (
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={mutation.isPending}
                {...register("assetId")}
              >
                <option value="">-- Choose an Asset --</option>
                {assets?.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetTag} - {asset.name} ({asset.status})
                  </option>
                ))}
              </select>
            )}
            {errors.assetId && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.assetId.message}
              </p>
            )}
          </div>

          {/* Issue Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Describe the Issue
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide a detailed description of the hardware fault or issue..."
              disabled={mutation.isPending}
              {...register("issue")}
            />
            {errors.issue && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.issue.message}
              </p>
            )}
          </div>

          {/* Priority Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Priority Level
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={mutation.isPending}
              {...register("priority")}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            {errors.priority && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Image URL String (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Photo URL (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. https://example.com/asset-fault.jpg"
              disabled={mutation.isPending}
              {...register("photoUrl")}
            />
            {errors.photoUrl && (
              <p className="text-xs text-rose-600 dark:text-rose-450 font-medium">
                {errors.photoUrl.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
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
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
