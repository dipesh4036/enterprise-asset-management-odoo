import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orgService, UserStatus, Role } from "../services/org.service";

export function useDepartments() {
  return useQuery({
    queryKey: ["org-departments"],
    queryFn: () => orgService.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; headId?: string | null; parentId?: string | null }) =>
      orgService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; headId?: string | null; parentId?: string | null } }) =>
      orgService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-departments"] });
    },
  });
}

export function useToggleDepartmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      orgService.toggleDepartmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-departments"] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["org-categories"],
    queryFn: () => orgService.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; customFields?: Record<string, any> | null }) =>
      orgService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; customFields?: Record<string, any> | null } }) =>
      orgService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-categories"] });
    },
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ["org-employees"],
    queryFn: () => orgService.getEmployees(),
  });
}

export function usePromoteEmployeeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      orgService.promoteEmployeeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-employees"] });
    },
  });
}

export function useToggleEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      orgService.toggleEmployeeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-employees"] });
    },
  });
}
