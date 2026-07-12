import prisma from "../config/database";
import { activityLogService } from "./activityLog.service";
import { notificationService } from "./notification.service";
import { AssetStatus, AllocationStatus, TransferStatus } from "@prisma/client";

interface CreateAllocationData {
  assetId: string;
  employeeId: string;
  expectedReturnAt?: Date | null;
}

export class AllocationService {
  /**
   * Allocates an asset to an employee after performing conflict checks
   */
  async createAllocation(userId: string, data: CreateAllocationData) {
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    // Check if asset is under maintenance or retired/lost/disposed
    if (
      asset.status === AssetStatus.UNDER_MAINTENANCE ||
      asset.status === AssetStatus.LOST ||
      asset.status === AssetStatus.RETIRED ||
      asset.status === AssetStatus.DISPOSED
    ) {
      throw new Error(`Asset cannot be allocated while in status: ${asset.status}`);
    }

    // Find any current active or overdue allocation
    const currentAllocation = await prisma.allocation.findFirst({
      where: {
        assetId: data.assetId,
        status: { in: [AllocationStatus.ACTIVE, AllocationStatus.OVERDUE] },
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    if (currentAllocation) {
      return {
        conflict: true,
        holder: {
          name: currentAllocation.employee.name,
          department: currentAllocation.employee.department?.name || "N/A",
        },
        canRequestTransfer: currentAllocation.employeeId !== data.employeeId,
      };
    }

    // Retrieve the employee to check if they exist and log their name
    const employee = await prisma.user.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) throw new Error("Employee not found");

    // Perform allocation: update asset status and write allocation record
    const [allocation] = await prisma.$transaction([
      prisma.allocation.create({
        data: {
          assetId: data.assetId,
          employeeId: data.employeeId,
          expectedReturnAt: data.expectedReturnAt || null,
          status: AllocationStatus.ACTIVE,
        },
      }),
      prisma.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.ALLOCATED },
      }),
    ]);

    await activityLogService.logActivity(
      userId,
      "ASSET_ALLOCATED",
      "ALLOCATION",
      allocation.id,
      { assetTag: asset.assetTag, employee: employee.name }
    );

    await notificationService.createNotification(
      data.employeeId,
      "ASSET_ASSIGNED",
      `Asset ${asset.name} (${asset.assetTag}) has been allocated to you.`,
      allocation.id
    );

