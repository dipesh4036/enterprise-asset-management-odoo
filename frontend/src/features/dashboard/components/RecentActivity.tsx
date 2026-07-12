"use client";

import { getRelativeTimeString } from "@/utils/date";
import { Activity, ArrowRight, Laptop, Calendar, Wrench, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  metadata?: any;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export default function RecentActivity({ activities = [], isLoading = false }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "ASSET":
        return <Laptop className="h-4 w-4 text-blue-500" />;
      case "BOOKING":
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case "ALLOCATION":
      case "TRANSFER":
        return <ArrowRight className="h-4 w-4 text-indigo-500" />;
      case "AUDIT":
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <Card className="border bg-white dark:bg-zinc-950/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Activity className="h-5 w-5 text-zinc-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No recent activity recorded
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800/80 before:h-[calc(100%-8px)]">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-4 relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm z-10 shrink-0">
                  {getActivityIcon(item.entityType)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.user?.name || "Someone"}
                    </span>{" "}
                    {item.action.toLowerCase().replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex justify-between">
                    <span>ID: {item.entityId}</span>
                    <span className="shrink-0 font-medium">
                      {getRelativeTimeString(item.createdAt)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
