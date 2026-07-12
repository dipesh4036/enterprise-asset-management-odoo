"use client";

import { useAuthStore } from "@/store/auth.store";
import { Bell, LogOut, User as UserIcon, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/common/StatusBadge";

import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (theme === null) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              AssetFlow
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            AssetFlow
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </Link>

          {/* Theme Toggle Button */}
          {theme && (
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Divider */}
          <span className="h-6 w-px bg-border" />

          {/* User Profile Summary */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>

              {/* Avatar Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border border-border text-foreground">
                <UserIcon className="h-5 w-5" />
              </div>

              <StatusBadge status={user.role} className="hidden sm:inline-flex" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full transition-colors"
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
