import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

// ─── Dashboard Controllers ─────────────────────────────────

export const getKpis = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const kpis = await dashboardService.getKpis(req.user);
    sendSuccess(res, kpis, "Dashboard KPIs retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve KPIs";
    sendError(res, message, 400);
  }
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const activity = await dashboardService.getRecentActivity(req.user);
    sendSuccess(res, activity, "Recent activity logs retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve recent activity";
    sendError(res, message, 400);
  }
});
