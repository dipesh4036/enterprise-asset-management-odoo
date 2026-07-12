"use client";

import { useAuthStore, Role } from "@/store/auth.store";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";
import type { LucideProps } from "lucide-react";
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

type LucideIcon = React.ComponentType<LucideProps>;

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
  {
    label: "Allocation & Transfer",
    href: "/allocations",
    icon: ArrowLeftRight,
  },
  {
    label: "Resource Booking",
    href: "/bookings",
    icon: CalendarDays,
  },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Asset Audit", href: "/audit", icon: ClipboardCheck },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    allowedRoles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter nav items based on user role
  const filteredItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  if (!mounted) {
    return (
      <aside className="w-64 border-r border-border bg-card flex flex-col h-screen shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <span className="text-xl font-bold tracking-wider text-foreground">
            ASSETFLOW
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen shrink-0">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center px-6 border-b border-border gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Laptop className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-wider text-foreground">
          AssetFlow
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground/80 group-hover:text-foreground"
                )}
              />
              {item.label}

              {isActive && (
                <span className="absolute left-0 top-1/4 h-1/2 w-1 bg-primary-foreground rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-muted/50">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
