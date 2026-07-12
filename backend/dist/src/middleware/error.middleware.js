"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
exports.notFoundMiddleware = notFoundMiddleware;
exports.asyncHandler = asyncHandler;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
function errorMiddleware(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error";
    // Log the error (never log in response to client in prod)
    logger_1.default.error(`[${statusCode}] ${err.message}`, {
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
    (0, response_1.sendError)(res, message, statusCode);
}
// ─── 404 Handler ───────────────────────────────────────────
function notFoundMiddleware(req, res, _next) {
    (0, response_1.sendError)(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error.middleware.js.map