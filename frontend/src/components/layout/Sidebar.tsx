"use client";

import { useAuthStore, Role } from "@/store/auth.store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Building2,
  Laptop,
  ArrowLeftRight,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  allowedRoles?: Role[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Organization Setup",
    href: "/organization",
    icon: Building2,
    allowedRoles: ["ADMIN"],
  },
  { label: "Asset Registry", href: "/assets", icon: Laptop },
  { label: "Allocation & Transfer", href: "/allocation", icon: ArrowLeftRight },
  { label: "Resource Booking", href: "/booking", icon: CalendarDays },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Asset Audit", href: "/audit", icon: ClipboardCheck },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  // Filter nav items based on user role
  const filteredItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-screen shrink-0">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400">
          ASSETFLOW
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive
                    ? "text-white dark:text-zinc-950"
                    : "text-zinc-400 group-hover:text-zinc-950 dark:text-zinc-500 dark:group-hover:text-zinc-100"
                )}
              />
              {item.label}

              {isActive && (
                <span className="absolute left-0 top-1/4 h-1/2 w-1 bg-zinc-900 dark:bg-zinc-50 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
