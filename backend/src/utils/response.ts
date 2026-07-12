import { Response } from "express";

// ─── Consistent API Response Format ────────────────────────

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown | null;
  timestamp: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message = "Internal Server Error",
  statusCode = 500,
  errors: unknown = null
): void {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success"
): void {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    errors: null,
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
}
