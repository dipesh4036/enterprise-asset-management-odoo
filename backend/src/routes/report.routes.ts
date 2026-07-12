import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getUtilization,
  getMaintenanceFrequency,
  getIdleAssets,
  getBookingHeatmap,
  getDepartmentSummary,
  getDueMaintenance,
  exportCSV,
} from "../controllers/report.controller";

const router = Router();

// Apply authMiddleware globally to all reports routes
router.use(authMiddleware);

// Endpoint definitions
router.get("/utilization", getUtilization);
router.get("/maintenance-frequency", getMaintenanceFrequency);
router.get("/idle-assets", getIdleAssets);
router.get("/booking-heatmap", getBookingHeatmap);
router.get("/department-summary", getDepartmentSummary);
router.get("/due-maintenance", getDueMaintenance);
router.get("/export", exportCSV);

export default router;
