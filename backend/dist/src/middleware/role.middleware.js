"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const response_1 = require("../utils/response");
// ─── Role-Based Access Control Middleware ──────────────────
// Factory function: requireRole(...allowedRoles)
// Must be used AFTER authMiddleware
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, "Authentication required.", 401);
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, response_1.sendError)(res, `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}.`, 403);
            return;
        }
        next();
    };
}
//# sourceMappingURL=role.middleware.js.map