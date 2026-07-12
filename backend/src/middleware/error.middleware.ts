import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import logger from "../utils/logger";

// ─── Central Error Handler ─────────────────────────────────
// Catch-all error middleware — never expose stack traces in production

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorMiddleware(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  // Log the error (never log in response to client in prod)
  logger.error(`[${statusCode}] ${err.message}`, {
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  sendError(res, message, statusCode);
}

// ─── 404 Handler ───────────────────────────────────────────

export function notFoundMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

// ─── Async Error Wrapper ───────────────────────────────────
// Wraps async route handlers to catch errors and forward to error middleware

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
