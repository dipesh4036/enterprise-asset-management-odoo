import { Request, Response } from "express";
import { allocationService } from "../services/allocation.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";

// ─── Allocation Controllers ──────────────────────────────────────

export const createAllocation = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { assetId, employeeId, expectedReturnAt } = req.body;
    const result = await allocationService.createAllocation(req.user.id, {
      assetId,
      employeeId,
      expectedReturnAt: expectedReturnAt ? new Date(expectedReturnAt) : undefined,
    });

    if (result.conflict) {
      res.status(409).json({
        success: false,
        message: `Asset is currently allocated to ${result.holder!.name} (${result.holder!.department})`,
        data: {
          holder: result.holder,
          canRequestTransfer: result.canRequestTransfer,
        },
        errors: {
          conflict: "Asset already allocated",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    sendSuccess(res, result.allocation, "Asset allocated successfully", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create allocation";
    sendError(res, message, 400);
  }
});

export const returnAsset = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { conditionNotes } = req.body;
    const allocation = await allocationService.returnAsset(
      req.user.id,
      req.params.id as string,
      conditionNotes
    );

    sendSuccess(res, allocation, "Asset returned successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to return asset";
    sendError(res, message, 400);
  }
});

export const getOverdueAllocations = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const overdue = await allocationService.getOverdueAllocations();
    sendSuccess(res, overdue, "Overdue allocations retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve overdue allocations";
    sendError(res, message, 400);
  }
});

// ─── Transfer Controllers ───────────────────────────────────────

export const requestTransfer = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { assetId, reason } = req.body;
    const transfer = await allocationService.requestTransfer(
      req.user.id,
      assetId,
      reason
    );

    sendSuccess(res, transfer, "Transfer request submitted successfully", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request transfer";
    sendError(res, message, 400);
  }
});

export const approveTransfer = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const transfer = await allocationService.approveTransfer(
      req.user.id,
      req.params.id as string
    );

    sendSuccess(res, transfer, "Transfer request approved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve transfer";
    sendError(res, message, 400);
  }
});

export const rejectTransfer = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const transfer = await allocationService.rejectTransfer(
      req.user.id,
      req.params.id as string
    );

    sendSuccess(res, transfer, "Transfer request rejected successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject transfer";
    sendError(res, message, 400);
  }
});
