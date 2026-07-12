import prisma from "../config/database";
import { createNotification } from "./notification.service";
import { logActivity } from "./activityLog.service";
import { NOTIFICATION_TYPES, ACTIVITY_ACTIONS } from "../config/constants";
import { MaintenanceStatus, AssetStatus, Priority } from "@prisma/client";

/**
 * Raises a new maintenance request
 */
export async function raiseRequest(
  userId: string,
  assetId: string,
  issue: string,
  priority: Priority,
  photoUrl?: string
) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  });
  if (!asset) {
    throw new Error("Asset not found");
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId,
      raisedById: userId,
      issue,
      priority,
      photoUrl: photoUrl || null,
      status: MaintenanceStatus.PENDING,
    },
    include: {
      asset: true,
      raisedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  await logActivity(
    userId,
    ACTIVITY_ACTIONS.MAINTENANCE_RAISED,
    "MAINTENANCE",
    request.id,
    { assetTag: asset.assetTag, priority }
  );

  return request;
}

/**
 * Gets maintenance requests with filters
 */
export async function getMaintenanceRequests(filters: {
  status?: MaintenanceStatus;
  priority?: Priority;
  assetId?: string;
}) {
  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assetId) where.assetId = filters.assetId;

  return prisma.maintenanceRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      asset: {
        select: { id: true, assetTag: true, name: true, status: true },
      },
      raisedBy: {
        select: { id: true, name: true, email: true },
      },
      technician: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

/**
 * Approves a maintenance request and sets the asset status to UNDER_MAINTENANCE
 */
export async function approveRequest(requestId: string, managerId: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { asset: true },
  });

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  if (request.status !== MaintenanceStatus.PENDING) {
    throw new Error(`Cannot approve request in ${request.status} status`);
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updatedReq = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: { status: MaintenanceStatus.APPROVED },
      include: { asset: true },
    });

    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.UNDER_MAINTENANCE },
    });

    return updatedReq;
  });

  await createNotification(
    request.raisedById,
    NOTIFICATION_TYPES.MAINTENANCE_APPROVED,
    `Your maintenance request for asset ${request.asset.assetTag} (${request.asset.name}) has been APPROVED.`,
    request.id
  );

  await logActivity(
    managerId,
    ACTIVITY_ACTIONS.MAINTENANCE_APPROVED,
    "MAINTENANCE",
    requestId,
    { assetTag: request.asset.assetTag }
  );

  return updatedRequest;
}

/**
 * Rejects a maintenance request with comments
 */
export async function rejectRequest(requestId: string, notes: string, managerId: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { asset: true },
  });

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  if (request.status !== MaintenanceStatus.PENDING) {
    throw new Error(`Cannot reject request in ${request.status} status`);
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: MaintenanceStatus.REJECTED,
      notes,
    },
    include: { asset: true },
  });

  await createNotification(
    request.raisedById,
    NOTIFICATION_TYPES.MAINTENANCE_REJECTED,
    `Your maintenance request for asset ${request.asset.assetTag} (${request.asset.name}) has been REJECTED. Notes: ${notes}`,
    request.id
  );

  await logActivity(
    managerId,
    ACTIVITY_ACTIONS.MAINTENANCE_REJECTED,
    "MAINTENANCE",
    requestId,
    { assetTag: request.asset.assetTag, reason: notes }
  );

  return updatedRequest;
}

/**
 * Assigns a technician to the maintenance request
 */
export async function assignTechnician(requestId: string, technicianId: string, managerId: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { asset: true },
  });

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  if (
    request.status !== MaintenanceStatus.APPROVED &&
    request.status !== MaintenanceStatus.TECHNICIAN_ASSIGNED
  ) {
    throw new Error(`Cannot assign technician to request in ${request.status} status`);
  }

  const technician = await prisma.user.findUnique({
    where: { id: technicianId },
  });

  if (!technician || technician.status === "INACTIVE") {
    throw new Error("Technician not found or inactive");
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: MaintenanceStatus.TECHNICIAN_ASSIGNED,
      technicianId,
    },
    include: { asset: true, technician: { select: { name: true, email: true } } },
  });

  await createNotification(
    technicianId,
    NOTIFICATION_TYPES.ASSET_ASSIGNED,
    `You have been assigned as the technician for maintenance request on asset ${request.asset.assetTag} (${request.asset.name}).`,
    request.id
  );

  await logActivity(
    managerId,
    ACTIVITY_ACTIONS.MAINTENANCE_ASSIGNED,
    "MAINTENANCE",
    requestId,
    { assetTag: request.asset.assetTag, technicianName: technician.name }
  );

  return updatedRequest;
}

/**
 * Technician starts work on the request (IN_PROGRESS)
 */
export async function startWork(requestId: string, userId: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { asset: true },
  });

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  if (request.status !== MaintenanceStatus.TECHNICIAN_ASSIGNED) {
    throw new Error(`Cannot start work on request in ${request.status} status`);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const isAuthorized =
    request.technicianId === userId ||
    user.role === "ADMIN" ||
    user.role === "ASSET_MANAGER";

  if (!isAuthorized) {
    throw new Error("Access denied: You are not authorized to start work on this request");
  }

  const updatedRequest = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: { status: MaintenanceStatus.IN_PROGRESS },
    include: { asset: true },
  });

  await logActivity(
    userId,
    ACTIVITY_ACTIONS.MAINTENANCE_ASSIGNED,
    "MAINTENANCE",
    requestId,
    { assetTag: request.asset.assetTag, note: "Work started" }
  );

  return updatedRequest;
}

/**
 * Resolves the request and flips the asset status back to AVAILABLE
 */
export async function resolveRequest(requestId: string, notes: string, userId: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { asset: true },
  });

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  if (request.status !== MaintenanceStatus.IN_PROGRESS) {
    throw new Error(`Cannot resolve request in ${request.status} status`);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const isAuthorized =
    request.technicianId === userId ||
    user.role === "ADMIN" ||
    user.role === "ASSET_MANAGER";

  if (!isAuthorized) {
    throw new Error("Access denied: You are not authorized to resolve this request");
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const updatedReq = await tx.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: MaintenanceStatus.RESOLVED,
        resolvedAt: new Date(),
        notes,
      },
      include: { asset: true },
    });

    await tx.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.AVAILABLE },
    });

    return updatedReq;
  });

  await createNotification(
    request.raisedById,
    NOTIFICATION_TYPES.MAINTENANCE_APPROVED,
    `Your maintenance request for asset ${request.asset.assetTag} has been RESOLVED. Notes: ${notes}`,
    request.id
  );

  await logActivity(
    userId,
    ACTIVITY_ACTIONS.MAINTENANCE_RESOLVED,
    "MAINTENANCE",
    requestId,
    { assetTag: request.asset.assetTag, notes }
  );

  return updatedRequest;
}

const maintenanceService = {
  raiseRequest,
  getMaintenanceRequests,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  resolveRequest,
};

export default maintenanceService;
