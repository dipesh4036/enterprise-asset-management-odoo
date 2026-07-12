"use client";

import { PlusCircle, CalendarPlus, AlertOctagon, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function QuickActions() {
  const { user } = useAuthStore();
  
  // Quick action buttons visibility according to roles
  const actions = [
    {
      label: "Register Asset",
      description: "Add new device to database",
      icon: PlusCircle,
      href: "/assets?register=true",
      allowedRoles: ["ADMIN", "ASSET_MANAGER"],
    },
    {
      label: "Book Resource",
      description: "Schedule room or vehicle",
      icon: CalendarPlus,
      href: "/booking",
      allowedRoles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"],
    },
    {
      label: "Raise Maintenance",
      description: "Report device damage/fault",
      icon: AlertOctagon,
      href: "/maintenance?raise=true",
      allowedRoles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"],
    },
  ];

  const filteredActions = actions.filter((act) => {
    if (!user) return false;
    return act.allowedRoles.includes(user.role);
  });

  return (
    <Card className="border bg-white dark:bg-zinc-950/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link href={action.href} key={i} className="group">
                <div className="h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer flex items-start gap-4 shadow-sm hover:shadow">
                  <div className="p-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      {action.label}
                    </h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
