import prisma from "../config/database";
import { generateAssetTag } from "../utils/assetTag";
import { activityLogService } from "./activityLog.service";
import { PAGINATION } from "../config/constants";
import { AssetStatus } from "@prisma/client";

interface GetAssetsOptions {
  search?: string;
  categoryId?: string;
  status?: AssetStatus;
  departmentId?: string;
  location?: string;
  isBookable?: boolean;
  page?: number;
  limit?: number;
}

export class AssetService {
  /**
   * Retrieves a paginated, filtered list of assets
   */
  async getAssets(options: GetAssetsOptions = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search query matches name, assetTag, or serialNumber (case-insensitive)
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { assetTag: { contains: options.search, mode: "insensitive" } },
        { serialNumber: { contains: options.search, mode: "insensitive" } },
      ];
    }

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.departmentId) {
      where.departmentId = options.departmentId;
    }

    if (options.location) {
      where.location = { contains: options.location, mode: "insensitive" };
    }

    if (options.isBookable !== undefined) {
      where.isBookable = options.isBookable;
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { assetTag: "asc" },
        skip,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return { assets, total, page, limit };
  }

  /**
   * Registers a new asset with auto-generated tag
   */
  async createAsset(userId: string, data: any) {
    const assetTag = await generateAssetTag();

    // Verify unique serial if provided
    if (data.serialNumber) {
      const existing = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (existing) {
        throw new Error(`Asset with serial number ${data.serialNumber} already exists`);
      }
    }

    const asset = await prisma.asset.create({
      data: {
        ...data,
        assetTag,
        status: AssetStatus.AVAILABLE,
      },
    });

    await activityLogService.logActivity(
      userId,
      "ASSET_CREATED",
      "ASSET",
      asset.id,
      { assetTag: asset.assetTag, name: asset.name }
    );

    return asset;
  }

  /**
   * Updates an existing asset's properties
   */
  async updateAsset(userId: string, id: string, data: any) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new Error("Asset not found");

    if (data.serialNumber && data.serialNumber !== existing.serialNumber) {
      const serialDuplicate = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (serialDuplicate) {
        throw new Error(`Asset with serial number ${data.serialNumber} already exists`);
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data,
    });

    await activityLogService.logActivity(
      userId,
      "ASSET_UPDATED",
      "ASSET",
      updated.id,
      { assetTag: updated.assetTag, name: updated.name }
    );

    return updated;
  }

  /**
   * Retrieves full details of a specific asset
   */
  async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
      },
    });

    if (!asset) throw new Error("Asset not found");
    return asset;
  }

  /**
   * Retrieves allocation history for a specific asset
   */
  async getAllocationHistory(id: string) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new Error("Asset not found");

    return prisma.allocation.findMany({
      where: { assetId: id },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { allocatedAt: "desc" },
    });
  }

  /**
   * Retrieves maintenance history for a specific asset
   */
  async getMaintenanceHistory(id: string) {
    const existing = await prisma.asset.findUnique({ where: { id } });
    if (!existing) throw new Error("Asset not found");

    return prisma.maintenanceRequest.findMany({
      where: { assetId: id },
      include: {
        raisedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const assetService = new AssetService();
