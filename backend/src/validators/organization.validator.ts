import { z } from "zod/v4";
import { Role, UserStatus } from "@prisma/client";

// ─── Department Validators ──────────────────────────────────

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  headId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").optional(),
  headId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

// ─── Category Validators ────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  customFields: z.record(z.string(), z.any()).nullable().optional(), // JSON key-value schema
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").optional(),
  customFields: z.record(z.string(), z.any()).nullable().optional(),
});

// ─── Employee Validators ────────────────────────────────────

export const promoteRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});
