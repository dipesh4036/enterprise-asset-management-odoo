"use client";

import { useAuthStore } from "@/store/auth.store";
import { Bell, LogOut, User as UserIcon, Sun, Moon, ChevronDown, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/common/StatusBadge";

import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="flex h-16 items-center justify-end px-6">
          <div className="flex items-center gap-4" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-end px-6">
        <div className="flex items-center gap-3">
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

          {/* Profile Dropdown */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                title="Profile"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <UserIcon className="h-5 w-5" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary shrink-0">
                        <UserIcon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Role:</span>
                      <StatusBadge status={user.role} />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Logout */}
                  <div className="px-2 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
