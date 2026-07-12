import prisma from "../config/database";
import { AssetStatus, MaintenanceStatus, BookingStatus } from "@prisma/client";

/**
 * Computes asset utilization rate (allocated / total) per department
 */
export async function getAssetUtilization() {
  const depts = await prisma.department.findMany({
    where: { status: "ACTIVE" },
    include: {
      assets: {
        where: {
          status: {
            notIn: ["RETIRED", "DISPOSED"],
          },
        },
        select: {
          status: true,
        },
      },
    },
  });

  return depts.map((dept) => {
    const total = dept.assets.length;
    const allocated = dept.assets.filter((a) => a.status === AssetStatus.ALLOCATED).length;
    const utilizationRate = total > 0 ? Math.round((allocated / total) * 100) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets: total,
      allocatedAssets: allocated,
      utilizationRate,
    };
  });
}

/**
 * Retrieves monthly maintenance request frequencies for the last 6 months
 */
export async function getMaintenanceFrequency() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Initialize monthly buckets
  const buckets: Record<string, { monthName: string; count: number; dateValue: Date }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthName = d.toLocaleString("default", { month: "short", year: "numeric" });
    buckets[key] = { monthName, count: 0, dateValue: new Date(d.getFullYear(), d.getMonth(), 1) };
  }

  // Aggregate requests
  for (const req of requests) {
    const created = new Date(req.createdAt);
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
    if (buckets[key]) {
      buckets[key].count++;
    }
  }

  // Sort chronologically
  return Object.values(buckets)
    .sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime())
    .map((b) => ({
      month: b.monthName,
      count: b.count,
    }));
}

/**
 * Retrieves assets in AVAILABLE status with no modifications/updates in the last 60 days
 */
export async function getIdleAssets() {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  return prisma.asset.findMany({
    where: {
      status: AssetStatus.AVAILABLE,
      updatedAt: {
        lte: sixtyDaysAgo,
      },
    },
    include: {
      department: {
        select: { name: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 15, // limit list size
  });
}

/**
 * Aggregates resource bookings by day of the week and hour of the day for heatmap visualization
 */
export async function getBookingHeatmap() {
  const bookings = await prisma.resourceBooking.findMany({
    where: {
      status: {
        not: BookingStatus.CANCELLED,
      },
    },
    select: {
      startTime: true,
    },
  });

  // Initialize a day-hour list
  const heatmap: Record<string, { day: number; hour: number; count: number }> = {};
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      heatmap[`${d}-${h}`] = { day: d, hour: h, count: 0 };
    }
  }

  // Populate counts
  for (const b of bookings) {
    const start = new Date(b.startTime);
    const day = start.getDay(); // 0 is Sunday
    const hour = start.getHours();
    const key = `${day}-${hour}`;
    if (heatmap[key]) {
      heatmap[key].count++;
    }
  }

  return Object.values(heatmap);
}

/**
 * Retrieves general summaries for each department
 */
export async function getDepartmentSummary() {
  const depts = await prisma.department.findMany({
    where: { status: "ACTIVE" },
    include: {
      _count: {
        select: {
          employees: true,
        },
      },
      assets: {
        where: {
          status: {
            notIn: ["RETIRED", "DISPOSED"],
          },
        },
        select: {
          acquisitionCost: true,
          status: true,
          maintenanceRequests: {
            where: {
              status: {
                in: [
                  MaintenanceStatus.PENDING,
                  MaintenanceStatus.APPROVED,
                  MaintenanceStatus.TECHNICIAN_ASSIGNED,
                  MaintenanceStatus.IN_PROGRESS,
                ],
              },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  return depts.map((dept) => {
    let totalValue = 0;
    let pendingRepairs = 0;

    for (const asset of dept.assets) {
      if (asset.acquisitionCost) {
        totalValue += Number(asset.acquisitionCost);
      }
      pendingRepairs += asset.maintenanceRequests.length;
    }

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      totalAssets: dept.assets.length,
      totalValue: Math.round(totalValue * 100) / 100,
      employeesCount: dept._count.employees,
      pendingRepairs,
    };
  });
}

/**
 * Finds assets which are in poor/fair condition and have no active maintenance request tickets
 */
export async function getDueMaintenance() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return prisma.asset.findMany({
    where: {
      status: {
        in: [AssetStatus.AVAILABLE, AssetStatus.ALLOCATED],
      },
      OR: [
        { condition: "Poor" },
        {
          condition: "Fair",
          updatedAt: {
            lte: sixMonthsAgo,
          },
        },
      ],
      maintenanceRequests: {
        none: {
          status: {
            in: [
              MaintenanceStatus.PENDING,
              MaintenanceStatus.APPROVED,
              MaintenanceStatus.TECHNICIAN_ASSIGNED,
              MaintenanceStatus.IN_PROGRESS,
            ],
          },
        },
      },
    },
    include: {
      department: {
        select: { name: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      updatedAt: "asc",
    },
    take: 15,
  });
}

const reportService = {
  getAssetUtilization,
  getMaintenanceFrequency,
  getIdleAssets,
  getBookingHeatmap,
  getDepartmentSummary,
  getDueMaintenance,
};

export default reportService;
