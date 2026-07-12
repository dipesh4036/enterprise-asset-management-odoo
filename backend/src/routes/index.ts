import { Router } from "express";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import organizationRoutes from "./organization.routes";
import assetRoutes from "./asset.routes";
import allocationRoutes from "./allocation.routes";
import transferRoutes from "./transfer.routes";
import bookingRoutes from "./booking.routes";
import maintenanceRoutes from "./maintenance.routes";
import auditRoutes from "./audit.routes";
import reportRoutes from "./report.routes";
import notificationRoutes, { activityLogRouter } from "./notification.routes";

// ─── API Routes Index ──────────────────────────────────────
// All route files are mounted here under /api/v1

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/organization", organizationRoutes);
router.use("/", organizationRoutes);
router.use("/assets", assetRoutes);
router.use("/allocations", allocationRoutes);
router.use("/transfers", transferRoutes);
router.use("/bookings", bookingRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/audits", auditRoutes);
router.use("/reports", reportRoutes);
router.use("/notifications", notificationRoutes);
router.use("/activity-logs", activityLogRouter);

export default router;
