import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// ─── Role-Based Access Control Middleware ──────────────────
// Factory function: requireRole(...allowedRoles)
// Must be used AFTER authMiddleware

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required.", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}.`,
        403
      );
      return;
    }

    next();
  };
}
