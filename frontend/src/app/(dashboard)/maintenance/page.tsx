"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { maintenanceService } from "@/features/maintenance/services/maintenance.service";
import KanbanBoard from "@/features/maintenance/components/KanbanBoard";
import RaiseRequestModal from "@/features/maintenance/components/RaiseRequestModal";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

export default function MaintenancePage() {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // Fetch all maintenance requests
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: () => maintenanceService.getRequests(),
  });

  const requests = response?.data || [];

  return (
    <div className="flex flex-col space-y-6 h-full min-h-[calc(100vh-8rem)]">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Maintenance Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Track asset repairs, approve requests, and assign technicians on the Kanban board.
          </p>
        </div>

        <Button
          onClick={() => setIsRaiseModalOpen(true)}
          className="cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Raise Request
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton type="card" rows={5} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-rose-250 dark:border-rose-900/40 rounded-xl bg-rose-50/10 text-rose-600 dark:text-rose-400">
            <p className="font-semibold">Failed to load maintenance requests.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Maintenance Requests"
            description="All systems are nominal! No physical assets are currently flagged for maintenance or repair requests."
            action={
              <Button onClick={() => setIsRaiseModalOpen(true)}>
                Raise Repair Request
              </Button>
            }
          />
        ) : (
          <KanbanBoard requests={requests} />
        )}
      </div>

      {/* Modal Dialog for raising request */}
      <RaiseRequestModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
      />
    </div>
  );
}
