import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "../services/maintenance.service";
import { sendSuccess, sendError } from "../utils/response";
import { MaintenanceStatus, Priority } from "@prisma/client";

/**
 * Raises a new maintenance request
 */
export async function raiseRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { assetId, issue, priority, photoUrl } = req.body;
    const request = await maintenanceService.raiseRequest(
      req.user.id,
      assetId,
      issue,
      priority,
      photoUrl
    );

    sendSuccess(res, request, "Maintenance request raised successfully", 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Asset not found")) {
      sendError(res, error.message, 404);
      return;
    }
    next(error);
  }
}

/**
 * Retrieves all maintenance requests with optional filtering
 */
export async function getRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = req.query.status as MaintenanceStatus | undefined;
    const priority = req.query.priority as Priority | undefined;
    const assetId = req.query.assetId as string | undefined;

    const requests = await maintenanceService.getMaintenanceRequests({
      status,
      priority,
      assetId,
    });

    sendSuccess(res, requests, "Maintenance requests retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Approves a maintenance request (Admin/Asset Manager only)
 */
export async function approveRequest(
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
    const request = await maintenanceService.approveRequest(id, req.user.id);
    sendSuccess(res, request, "Maintenance request approved successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Cannot approve")) {
        sendError(res, error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * Rejects a maintenance request (Admin/Asset Manager only)
 */
export async function rejectRequest(
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
    const { notes } = req.body;
    const request = await maintenanceService.rejectRequest(id, notes, req.user.id);
    sendSuccess(res, request, "Maintenance request rejected successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Cannot reject")) {
        sendError(res, error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * Assigns a technician to an approved request (Admin/Asset Manager only)
 */
export async function assignTechnician(
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
    const { technicianId } = req.body;
    const request = await maintenanceService.assignTechnician(id, technicianId, req.user.id);
    sendSuccess(res, request, "Technician assigned successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Cannot assign") || error.message.includes("inactive")) {
        sendError(res, error.message, 400);
        return;
      }
    }
    next(error);
  }
}

/**
 * Starts work on a request (Assigned Technician, Asset Manager, or Admin only)
 */
export async function startWork(
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
    const request = await maintenanceService.startWork(id, req.user.id);
    sendSuccess(res, request, "Maintenance work started successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Cannot start")) {
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
 * Resolves a request (Assigned Technician, Asset Manager, or Admin only)
 */
export async function resolveRequest(
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
    const { notes } = req.body;
    const request = await maintenanceService.resolveRequest(id, notes, req.user.id);
    sendSuccess(res, request, "Maintenance request resolved successfully");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Cannot resolve")) {
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