    return { conflict: false, allocation };
  }

  /**
   * Returns an allocated asset and updates its condition notes
   */
  async returnAsset(userId: string, allocationId: string, conditionNotes: string) {
    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: { asset: true },
    });

    if (!allocation) {
      throw new Error("Allocation record not found");
    }

    if (allocation.status === AllocationStatus.RETURNED) {
      throw new Error("Asset has already been returned");
    }

    const [updatedAllocation] = await prisma.$transaction([
      prisma.allocation.update({
        where: { id: allocationId },
        data: {
          status: AllocationStatus.RETURNED,
          returnedAt: new Date(),
          conditionNotes,
          isOverdue: false,
        },
      }),
      prisma.asset.update({
        where: { id: allocation.assetId },
        data: {
          status: AssetStatus.AVAILABLE,
          condition: conditionNotes, // update condition to notes on return
        },
      }),
    ]);

    await activityLogService.logActivity(
      userId,
      "ASSET_RETURNED",
      "ALLOCATION",
      updatedAllocation.id,
      { assetTag: allocation.asset.assetTag }
    );

    return updatedAllocation;
  }

  /**
   * Retrieves and updates overdue allocations
   */
  async getOverdueAllocations() {
    const now = new Date();

    // Dynamically update matching active allocations to overdue in the database
    const overdueRecords = await prisma.allocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturnAt: { lt: now },
      },
    });

    if (overdueRecords.length > 0) {
      await prisma.allocation.updateMany({
        where: {
          id: { in: overdueRecords.map((r) => r.id) },
        },
        data: {
          status: AllocationStatus.OVERDUE,
          isOverdue: true,
        },
      });
    }

    return prisma.allocation.findMany({
      where: { status: AllocationStatus.OVERDUE },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            assetTag: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { expectedReturnAt: "asc" },
    });
  }

  /**
   * Requests a transfer for an asset currently allocated to another user
   */
  async requestTransfer(userId: string, assetId: string, reason?: string | null) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) throw new Error("Asset not found");

    // Retrieve active allocation for the target asset
    const activeAllocation = await prisma.allocation.findFirst({
      where: {
        assetId,
        status: { in: [AllocationStatus.ACTIVE, AllocationStatus.OVERDUE] },
      },
    });

    if (!activeAllocation) {
      throw new Error("Asset is not currently allocated to anyone. Allocate it directly.");
    }

    if (activeAllocation.employeeId === userId) {
      throw new Error("You already hold this asset allocation.");
    }

    const transfer = await prisma.transferRequest.create({
      data: {
        assetId,
        fromUserId: activeAllocation.employeeId,
        toUserId: userId,
        reason: reason || null,
        status: TransferStatus.REQUESTED,
      },
    });

    await activityLogService.logActivity(
      userId,
      "TRANSFER_REQUESTED",
      "TRANSFER",
      transfer.id,
      { assetTag: asset.assetTag }
    );

    return transfer;
  }

  /**
   * Approves a transfer request and re-allocates the asset
   */
  async approveTransfer(userId: string, transferId: string) {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferId },
      include: {
        asset: true,
        toUser: true,
      },
    });

    if (!transfer) throw new Error("Transfer request not found");
    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new Error("Transfer request is already resolved");
    }

    // Find current active allocation
    const currentAllocation = await prisma.allocation.findFirst({
      where: {
        assetId: transfer.assetId,
        status: { in: [AllocationStatus.ACTIVE, AllocationStatus.OVERDUE] },
      },
    });

    const [updatedTransfer] = await prisma.$transaction([
      // 1. Mark current allocation returned (as a transfer)
      ...(currentAllocation
        ? [
            prisma.allocation.update({
              where: { id: currentAllocation.id },
              data: {
                status: AllocationStatus.RETURNED,
                returnedAt: new Date(),
                conditionNotes: `Transferred to user ${transfer.toUser.name}`,
                isOverdue: false,
              },
            }),
          ]
        : []),
      // 2. Create new allocation for receiver
      prisma.allocation.create({
        data: {
          assetId: transfer.assetId,
          employeeId: transfer.toUserId,
          status: AllocationStatus.ACTIVE,
        },
      }),
      // 3. Mark transfer approved
      prisma.transferRequest.update({
        where: { id: transferId },
        data: { status: TransferStatus.APPROVED },
      }),
    ]);

    await activityLogService.logActivity(
      userId,
      "TRANSFER_APPROVED",
      "TRANSFER",
      transferId,
      { assetTag: transfer.asset.assetTag }
    );

    // Notify receiver
    await notificationService.createNotification(
      transfer.toUserId,
      "TRANSFER_APPROVED",
      `Transfer request approved. Asset ${transfer.asset.name} (${transfer.asset.assetTag}) has been allocated to you.`,
      transferId
    );

    // Notify sender
    await notificationService.createNotification(
      transfer.fromUserId,
      "TRANSFER_APPROVED",
      `Asset ${transfer.asset.name} (${transfer.asset.assetTag}) has been transferred to ${transfer.toUser.name}.`,
      transferId
    );

    return updatedTransfer;
  }

  /**
   * Rejects a transfer request
   */
  async rejectTransfer(userId: string, transferId: string) {
    const transfer = await prisma.transferRequest.findUnique({
      where: { id: transferId },
      include: { asset: true },
    });

    if (!transfer) throw new Error("Transfer request not found");
    if (transfer.status !== TransferStatus.REQUESTED) {
      throw new Error("Transfer request is already resolved");
    }

    const updatedTransfer = await prisma.transferRequest.update({
      where: { id: transferId },
      data: { status: TransferStatus.REJECTED },
    });

    await activityLogService.logActivity(
      userId,
      "TRANSFER_REJECTED",
      "TRANSFER",
      transferId,
      { assetTag: transfer.asset.assetTag }
    );

    return updatedTransfer;
  }
}

export const allocationService = new AllocationService();
