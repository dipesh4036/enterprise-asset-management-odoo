import { Router } from "express";
import {
  createCycle,
  getCycles,
  getCycleById,
  assignAuditors,
  submitAuditEntry,
  closeCycle,
} from "../controllers/audit.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createAuditCycleSchema,
  assignAuditorsSchema,
  submitAuditEntrySchema,
} from "../validators/audit.validator";

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// ─── Audit Routes ───────────────────────────────────────────
router.post(
  "/",
  validate({ body: createAuditCycleSchema }),
  createCycle
);

router.get("/", getCycles);

router.get("/:id", getCycleById);

router.post(
  "/:id/assign",
  validate({ body: assignAuditorsSchema }),
  assignAuditors
);

router.post(
  "/:id/entries",
  validate({ body: submitAuditEntrySchema }),
  submitAuditEntry
);

router.post(
  "/:id/close",
  closeCycle
);

export default router;
