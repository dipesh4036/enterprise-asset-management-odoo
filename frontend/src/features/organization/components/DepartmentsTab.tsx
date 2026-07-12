"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useToggleDepartmentStatus,
  useEmployees,
} from "../hooks/useOrg";
import { Department } from "../services/org.service";
import DataTable, { Column } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import StatusBadge from "@/components/common/StatusBadge";
import { PlusCircle, Edit2, ShieldAlert, Building2 } from "lucide-react";

interface FormInputs {
  name: string;
  headId: string;
  parentId: string;
}

export default function DepartmentsTab() {
  const { data: deptResponse, isLoading: deptsLoading } = useDepartments();
  const { data: empResponse } = useEmployees();
  
  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const toggleDeptStatusMutation = useToggleDepartmentStatus();

  const departments = deptResponse?.data || [];
  const employees = empResponse?.data || [];

  // Dialog and Confirm States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deactivatingDept, setDeactivatingDept] = useState<Department | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      name: "",
      headId: "",
      parentId: "",
    },
  });

  const openCreateModal = () => {
    setEditingDept(null);
    reset({
      name: "",
      headId: "",
      parentId: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    reset({
      name: dept.name,
      headId: dept.headId || "",
      parentId: dept.parentId || "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: FormInputs) => {
    const payload = {
      name: data.name,
      headId: data.headId || null,
      parentId: data.parentId || null,
    };

    if (editingDept) {
      updateDeptMutation.mutate(
        { id: editingDept.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Department updated successfully");
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update department");
          },
        }
      );
    } else {
      createDeptMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Department created successfully");
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create department");
        },
      });
    }
  };

  const handleToggleStatus = (dept: Department) => {
    if (dept.status === "ACTIVE") {
      setDeactivatingDept(dept);
    } else {
      toggleDeptStatusMutation.mutate(
        { id: dept.id, status: "ACTIVE" },
        {
          onSuccess: () => {
            toast.success("Department activated successfully");
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to toggle status");
          },
        }
      );
    }
  };

  const confirmDeactivate = () => {
    if (!deactivatingDept) return;
    toggleDeptStatusMutation.mutate(
      { id: deactivatingDept.id, status: "INACTIVE" },
      {
        onSuccess: () => {
          toast.success("Department deactivated successfully");
          setDeactivatingDept(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to toggle status");
        },
      }
    );
  };

  const columns: Column<Department>[] = [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Manager",
      accessor: (row) => row.head?.name || <span className="text-zinc-400">Not assigned</span>,
    },
    {
      header: "Parent",
      accessor: (row) => row.parent?.name || <span className="text-zinc-400">None</span>,
    },
    {
      header: "Employees",
      accessor: (row) => row._count?.employees ?? 0,
    },
    {
      header: "Assets",
      accessor: (row) => row._count?.assets ?? 0,
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          status={row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} className="cursor-pointer">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(row)}
            className="cursor-pointer"
          >
            {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Departments Setup
        </h2>
        <Button onClick={openCreateModal} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        searchPlaceholder="Search departments..."
        searchKey="name"
        isLoading={deptsLoading}
        emptyState={
          <EmptyState
            icon={<Building2 className="h-8 w-8 text-zinc-400" />}
            title="No Departments Setup"
            description="Create your company's corporate structure by adding your first department."
            action={
              <Button size="sm" onClick={openCreateModal} className="cursor-pointer">
                Add Department
              </Button>
            }
          />
        }
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDept ? "Edit Department" : "Create Department"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Department Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Engineering"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Department Head / Manager
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                  {...register("headId")}
                >
                  <option value="">None (Unassigned)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Parent Department
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                  {...register("parentId")}
                >
                  <option value="">None (Top-Level)</option>
                  {departments
                    .filter((d) => !editingDept || d.id !== editingDept.id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDeptMutation.isPending || updateDeptMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={deactivatingDept !== null}
        onClose={() => setDeactivatingDept(null)}
        onConfirm={confirmDeactivate}
        title="Deactivate Department?"
        description={`Are you sure you want to deactivate the department "${deactivatingDept?.name}"? Employees within this department will remain, but new assets cannot be allocated to a deactivated department.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
