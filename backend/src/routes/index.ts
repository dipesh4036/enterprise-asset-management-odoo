import { Router } from "express";
import notificationRoutes, { activityLogRouter } from "./notification.routes";

// ─── API Routes Index ──────────────────────────────────────
// All route files are mounted here under /api/v1

const router = Router();

// Routes will be mounted here as they are built:
import authRoutes from "./auth.routes";

// router.use("/dashboard", dashboardRoutes);
// import organizationRoutes from "./organization.routes";
// import assetRoutes from "./asset.routes";
// import allocationRoutes from "./allocation.routes";
// import bookingRoutes from "./booking.routes";
// import maintenanceRoutes from "./maintenance.routes";
// import auditRoutes from "./audit.routes";
// import reportRoutes from "./report.routes";

router.use("/auth", authRoutes);
// router.use("/dashboard", dashboardRoutes);
// router.use("/departments", organizationRoutes);
// router.use("/assets", assetRoutes);
// router.use("/allocations", allocationRoutes);
// router.use("/bookings", bookingRoutes);
// router.use("/maintenance", maintenanceRoutes);
// router.use("/audits", auditRoutes);
// router.use("/reports", reportRoutes);

router.use("/notifications", notificationRoutes);
router.use("/activity-logs", activityLogRouter);

export default router;

