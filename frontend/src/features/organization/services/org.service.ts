import { api } from "@/lib/axios";

export type UserStatus = "ACTIVE" | "INACTIVE";
export type Role = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";

export interface Department {
  id: string;
  name: string;
  headId: string | null;
  head?: {
    id: string;
    name: string;
    email: string;
  } | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    assets: number;
  };
}

export interface AssetCategory {
  id: string;
  name: string;
  customFields: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets: number;
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  departmentId: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department[];
}

export interface SingleDepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: AssetCategory[];
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: AssetCategory;
}

export interface EmployeeResponse {
  success: boolean;
  message: string;
  data: Employee[];
}

export interface SingleEmployeeResponse {
  success: boolean;
  message: string;
  data: Employee;
}

export const orgService = {
  // Departments
  async getDepartments(): Promise<DepartmentResponse> {
    const res = await api.get<DepartmentResponse>("/organization/departments");
    return res.data;
  },

  async createDepartment(data: { name: string; headId?: string | null; parentId?: string | null }): Promise<SingleDepartmentResponse> {
    const res = await api.post<SingleDepartmentResponse>("/organization/departments", data);
    return res.data;
  },

  async updateDepartment(id: string, data: { name: string; headId?: string | null; parentId?: string | null }): Promise<SingleDepartmentResponse> {
    const res = await api.put<SingleDepartmentResponse>(`/organization/departments/${id}`, data);
    return res.data;
  },

  async toggleDepartmentStatus(id: string, status: UserStatus): Promise<SingleDepartmentResponse> {
    const res = await api.patch<SingleDepartmentResponse>(`/organization/departments/${id}/status`, { status });
    return res.data;
  },

  // Categories
  async getCategories(): Promise<CategoryResponse> {
    const res = await api.get<CategoryResponse>("/organization/categories");
    return res.data;
  },

  async createCategory(data: { name: string; customFields?: Record<string, any> | null }): Promise<SingleCategoryResponse> {
    const res = await api.post<SingleCategoryResponse>("/organization/categories", data);
    return res.data;
  },

  async updateCategory(id: string, data: { name: string; customFields?: Record<string, any> | null }): Promise<SingleCategoryResponse> {
    const res = await api.put<SingleCategoryResponse>(`/organization/categories/${id}`, data);
    return res.data;
  },

  // Employees
  async getEmployees(): Promise<EmployeeResponse> {
    const res = await api.get<EmployeeResponse>("/organization/employees");
    return res.data;
  },

  async promoteEmployeeRole(id: string, role: Role): Promise<SingleEmployeeResponse> {
    const res = await api.patch<SingleEmployeeResponse>(`/organization/employees/${id}/role`, { role });
    return res.data;
  },

  async toggleEmployeeStatus(id: string, status: UserStatus): Promise<SingleEmployeeResponse> {
    const res = await api.patch<SingleEmployeeResponse>(`/organization/employees/${id}/status`, { status });
    return res.data;
  },
};
