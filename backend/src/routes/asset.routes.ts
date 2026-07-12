import { Router } from "express";
import {
  getAssets,
  createAsset,
  getAssetById,
  updateAsset,
  getAllocationHistory,
  getMaintenanceHistory,
} from "../controllers/asset.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import { createAssetSchema, updateAssetSchema } from "../validators/asset.validator";
import { Role } from "@prisma/client";

const router = Router();

// Apply auth middleware to all asset endpoints
router.use(authMiddleware);

// ─── Publicly Viewable Asset Routes ─────────────────────────
router.get("/", getAssets);
router.get("/:id", getAssetById);
router.get("/:id/allocation-history", getAllocationHistory);
router.get("/:id/maintenance-history", getMaintenanceHistory);

// ─── Restricted Modify Asset Routes ─────────────────────────
router.post(
  "/",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER),
  validate({ body: createAssetSchema }),
  createAsset
);
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.ASSET_MANAGER),
  validate({ body: updateAssetSchema }),
  updateAsset
);

export default router;
