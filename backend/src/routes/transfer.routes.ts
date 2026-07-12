import { Router } from "express";
import {
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  getTransferRequests,
} from "../controllers/allocation.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createTransferSchema } from "../validators/allocation.validator";
import { Role } from "@prisma/client";

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// ─── Get Transfer Requests (Any Authenticated User) ──────────
router.get("/", getTransferRequests);

// ─── Request Transfer (Any Authenticated User) ───────────────
router.post(
  "/",
  validate({ body: createTransferSchema }),
  requestTransfer
);

// ─── Approve/Reject Transfer (Managers Only) ─────────────────
router.patch(
  "/:id/approve",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD),
  approveTransfer
);

router.patch(
  "/:id/reject",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPARTMENT_HEAD),
  rejectTransfer
);

export default router;
