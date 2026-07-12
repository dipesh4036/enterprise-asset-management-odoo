import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../config/database";
import { sendError } from "../utils/response";

// ─── Extend Express Request with user info ─────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        departmentId: string | null;
      };
    }
  }
}

// ─── JWT Auth Middleware ────────────────────────────────────
// Verifies JWT token from Authorization header, attaches req.user

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Authentication required. Please provide a valid token.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      sendError(res, "Authentication required. Please provide a valid token.", 401);
      return;
    }

    const decoded = verifyToken(token);

    // Fetch full user from DB to ensure they still exist and are active
    const user = await prisma.user.findUnique({
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
      sendError(res, "User not found. Token may be invalid.", 401);
      return;
    }

    if (user.status === "INACTIVE") {
      sendError(res, "Account is deactivated. Contact your administrator.", 403);
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
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      sendError(res, "Token has expired. Please login again.", 401);
      return;
    }
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      sendError(res, "Invalid token. Please login again.", 401);
      return;
    }
    sendError(res, "Authentication failed.", 401);
  }
}
