"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useEmployees,
  usePromoteEmployeeRole,
  useToggleEmployeeStatus,
} from "../hooks/useOrg";
import { Employee, Role } from "../services/org.service";
import DataTable, { Column } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuthStore } from "@/store/auth.store";
import { Shield, UserCog, ToggleLeft, ToggleRight, Users } from "lucide-react";

interface RoleFormInputs {
  role: Role;
}

export default function EmployeesTab() {
  const { user: currentUser } = useAuthStore();
  const { data: empResponse, isLoading: empsLoading } = useEmployees();
  
  const promoteRoleMutation = usePromoteEmployeeRole();
  const toggleStatusMutation = useToggleEmployeeStatus();

  const employees = empResponse?.data || [];

  // States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);

  const { register, handleSubmit, reset } = useForm<RoleFormInputs>({
    defaultValues: {
      role: "EMPLOYEE",
    },
  });

  const openRoleModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    reset({
      role: emp.role,
    });
    setIsRoleModalOpen(true);
  };

  const onRoleSubmit = (data: RoleFormInputs) => {
    if (!selectedEmployee) return;
    promoteRoleMutation.mutate(
      { id: selectedEmployee.id, role: data.role },
      {
        onSuccess: () => {
          toast.success(`Role updated successfully for ${selectedEmployee.name}`);
          setIsRoleModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update role");
        },
      }
    );
  };

  const handleToggleStatus = (emp: Employee) => {
    // Prevent self-deactivation
    if (emp.id === currentUser?.id) {
      toast.error("You cannot deactivate your own account!");
      return;
    }

    if (emp.status === "ACTIVE") {
      setDeactivatingEmployee(emp);
    } else {
      toggleStatusMutation.mutate(
        { id: emp.id, status: "ACTIVE" },
        {
          onSuccess: () => {
            toast.success(`Account activated for ${emp.name}`);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to activate employee");
          },
        }
      );
    }
  };

  const confirmDeactivate = () => {
    if (!deactivatingEmployee) return;
    toggleStatusMutation.mutate(
      { id: deactivatingEmployee.id, status: "INACTIVE" },
      {
        onSuccess: () => {
          toast.success(`Account deactivated for ${deactivatingEmployee.name}`);
          setDeactivatingEmployee(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to deactivate employee");
        },
      }
    );
  };

  const isAdmin = currentUser?.role === "ADMIN";

  const columns: Column<Employee>[] = [
    {
      header: "Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
    },
    {
      header: "Department",
      accessor: (row) => row.department?.name || <span className="text-zinc-400">Unassigned</span>,
    },
    {
      header: "Role",
      accessor: (row) => (
        <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
          <Shield className="h-3.5 w-3.5 text-indigo-500" />
          {row.role.replace(/_/g, " ")}
        </span>
      ),
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
      accessor: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openRoleModal(row)}
                className="cursor-pointer"
                title="Change Role"
              >
                <UserCog className="h-4 w-4" />
              </Button>
            )}
            {isAdmin && !isSelf && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(row)}
                className="cursor-pointer text-zinc-550 hover:text-zinc-900 dark:hover:text-zinc-100"
                title={row.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
              >
                {row.status === "ACTIVE" ? (
                  <ToggleRight className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-zinc-400" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Personnel Directory
        </h2>
      </div>

      <DataTable
        data={employees}
        columns={columns}
        searchPlaceholder="Search employees by name or email..."
        searchKey="name"
        isLoading={empsLoading}
        emptyState={
          <EmptyState
            icon={<Users className="h-8 w-8 text-zinc-400" />}
            title="No Employees Found"
            description="There are no registered personnel matching your search term."
          />
        }
      />

      {/* Role Promotion Modal (Admin Only) */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Role: {selectedEmployee?.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onRoleSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Select New Access Role
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                {...register("role")}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ASSET_MANAGER">Asset Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
              <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
                Elevating role permissions yields complete dashboard visibility adjustments and feature actions accessibility across tabs.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={promoteRoleMutation.isPending}>
                Save Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <ConfirmDialog
        isOpen={deactivatingEmployee !== null}
        onClose={() => setDeactivatingEmployee(null)}
        onConfirm={confirmDeactivate}
        title="Deactivate Account?"
        description={`Are you sure you want to deactivate the user account of "${deactivatingEmployee?.name}" (${deactivatingEmployee?.email})? This employee will not be able to log in or access any asset portal tools.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
