import { Router } from "express";
import { getKpis, getRecentActivity } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Apply auth middleware to all dashboard endpoints
router.use(authMiddleware);

router.get("/kpis", getKpis);
router.get("/recent-activity", getRecentActivity);

export default router;
