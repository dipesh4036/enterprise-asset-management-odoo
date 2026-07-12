import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
        className
      )}
    />
  );
}

interface LoadingSkeletonProps {
  type?: "table" | "card" | "list";
  rows?: number;
  className?: string;
}

export default function LoadingSkeleton({
  type = "table",
  rows = 5,
  className,
}: LoadingSkeletonProps) {
  if (type === "card") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border border-zinc-150 dark:border-zinc-850 rounded-xl p-5 bg-white dark:bg-zinc-950/50 space-y-4 shadow-sm"
          >
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-3 border-b border-zinc-100 dark:border-zinc-850"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default Table skeleton
  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-zinc-200 dark:border-zinc-800 flex space-x-4">
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 flex-1" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="p-4 border-b border-zinc-100 dark:border-zinc-850 flex space-x-4"
          >
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
