import { Request, Response } from "express";
import { assetService } from "../services/asset.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";
import { AssetStatus } from "@prisma/client";

// ─── Asset Controllers ──────────────────────────────────────

export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const categoryId = req.query.categoryId ? String(req.query.categoryId) : undefined;
    const status = req.query.status ? (req.query.status as AssetStatus) : undefined;
    const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
    const location = req.query.location ? String(req.query.location) : undefined;
    const isBookable = req.query.isBookable !== undefined ? req.query.isBookable === "true" : undefined;

    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

    const result = await assetService.getAssets({
      search,
      categoryId,
      status,
      departmentId,
      location,
      isBookable,
      page,
      limit,
    });

    sendPaginated(res, result.assets, result.total, result.page, result.limit, "Assets retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve assets";
    sendError(res, message, 400);
  }
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const asset = await assetService.createAsset(req.user.id, req.body);
    sendSuccess(res, asset, "Asset registered successfully", 211);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register asset";
    sendError(res, message, 400);
  }
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }
    const asset = await assetService.updateAsset(req.user.id, req.params.id as string, req.body);
    sendSuccess(res, asset, "Asset updated successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update asset";
    sendError(res, message, 400);
  }
});

export const getAssetById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const asset = await assetService.getAssetById(req.params.id as string);
    sendSuccess(res, asset, "Asset detail retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve asset detail";
    sendError(res, message, 404);
  }
});

export const getAllocationHistory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const history = await assetService.getAllocationHistory(req.params.id as string);
    sendSuccess(res, history, "Asset allocation history retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve allocation history";
    sendError(res, message, 400);
  }
});

export const getMaintenanceHistory = asyncHandler(async (req: Request, res: Response) => {
  try {
    const history = await assetService.getMaintenanceHistory(req.params.id as string);
    sendSuccess(res, history, "Asset maintenance history retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve maintenance history";
    sendError(res, message, 400);
  }
});
