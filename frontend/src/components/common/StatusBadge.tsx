import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;
  const cleanStatus = status.toUpperCase().replace(/_/g, " ");

  const getStatusStyles = (s: string) => {
    switch (s) {
      // Success states
      case "AVAILABLE":
      case "VERIFIED":
      case "COMPLETED":
      case "RESOLVED":
      case "RETURNED":
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
      // Info/Progress states
      case "ALLOCATED":
      case "ONGOING":
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-250 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
      // Pending/Warning states
      case "RESERVED":
      case "UPCOMING":
      case "TECHNICIAN_ASSIGNED":
      case "APPROVED":
        return "bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50";
      case "PENDING":
      case "REQUESTED":
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
      case "UNDER_MAINTENANCE":
      case "DAMAGED":
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-250 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50";
      // Alert/Danger states
      case "LOST":
      case "REJECTED":
      case "CANCELLED":
      case "OVERDUE":
      case "MISSING":
      case "CRITICAL":
      case "INACTIVE":
        return "bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
      case "LOW":
        return "bg-slate-50 text-slate-700 border-slate-250 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/50";
      case "RETIRED":
      case "DISPOSED":
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-250 dark:bg-zinc-950/30 dark:text-zinc-400 dark:border-zinc-900/50";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors shrink-0",
        getStatusStyles(status),
        className
      )}
    >
      {cleanStatus}
    </span>
  );
}
