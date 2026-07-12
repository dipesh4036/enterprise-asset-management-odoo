"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/features/audit/services/audit.service";
import { useAuthStore } from "@/store/auth.store";
import CreateCycleModal from "@/features/audit/components/CreateCycleModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Building, Eye, Clock } from "lucide-react";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import Link from "next/link";

export default function AuditsListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["audit-cycles"],
    queryFn: () => auditService.getCycles(),
  });

  const cycles = response?.data || [];

  const getStatusBadge = (status: string) => {
    if (status === "CLOSED") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 font-semibold text-[10px]">
          Closed
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10 font-semibold text-[10px]">
        Active Open
      </Badge>
    );
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Physical Asset Auditing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Schedule verification cycles, assign auditors, and review discrepancy reports.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Schedule Audit
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="flex-1">
        {isLoading ? (
          <LoadingSkeleton type="table" rows={6} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-rose-200 dark:border-rose-900/40 rounded-xl bg-rose-50/10 text-rose-600 dark:text-rose-455">
            <p className="font-semibold">Failed to load audit cycles.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : cycles.length === 0 ? (
          <EmptyState
            title="No Audits Scheduled"
            description="There are currently no active or closed asset auditing cycles mapped in your organization."
            action={
              isAdmin ? (
                <Button onClick={() => setIsModalOpen(true)}>
                  Schedule First Audit
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cycles.map((cycle) => (
              <Card
                key={cycle.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                      {cycle.name}
                    </h3>
                    {getStatusBadge(cycle.status)}
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Metadata scope */}
                    <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {cycle.department && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span className="truncate">Dept: {cycle.department.name}</span>
                        </div>
                      )}
                      {cycle.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                          <span className="truncate">Loc: {cycle.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                        <span>
                          {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <hr className="border-zinc-100 dark:border-zinc-900" />

                    {/* Progress details */}
                    {cycle.stats && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-500 dark:text-zinc-400">Audit Completion</span>
                          <span className="text-zinc-900 dark:text-zinc-250">
                            {cycle.stats.progressPercent}% ({cycle.stats.completed}/{cycle.stats.total} assets)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200/20">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              cycle.status === "CLOSED" ? "bg-emerald-500" : "bg-zinc-800 dark:bg-zinc-300"
                            }`}
                            style={{ width: `${cycle.stats.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex space-x-3 text-[10px] text-zinc-400 font-semibold pt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-500">{cycle.stats.verified} Verified</span>
                          <span className="text-rose-600 dark:text-rose-500">{cycle.stats.missing} Missing</span>
                          <span className="text-amber-600 dark:text-amber-500">{cycle.stats.damaged} Damaged</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <Link href={`/audit/${cycle.id}`} className="w-full block">
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer h-9 text-xs border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        {cycle.status === "CLOSED" ? "View Results" : "Conduct Audit"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog for creating a new cycle */}
      <CreateCycleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
