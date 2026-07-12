import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/50 max-w-md mx-auto my-8",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-zinc-400 dark:text-zinc-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
        {description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
