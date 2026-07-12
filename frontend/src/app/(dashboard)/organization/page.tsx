"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import DepartmentsTab from "@/features/organization/components/DepartmentsTab";
import CategoriesTab from "@/features/organization/components/CategoriesTab";
import EmployeesTab from "@/features/organization/components/EmployeesTab";
import { Building2, Layers, Users, ShieldAlert } from "lucide-react";
import { cn } from "@/utils/cn";

export default function OrganizationPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "employees">("departments");

  // Auth access restriction: Organization setup is only allowed for ADMIN and ASSET_MANAGER roles
  if (user && user.role !== "ADMIN" && user.role !== "ASSET_MANAGER") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Denied</h2>
        <p className="text-sm text-zinc-505 dark:text-zinc-400 max-w-md">
          You do not have the necessary administrative privileges to view or manage organization configurations.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: "departments" as const,
      label: "Departments",
      icon: Building2,
    },
    {
      id: "categories" as const,
      label: "Asset Categories",
      icon: Layers,
    },
    {
      id: "employees" as const,
      label: "Employee Directory",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Organization Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage corporate structure, custom categories, and personnel roles.
        </p>
      </div>

      {/* Tabs navigation list */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all duration-200 cursor-pointer -mb-px",
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50 font-bold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Render active tab content */}
      <div className="pt-2">
        {activeTab === "departments" && <DepartmentsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "employees" && <EmployeesTab />}
      </div>
    </div>
  );
}
