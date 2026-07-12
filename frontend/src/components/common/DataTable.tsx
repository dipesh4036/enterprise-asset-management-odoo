"use client";

import { useState, ReactNode } from "react";
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  sortKey?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onSearch?: (value: string) => void;
  actions?: ReactNode;
  isLoading?: boolean;
}

export default function DataTable<T>({
  data = [],
  columns = [],
  searchPlaceholder = "Search...",
  searchKey,
  onSearch,
  actions,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }
    setCurrentPage(1);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    const key = (column.sortKey || String(column.accessor)) as string;
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter local data if searchKey provided and no external onSearch handler
  const filteredData = data.filter((item) => {
    if (onSearch || !searchKey || !searchTerm) return true;
    const val = item[searchKey];
    if (val === null || val === undefined) return false;
    return String(val).toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const key = sortConfig.key;
    let valA = a[key as keyof T];
    let valB = b[key as keyof T];

    if (typeof valA === "string") valA = valA.toLowerCase() as any;
    if (typeof valB === "string") valB = valB.toLowerCase() as any;

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const renderCell = (row: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    const val = row[column.accessor];
    return val === null || val === undefined ? "-" : String(val);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        {searchKey || onSearch ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        ) : (
          <div />
        )}
        {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{actions}</div>}
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    "px-6 py-4 font-semibold select-none",
                    column.sortable && "cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig?.key === (column.sortKey || column.accessor) && (
                      sortConfig.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-8 text-center text-zinc-550">
                  <span className="inline-flex items-center gap-2 text-zinc-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-650" />
                    Loading...
                  </span>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="px-6 py-8 text-center text-zinc-500">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/10">
            <span className="text-xs text-zinc-550 dark:text-zinc-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                className="p-1.5 border border-zinc-205 dark:border-zinc-795 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                className="p-1.5 border border-zinc-205 dark:border-zinc-795 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
