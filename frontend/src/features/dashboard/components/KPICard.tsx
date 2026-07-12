"use client";

import { useAuthStore, Role } from "@/store/auth.store";
import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: any; // LucideIcon component
  description?: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "zinc";
  allowedRoles?: Role[];
}

export default function KPICard({
  label,
  value,
  icon: Icon,
  description,
  color = "zinc",
  allowedRoles,
}: KPICardProps) {
  const { user } = useAuthStore();

  // Role-aware visibility check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  const getColorStyles = (c: typeof color) => {
    switch (c) {
      case "blue":
        return {
          iconContainer: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
          border: "border-blue-100 dark:border-blue-950/30",
        };
      case "emerald":
        return {
          iconContainer: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
          border: "border-emerald-100 dark:border-emerald-950/30",
        };
      case "amber":
        return {
          iconContainer: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
          border: "border-amber-100 dark:border-amber-950/30",
        };
      case "rose":
        return {
          iconContainer: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
          border: "border-rose-100 dark:border-rose-950/30",
        };
      case "indigo":
        return {
          iconContainer: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
          border: "border-indigo-100 dark:border-indigo-950/30",
        };
      case "zinc":
      default:
        return {
          iconContainer: "bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
          border: "border-zinc-150 dark:border-zinc-850",
        };
    }
  };

  const styles = getColorStyles(color);

  return (
    <Card className={cn("border bg-white dark:bg-zinc-950/50 shadow-sm transition-all duration-200 hover:shadow-md", styles.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <h4 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {value}
            </h4>
          </div>
          <div className={cn("p-3 rounded-xl border border-transparent transition-all", styles.iconContainer)}>
            <Icon className="h-5 w-5 shrink-0" />
          </div>
        </div>
        {description && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
