import prisma from "../config/database";
import { Role, UserStatus } from "@prisma/client";
import { activityLogService } from "./activityLog.service";
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from "../config/constants";

export class OrganizationService {
  // ═══════════════════════════════════════
  // DEPARTMENTS
  // ═══════════════════════════════════════

  async getDepartments() {
    return prisma.department.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        headId: true,
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentId: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async createDepartment(
    userId: string,
    data: { name: string; headId?: string | null; parentId?: string | null }
  ) {
    // Validate head exists
    if (data.headId) {
      const head = await prisma.user.findUnique({ where: { id: data.headId } });
      if (!head) throw new Error("Assigned department head does not exist");
    }

    // Validate parent exists
    if (data.parentId) {
      const parent = await prisma.department.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new Error("Parent department does not exist");
    }

    const dept = await prisma.department.create({
      data: {
        name: data.name,
        headId: data.headId || null,
        parentId: data.parentId || null,
        status: UserStatus.ACTIVE,
      },
    });

    await activityLogService.logActivity(
      userId,
      ACTIVITY_ACTIONS.USER_ROLE_UPDATED, // Use generic action or log department action
      ENTITY_TYPES.DEPARTMENT,
      dept.id,
      { name: dept.name }
    );

    return dept;
  }

  async updateDepartment(
    userId: string,
    id: string,
    data: { name?: string; headId?: string | null; parentId?: string | null }
  ) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new Error("Department not found");

    if (data.headId) {
      const head = await prisma.user.findUnique({ where: { id: data.headId } });
      if (!head) throw new Error("Assigned department head does not exist");
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new Error("A department cannot be its own parent");
      }
      const parent = await prisma.department.findUnique({ where: { id: data.parentId } });
      if (!parent) throw new Error("Parent department does not exist");
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        headId: data.headId !== undefined ? data.headId : undefined,
        parentId: data.parentId !== undefined ? data.parentId : undefined,
      },
    });

    await activityLogService.logActivity(
      userId,
      "DEPARTMENT_UPDATED",
      ENTITY_TYPES.DEPARTMENT,
      updated.id,
      { name: updated.name }
    );

    return updated;
  }

  async toggleDepartmentStatus(userId: string, id: string, status: UserStatus) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) throw new Error("Department not found");

    const updated = await prisma.department.update({
      where: { id },
      data: { status },
    });

    await activityLogService.logActivity(
      userId,
      "DEPARTMENT_STATUS_TOGGLED",
      ENTITY_TYPES.DEPARTMENT,
      updated.id,
      { name: updated.name, status }
    );

    return updated;
  }

  // ═══════════════════════════════════════
  // CATEGORIES
  // ═══════════════════════════════════════

  async getCategories() {
    return prisma.assetCategory.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createCategory(userId: string, data: { name: string; customFields?: any }) {
    const existing = await prisma.assetCategory.findUnique({ where: { name: data.name } });
    if (existing) throw new Error("Category name already exists");

    const category = await prisma.assetCategory.create({
      data: {
        name: data.name,
        customFields: data.customFields || null,
      },
    });

    await activityLogService.logActivity(
      userId,
      "CATEGORY_CREATED",
      ENTITY_TYPES.CATEGORY,
      category.id,
      { name: category.name }
    );

    return category;
  }

  async updateCategory(userId: string, id: string, data: { name?: string; customFields?: any }) {
    const existing = await prisma.assetCategory.findUnique({ where: { id } });
    if (!existing) throw new Error("Category not found");

    if (data.name && data.name !== existing.name) {
      const nameDuplicate = await prisma.assetCategory.findUnique({ where: { name: data.name } });
      if (nameDuplicate) throw new Error("Category name already in use");
    }

    const updated = await prisma.assetCategory.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        customFields: data.customFields !== undefined ? data.customFields : undefined,
      },
    });

    await activityLogService.logActivity(
      userId,
      "CATEGORY_UPDATED",
      ENTITY_TYPES.CATEGORY,
      updated.id,
      { name: updated.name }
    );

    return updated;
  }

  // ═══════════════════════════════════════
  // EMPLOYEES
  // ═══════════════════════════════════════

  async getEmployees() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async promoteEmployeeRole(adminId: string, id: string, newRole: Role) {
    if (adminId === id) {
      throw new Error("Admin cannot update their own role");
    }

    if (newRole === Role.ADMIN) {
      throw new Error("Cannot promote a user to ADMIN role via this route");
    }

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new Error("Employee not found");

    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await activityLogService.logActivity(
      adminId,
      ACTIVITY_ACTIONS.USER_ROLE_UPDATED,
      ENTITY_TYPES.USER,
      updated.id,
      { email: updated.email, oldRole: employee.role, newRole }
    );

    return updated;
  }

  async toggleEmployeeStatus(adminId: string, id: string, status: UserStatus) {
    if (adminId === id) {
      throw new Error("Admin cannot toggle their own active status");
    }

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new Error("Employee not found");

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    await activityLogService.logActivity(
      adminId,
      ACTIVITY_ACTIONS.USER_STATUS_UPDATED,
      ENTITY_TYPES.USER,
      updated.id,
      { email: updated.email, status }
    );

    return updated;
  }
}

export const organizationService = new OrganizationService();
