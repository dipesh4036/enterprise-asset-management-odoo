import { Router } from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  getCategories,
  createCategory,
  updateCategory,
  getEmployees,
  promoteEmployeeRole,
  toggleEmployeeStatus,
} from "../controllers/organization.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createCategorySchema,
  updateCategorySchema,
  promoteRoleSchema,
  updateStatusSchema,
} from "../validators/organization.validator";
import { Role } from "@prisma/client";

const router = Router();

// Apply auth middleware to all organization endpoints
router.use(authMiddleware);

// ─── Department Routes ──────────────────────────────────────
router.get("/departments", getDepartments);
router.post(
  "/departments",
  requireRole(Role.ADMIN),
  validate({ body: createDepartmentSchema }),
  createDepartment
);
router.put(
  "/departments/:id",
  requireRole(Role.ADMIN),
  validate({ body: updateDepartmentSchema }),
  updateDepartment
);
router.patch(
  "/departments/:id/status",
  requireRole(Role.ADMIN),
  validate({ body: updateStatusSchema }),
  toggleDepartmentStatus
);

// ─── Category Routes ────────────────────────────────────────
router.get("/categories", getCategories);
router.post(
  "/categories",
  requireRole(Role.ADMIN),
  validate({ body: createCategorySchema }),
  createCategory
);
router.put(
  "/categories/:id",
  requireRole(Role.ADMIN),
  validate({ body: updateCategorySchema }),
  updateCategory
);

// ─── Employee Routes ────────────────────────────────────────
router.get(
  "/employees",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER),
  getEmployees
);
router.patch(
  "/employees/:id/role",
  requireRole(Role.ADMIN),
  validate({ body: promoteRoleSchema }),
  promoteEmployeeRole
);
router.patch(
  "/employees/:id/status",
  requireRole(Role.ADMIN),
  validate({ body: updateStatusSchema }),
  toggleEmployeeStatus
);

export default router;
