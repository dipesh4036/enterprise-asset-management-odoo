"use client";

import { useAuthStore } from "@/store/auth.store";
import { Bell, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/common/StatusBadge";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            AssetFlow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </Link>

          {/* Divider */}
          <span className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* User Profile Summary */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </span>
              </div>

              {/* Avatar Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                <UserIcon className="h-5 w-5" />
              </div>

              <StatusBadge status={user.role} className="hidden sm:inline-flex" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
