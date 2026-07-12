import { Router } from "express";
import notificationRoutes, { activityLogRouter } from "./notification.routes";
import maintenanceRoutes from "./maintenance.routes";

// ─── API Routes Index ──────────────────────────────────────
// All route files are mounted here under /api/v1

const router = Router();

// Routes will be mounted here as they are built:
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import organizationRoutes from "./organization.routes";

import assetRoutes from "./asset.routes";
import allocationRoutes from "./allocation.routes";
import transferRoutes from "./transfer.routes";
// import bookingRoutes from "./booking.routes";
// import auditRoutes from "./audit.routes";
// import reportRoutes from "./report.routes";

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/", organizationRoutes);
router.use("/assets", assetRoutes);
router.use("/allocations", allocationRoutes);
router.use("/transfers", transferRoutes);
// router.use("/bookings", bookingRoutes);
router.use("/maintenance", maintenanceRoutes);
// router.use("/audits", auditRoutes);
// router.use("/reports", reportRoutes);

router.use("/notifications", notificationRoutes);
router.use("/activity-logs", activityLogRouter);

export default router;

