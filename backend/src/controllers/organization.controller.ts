import { Request, Response } from "express";
import { organizationService } from "../services/organization.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

// ─── Department Controllers ────────────────────────────────

export const getDepartments = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const depts = await organizationService.getDepartments();
    sendSuccess(res, depts, "Departments retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve departments";
    sendError(res, message, 400);
  }
});

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const dept = await organizationService.createDepartment(req.user.id, req.body);
    sendSuccess(res, dept, "Department created successfully", 211);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create department";
    sendError(res, message, 400);
  }
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const dept = await organizationService.updateDepartment(req.user.id, req.params.id as string, req.body);
    sendSuccess(res, dept, "Department updated successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update department";
    sendError(res, message, 400);
  }
});

export const toggleDepartmentStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const dept = await organizationService.toggleDepartmentStatus(req.user.id, req.params.id as string, req.body.status);
    sendSuccess(res, dept, `Department status updated to ${req.body.status} successfully`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update department status";
    sendError(res, message, 400);
  }
});

// ─── Category Controllers ──────────────────────────────────

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const categories = await organizationService.getCategories();
    sendSuccess(res, categories, "Categories retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve categories";
    sendError(res, message, 400);
  }
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const category = await organizationService.createCategory(req.user.id, req.body);
    sendSuccess(res, category, "Category created successfully", 211);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    sendError(res, message, 400);
  }
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const category = await organizationService.updateCategory(req.user.id, req.params.id as string, req.body);
    sendSuccess(res, category, "Category updated successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    sendError(res, message, 400);
  }
});

// ─── Employee Controllers ──────────────────────────────────

export const getEmployees = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const employees = await organizationService.getEmployees();
    sendSuccess(res, employees, "Employees directory retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve employees";
    sendError(res, message, 400);
  }
});

export const promoteEmployeeRole = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const employee = await organizationService.promoteEmployeeRole(req.user.id, req.params.id as string, req.body.role);
    sendSuccess(res, employee, `Employee promoted to role ${req.body.role} successfully`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to promote employee role";
    sendError(res, message, 400);
  }
});

export const toggleEmployeeStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const employee = await organizationService.toggleEmployeeStatus(req.user.id, req.params.id as string, req.body.status);
    sendSuccess(res, employee, `Employee status updated to ${req.body.status} successfully`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update employee status";
    sendError(res, message, 400);
  }
});
