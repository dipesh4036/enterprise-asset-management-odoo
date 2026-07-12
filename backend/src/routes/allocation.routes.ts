import { Router } from "express";
import {
  createAllocation,
  returnAsset,
  getOverdueAllocations,
} from "../controllers/allocation.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAllocationSchema, returnAllocationSchema } from "../validators/allocation.validator";
import { Role } from "@prisma/client";

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// ─── Overdue Allocations (Global/Managers) ───────────────────
router.get("/overdue", getOverdueAllocations);

// ─── Allocate Asset (Managers Only) ─────────────────────────
router.post(
  "/",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD),
  validate({ body: createAllocationSchema }),
  createAllocation
);

// ─── Return Asset (Managers/Auditors/Admins) ─────────────────
router.post(
  "/:id/return",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD),
  validate({ body: returnAllocationSchema }),
  returnAsset
);

export default router;
