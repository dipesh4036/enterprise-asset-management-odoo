"use client";

import { useState, useEffect } from "react";
import { useAssets } from "@/features/assets/hooks/useAssets";
import { useCategories, useDepartments } from "@/features/organization/hooks/useOrg";
import { useAuthStore } from "@/store/auth.store";
import { Asset, AssetStatus } from "@/features/assets/services/asset.service";
import DataTable, { Column } from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Laptop,
  PlusCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function AssetDirectoryPage() {
  const { user } = useAuthStore();
  const canRegister = user?.role === "ADMIN" || user?.role === "ASSET_MANAGER";

  // Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<AssetStatus | "">("");
  const [departmentId, setDepartmentId] = useState("");
  const [location, setLocation] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch dropdown data
  const { data: categoriesResponse } = useCategories();
  const { data: deptsResponse } = useDepartments();
  const categories = categoriesResponse?.data || [];
  const departments = deptsResponse?.data || [];

  // Fetch assets
  const { data: assetsResponse, isLoading, refetch } = useAssets({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    status: status || undefined,
    departmentId: departmentId || undefined,
    location: location || undefined,
  });

  const assets = assetsResponse?.data?.assets || [];

  const handleClearFilters = () => {
    setSearch("");
    setCategoryId("");
    setStatus("");
    setDepartmentId("");
    setLocation("");
  };

  const columns: Column<Asset>[] = [
    {
      header: "Asset Tag",
      accessor: (row) => (
        <span className="font-bold text-xs uppercase tracking-wide px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
          {row.assetTag}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Name",
      accessor: (row) => (
        <Link
          href={`/assets/${row.id}`}
          className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          {row.name}
        </Link>
      ),
      sortable: true,
    },
    {
      header: "Category",
      accessor: (row) => row.category?.name || <span className="text-zinc-400">N/A</span>,
    },
    {
      header: "Department",
      accessor: (row) => row.department?.name || <span className="text-zinc-400">Unassigned</span>,
    },
    {
      header: "Location",
      accessor: "location",
    },
    {
      header: "Condition",
      accessor: (row) => (
        <span className={cn(
          "text-xs font-semibold",
          row.condition === "Good" && "text-emerald-600 dark:text-emerald-400",
          row.condition === "Fair" && "text-amber-600 dark:text-amber-400",
          row.condition === "Poor" && "text-rose-600 dark:text-rose-400"
        )}>
          {row.condition}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          status={row.status}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Link href={`/assets/${row.id}`}>
          <Button variant="ghost" size="sm" className="cursor-pointer" title="View details">
            <Eye className="h-4 w-4 mr-1.5" />
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Laptop className="h-6 w-6 text-zinc-650" />
            Asset Registry
          </h1>
          <p className="text-sm text-zinc-505 dark:text-zinc-400">
            View, search, and register hardware, devices, or virtual infrastructure assets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canRegister && (
            <Link href="/assets?register=true">
              <Button size="sm" className="cursor-pointer font-medium">
                <PlusCircle className="mr-1.5 h-4.5 w-4.5" />
                Register Asset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <Filter className="h-4 w-4" />
          Search & Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name, tag, serial number..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category */}
          <select
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus | "")}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="RESERVED">Reserved</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="LOST">Lost</option>
            <option value="RETIRED">Retired</option>
            <option value="DISPOSED">Disposed</option>
          </select>

          {/* Department */}
          <select
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Extra Filters / Clear */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-850">
          <div className="relative max-w-xs w-full">
            <Input
              type="text"
              placeholder="Filter by Location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          {(search || categoryId || status || departmentId || location) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-zinc-550 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer h-8"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Asset Table */}
      <DataTable
        data={assets}
        columns={columns}
        searchPlaceholder="Filter assets locally..."
        searchKey="name"
        isLoading={isLoading}
      />
    </div>
  );
}
