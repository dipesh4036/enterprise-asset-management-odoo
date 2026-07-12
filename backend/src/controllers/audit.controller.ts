import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuditEntryStatus } from "@prisma/client";

/**
 * Creates a new scoped audit cycle with assigned auditors
 */
export async function createCycle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { name, departmentId, location, startDate, endDate, auditorIds } = req.body;

    const cycle = await auditService.createAuditCycle(
      name,
      departmentId,
      location,
      new Date(startDate),
      new Date(endDate),
      auditorIds,
      req.user.id
    );

    sendSuccess(res, cycle, "Audit cycle created successfully", 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("No active assets")) {
      sendError(res, error.message, 400);
      return;
    }
    next(error);
  }
}

/**
 * Gets all audit cycles with metadata summaries
 */
export async function getCycles(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cycles = await auditService.getAuditCycles();
    sendSuccess(res, cycles, "Audit cycles retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets detailed info of a single audit cycle and checklist entries
 */
export async function getCycleById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const cycle = await auditService.getAuditCycleDetail(id);
    sendSuccess(res, cycle, "Audit cycle details retrieved successfully");
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

/**
 * Assigns new auditors to an active audit cycle
 */
export async function assignAuditors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const id = req.params.id as string;
    const { auditorIds } = req.body;

    const assignments = await auditService.assignAuditors(id, auditorIds);
    sendSuccess(res, assignments, "Auditors assigned successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Closed")) {
        sendError(res, error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * Submits an audit status check for a scoped asset (Auditors or Managers only)
 */
export async function submitAuditEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const id = req.params.id as string;
    const { assetId, status, notes } = req.body;

    const entry = await auditService.submitAuditEntry(
      id,
      assetId,
      status as AuditEntryStatus,
      notes,
      req.user.id
    );

    sendSuccess(res, entry, "Audit entry check submitted successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("closed") || error.message.includes("not found in this")) {
        sendError(res, error.message, 400);
        return;
      }
      if (error.message.includes("Access denied")) {
        sendError(res, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * Closes an audit cycle, updates asset statuses, and generates discrepancy reports
 */
export async function closeCycle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const id = req.params.id as string;
    const result = await auditService.closeAuditCycle(id, req.user.id);
    sendSuccess(res, result, "Audit cycle closed successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("unchecked") || error.message.includes("already closed")) {
        sendError(res, error.message, 400);
        return;
      }
    }
    next(error);
  }
}
