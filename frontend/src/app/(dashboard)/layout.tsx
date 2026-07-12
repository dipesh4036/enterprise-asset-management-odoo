"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import RoleGuard from "@/components/layout/RoleGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-900/40">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
