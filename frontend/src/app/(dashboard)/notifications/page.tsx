"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notificationsService, NotificationItem } from "@/features/notifications/services/notifications.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CheckSquare, Bell, Calendar, ShieldAlert, Wrench, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

type TabType = "all" | "unread" | "audit" | "maintenance";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: () => notificationsService.getNotifications(),
  });

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("All notifications marked as read");
        queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      }
    },
  });

  const handleNotificationClick = async (item: NotificationItem) => {
    // 1. Mark as read
    if (!item.isRead) {
      await markReadMutation.mutateAsync(item.id);
    }

    // 2. Navigate based on type
    if (item.entityId) {
      if (item.type.includes("AUDIT")) {
        router.push(`/audit/${item.entityId}`);
        return;
      }
      if (item.type.includes("MAINTENANCE")) {
        router.push("/maintenance");
        return;
      }
      if (item.type.includes("ASSIGNED") || item.type.includes("ALLOC")) {
        router.push("/allocations");
        return;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes("AUDIT")) {
      return <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" />;
    }
    if (type.includes("MAINTENANCE") || type.includes("REPAIR")) {
      return <Wrench className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
    }
    if (type.includes("ASSIGNED") || type.includes("TRANSFER")) {
      return <Info className="h-4.5 w-4.5 text-sky-500 shrink-0" />;
    }
    return <Bell className="h-4.5 w-4.5 text-zinc-400 shrink-0" />;
  };

  // Filter notifications by tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "audit") return n.type.includes("AUDIT");
    if (activeTab === "maintenance") return n.type.includes("MAINTENANCE") || n.type.includes("ASSIGNED");
    return true; // all
  });

  return (
    <div className="space-y-6 min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <Badge className="bg-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-full hover:bg-rose-500">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Stay up to date with asset assignments, auditing cycles status, and physical repair tickets.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            variant="outline"
            className="cursor-pointer border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckSquare className="mr-1.5 h-4 w-4" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1.5 border-b border-zinc-250 dark:border-zinc-800/80 pb-px">
        {(["all", "unread", "audit", "maintenance"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-250"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List Container */}
      <div className="flex-1">
        {isLoading ? (
          <LoadingSkeleton type="list" rows={5} />
        ) : isError ? (
          <div className="text-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-sm">Failed to load notifications</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title="Inbox Clean"
            description="You have no notifications in this category. All updates have been cleared."
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <Card
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`transition-all border hover:shadow-sm cursor-pointer rounded-2xl ${
                  item.isRead
                    ? "bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-850 opacity-70"
                    : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <CardContent className="p-4 flex items-start space-x-3.5">
                  {/* Status Indicator */}
                  <div className="pt-0.5 shrink-0">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.isRead ? "bg-transparent" : "bg-sky-500 animate-pulse"}`} />
                  </div>

                  {/* Icon */}
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Message body */}
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs leading-relaxed ${item.isRead ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-800 dark:text-zinc-100 font-medium"}`}>
                      {item.message}
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-zinc-400 font-semibold">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Read checkbox action */}
                  {!item.isRead && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate(item.id);
                      }}
                      className="h-8 w-8 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 cursor-pointer shrink-0"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
