import prisma from "../config/database";
import { createNotification } from "./notification.service";
import { logActivity } from "./activityLog.service";
import { NOTIFICATION_TYPES, ACTIVITY_ACTIONS } from "../config/constants";
import { AuditCycleStatus, AuditEntryStatus, AssetStatus } from "@prisma/client";

/**
 * Creates an audit cycle and automatically scopes matching assets
 */
export async function createAuditCycle(
  name: string,
  departmentId: string | null | undefined,
  location: string | null | undefined,
  startDate: Date,
  endDate: Date,
  auditorIds: string[],
  creatorId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Create the Audit Cycle
    const cycle = await tx.auditCycle.create({
      data: {
        name,
        departmentId: departmentId || null,
        location: location || null,
        startDate,
        endDate,
        status: AuditCycleStatus.OPEN,
      },
    });

    // 2. Query active assets in this scope (ignore retired, disposed)
    const where: any = {
      status: {
        notIn: [AssetStatus.RETIRED, AssetStatus.DISPOSED],
      },
    };
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    const assets = await tx.asset.findMany({ where });

    if (assets.length === 0) {
      throw new Error("No active assets found matching the specified department or location scope.");
    }

    // 3. Create Audit Entries for each scoped asset
    await tx.auditEntry.createMany({
      data: assets.map((asset) => ({
        auditCycleId: cycle.id,
        assetId: asset.id,
        status: AuditEntryStatus.PENDING,
      })),
    });

    // 4. Create Auditor Assignments
    await tx.auditAssignment.createMany({
      data: auditorIds.map((auditorId) => ({
        auditCycleId: cycle.id,
        auditorId,
      })),
    });

    // 5. Log activity
    await logActivity(
      creatorId,
      ACTIVITY_ACTIONS.AUDIT_CREATED,
      "AUDIT",
      cycle.id,
      { name, assetCount: assets.length, auditorsCount: auditorIds.length }
    );

    return cycle;
  });
}

/**
 * Retrieves all audit cycles with summarized metadata and progress
 */
export async function getAuditCycles() {
  const cycles = await prisma.auditCycle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      department: {
        select: { name: true },
      },
      assignments: {
        include: {
          auditor: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      entries: {
        select: {
          status: true,
        },
      },
    },
  });

  // Calculate stats per cycle
  return cycles.map((cycle) => {
    const total = cycle.entries.length;
    const pending = cycle.entries.filter((e) => e.status === AuditEntryStatus.PENDING).length;
    const verified = cycle.entries.filter((e) => e.status === AuditEntryStatus.VERIFIED).length;
    const missing = cycle.entries.filter((e) => e.status === AuditEntryStatus.MISSING).length;
    const damaged = cycle.entries.filter((e) => e.status === AuditEntryStatus.DAMAGED).length;
    const completed = total - pending;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...cycle,
      stats: {
        total,
        pending,
        verified,
        missing,
        damaged,
        completed,
        progressPercent,
      },
    };
  });
}

/**
 * Retrieves details of a specific audit cycle including scoped entries
 */
export async function getAuditCycleDetail(cycleId: string) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: {
      department: {
        select: { name: true },
      },
      assignments: {
        include: {
          auditor: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      entries: {
        include: {
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              status: true,
              location: true,
              condition: true,
            },
          },
        },
        orderBy: {
          asset: {
            assetTag: "asc",
          },
        },
      },
    },
  });

  if (!cycle) {
    throw new Error("Audit cycle not found");
  }

  const total = cycle.entries.length;
  const pending = cycle.entries.filter((e) => e.status === AuditEntryStatus.PENDING).length;
  const verified = cycle.entries.filter((e) => e.status === AuditEntryStatus.VERIFIED).length;
  const missing = cycle.entries.filter((e) => e.status === AuditEntryStatus.MISSING).length;
  const damaged = cycle.entries.filter((e) => e.status === AuditEntryStatus.DAMAGED).length;
  const completed = total - pending;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    ...cycle,
    stats: {
      total,
      pending,
      verified,
      missing,
      damaged,
      completed,
      progressPercent,
    },
  };
}

/**
 * Submits status checks for an asset in the audit cycle
 */
export async function submitAuditEntry(
  cycleId: string,
  assetId: string,
  status: AuditEntryStatus,
  notes: string | undefined,
  userId: string
) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: { assignments: true },
  });

  if (!cycle) {
    throw new Error("Audit cycle not found");
  }

  if (cycle.status !== AuditCycleStatus.OPEN) {
    throw new Error("Audit cycle is closed. Further entries cannot be submitted.");
  }

  // Validate authorization (must be assigned auditor or Admin/Asset Manager)
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    throw new Error("User not found");
  }

  const isAssignedAuditor = cycle.assignments.some((a) => a.auditorId === userId);
  const isAuthorized = isAssignedAuditor || currentUser.role === "ADMIN" || currentUser.role === "ASSET_MANAGER";

  if (!isAuthorized) {
    throw new Error("Access denied: You are not an assigned auditor for this cycle.");
  }

  // Find entry
  const entry = await prisma.auditEntry.findFirst({
    where: {
      auditCycleId: cycleId,
      assetId,
    },
  });

  if (!entry) {
    throw new Error("Scoped asset not found in this audit cycle.");
  }

  // Update entry
  return prisma.auditEntry.update({
    where: { id: entry.id },
    data: {
      status,
      notes: notes || null,
      verifiedAt: new Date(),
    },
  });
}

