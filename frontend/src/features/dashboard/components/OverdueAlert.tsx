"use client";

import { AlertTriangle, Calendar, User, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import Link from "next/link";

export interface OverdueItem {
  id: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
  };
  employee: {
    name: string;
    email: string;
  };
  expectedReturnAt: string;
}

interface OverdueAlertProps {
  items: OverdueItem[];
  isLoading?: boolean;
}

export default function OverdueAlert({ items = [], isLoading = false }: OverdueAlertProps) {
  if (!isLoading && items.length === 0) return null;

  return (
    <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-rose-100 dark:border-rose-950/20 bg-rose-50/70 dark:bg-rose-950/20">
        <CardTitle className="text-rose-800 dark:text-rose-455 text-lg font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse text-rose-500" />
          Overdue Returns Flagged ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <div className="h-10 bg-rose-100/30 animate-pulse rounded-lg" />
            <div className="h-10 bg-rose-100/30 animate-pulse rounded-lg" />
          </div>
        ) : (
          <div className="divide-y divide-rose-100 dark:divide-rose-950/20">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/70 dark:hover:bg-rose-950/20 transition-colors"
              >
                <div className="space-y-1">
                  <h5 className="font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 font-bold border border-rose-200/50">
                      {item.asset.assetTag}
                    </span>
                    {item.asset.name}
                  </h5>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {item.employee.name} ({item.employee.email})
                    </span>
                    <span className="flex items-center gap-1 font-medium text-rose-700 dark:text-rose-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Due Date: {formatDate(item.expectedReturnAt)}
                    </span>
                  </div>
                </div>
                <Link href={`/allocation`} passHref>
                  <Button variant="outline" size="sm" className="border-rose-200 hover:bg-rose-100/50 dark:border-rose-900/50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-400 font-medium">
                    Manage Return
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
