"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
const database_1 = __importDefault(require("../config/database"));
const response_1 = require("../utils/response");
// ─── JWT Auth Middleware ────────────────────────────────────
// Verifies JWT token from Authorization header, attaches req.user
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            (0, response_1.sendError)(res, "Authentication required. Please provide a valid token.", 401);
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            (0, response_1.sendError)(res, "Authentication required. Please provide a valid token.", 401);
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        // Fetch full user from DB to ensure they still exist and are active
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                departmentId: true,
            },
        });
        if (!user) {
            (0, response_1.sendError)(res, "User not found. Token may be invalid.", 401);
            return;
        }
        if (user.status === "INACTIVE") {
            (0, response_1.sendError)(res, "Account is deactivated. Contact your administrator.", 403);
            return;
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId,
        };
        next();
    }
    catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            (0, response_1.sendError)(res, "Token has expired. Please login again.", 401);
            return;
        }
        if (error instanceof Error && error.name === "JsonWebTokenError") {
            (0, response_1.sendError)(res, "Invalid token. Please login again.", 401);
            return;
        }
        (0, response_1.sendError)(res, "Authentication failed.", 401);
    }
}
//# sourceMappingURL=auth.middleware.js.map