/**
 * Closes an audit cycle and updates asset statuses based on checklist results
 */
export async function closeAuditCycle(cycleId: string, userId: string) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
    include: {
      entries: {
        include: { asset: true },
      },
    },
  });

  if (!cycle) {
    throw new Error("Audit cycle not found");
  }

  if (cycle.status !== AuditCycleStatus.OPEN) {
    throw new Error("Audit cycle is already closed");
  }

  // Check if there are still pending unchecked assets
  const pendingCount = cycle.entries.filter((e) => e.status === AuditEntryStatus.PENDING).length;
  if (pendingCount > 0) {
    throw new Error(`Cannot close audit cycle. There are still ${pendingCount} unchecked assets remaining.`);
  }

  const missingEntries = cycle.entries.filter((e) => e.status === AuditEntryStatus.MISSING);
  const damagedEntries = cycle.entries.filter((e) => e.status === AuditEntryStatus.DAMAGED);

  // Close cycle and update asset statuses in transaction
  const updatedCycle = await prisma.$transaction(async (tx) => {
    // 1. Close cycle status
    const closed = await tx.auditCycle.update({
      where: { id: cycleId },
      data: { status: AuditCycleStatus.CLOSED },
    });

    // 2. Set Missing assets to LOST
    if (missingEntries.length > 0) {
      await tx.asset.updateMany({
        where: { id: { in: missingEntries.map((e) => e.assetId) } },
        data: { status: AssetStatus.LOST },
      });
    }

    // 3. Set Damaged assets to UNDER_MAINTENANCE
    if (damagedEntries.length > 0) {
      await tx.asset.updateMany({
        where: { id: { in: damagedEntries.map((e) => e.assetId) } },
        data: { status: AssetStatus.UNDER_MAINTENANCE },
      });
    }

    return closed;
  });

  // Log activity
  await logActivity(
    userId,
    ACTIVITY_ACTIONS.AUDIT_CLOSED,
    "AUDIT",
    cycleId,
    {
      name: cycle.name,
      discrepanciesCount: missingEntries.length + damagedEntries.length,
      missingCount: missingEntries.length,
      damagedCount: damagedEntries.length,
    }
  );

  // Trigger discrepancy notifications if any missing or damaged assets exist
  const discrepanciesTotal = missingEntries.length + damagedEntries.length;
  if (discrepanciesTotal > 0) {
    // Fetch all admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    const msg = `Audit cycle "${cycle.name}" closed with ${discrepanciesTotal} discrepancies flagged (${missingEntries.length} missing, ${damagedEntries.length} damaged).`;

    for (const admin of admins) {
      await createNotification(
        admin.id,
        NOTIFICATION_TYPES.AUDIT_DISCREPANCY,
        msg,
        cycleId
      );
    }
  }

  return {
    cycle: updatedCycle,
    discrepancyReport: {
      totalDiscrepancies: discrepanciesTotal,
      missing: missingEntries.map((e) => ({
        id: e.asset.id,
        assetTag: e.asset.assetTag,
        name: e.asset.name,
        notes: e.notes,
      })),
      damaged: damagedEntries.map((e) => ({
        id: e.asset.id,
        assetTag: e.asset.assetTag,
        name: e.asset.name,
        notes: e.notes,
      })),
    },
  };
}

/**
 * Assigns new auditors to an audit cycle, replacing previous assignments
 */
export async function assignAuditors(cycleId: string, auditorIds: string[]) {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: cycleId },
  });

  if (!cycle) {
    throw new Error("Audit cycle not found");
  }

  if (cycle.status !== AuditCycleStatus.OPEN) {
    throw new Error("Cannot re-assign auditors to a closed audit cycle.");
  }

  return prisma.$transaction(async (tx) => {
    // Delete existing assignments
    await tx.auditAssignment.deleteMany({
      where: { auditCycleId: cycleId },
    });

    // Create new ones
    await tx.auditAssignment.createMany({
      data: auditorIds.map((auditorId) => ({
        auditCycleId: cycleId,
        auditorId,
      })),
    });

    return tx.auditAssignment.findMany({
      where: { auditCycleId: cycleId },
      include: {
        auditor: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  });
}

const auditService = {
  createAuditCycle,
  getAuditCycles,
  getAuditCycleDetail,
  submitAuditEntry,
  closeAuditCycle,
  assignAuditors,
};

export default auditService;

