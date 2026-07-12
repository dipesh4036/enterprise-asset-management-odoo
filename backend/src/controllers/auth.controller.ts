import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

// ─── Auth Controllers ──────────────────────────────────────

export const signup = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await authService.signup(req.body);
    sendSuccess(res, result, "Signup successful. Welcome!", 211);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    sendError(res, message, 400);
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful. Welcome back!", 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    sendError(res, message, 401);
  }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, user, "User profile retrieved successfully", 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve user profile";
    sendError(res, message, 400);
  }
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Since JWT is stateless and token is managed on the client,
  // logout just sends a success response to instruct the client
  // to clear credentials.
  sendSuccess(res, null, "Logout successful. Clear local storage/tokens.", 200);
});
