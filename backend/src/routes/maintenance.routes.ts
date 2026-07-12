import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  raiseRequestSchema,
  assignTechnicianSchema,
  resolveRequestSchema,
} from "../validators/maintenance.validator";
import {
  raiseRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
} from "../controllers/maintenance.controller";

const router = Router();

// Apply authMiddleware globally to all maintenance routes
router.use(authMiddleware);

// Retrieve all maintenance requests (Authenticated: Admins, Managers, Heads, Employees)
router.get("/", getRequests);

// Raise a maintenance request (Authenticated: Admins, Managers, Heads, Employees)
router.post("/", validate({ body: raiseRequestSchema }), raiseRequest);

// Approve a request (Admin/Asset Manager only)
router.patch("/:id/approve", requireRole("ADMIN", "ASSET_MANAGER"), approveRequest);

// Reject a request (Admin/Asset Manager only)
router.patch(
  "/:id/reject",
  requireRole("ADMIN", "ASSET_MANAGER"),
  validate({ body: resolveRequestSchema }),
  rejectRequest
);

// Assign a technician to an approved request (Admin/Asset Manager only)
router.patch(
  "/:id/assign-technician",
  requireRole("ADMIN", "ASSET_MANAGER"),
  validate({ body: assignTechnicianSchema }),
  assignTechnician
);

// Technician marks work in progress (Assigned Technician, Asset Manager, or Admin)
router.patch("/:id/start-work", startWork);

// Resolve request (Assigned Technician, Asset Manager, or Admin)
router.patch(
  "/:id/resolve",
  validate({ body: resolveRequestSchema }),
  resolveRequest
);

export default router;
