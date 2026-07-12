import prisma from "../config/database";
import { Role } from "@prisma/client";

export class DashboardService {
  /**
   * Fetch 7 KPI counts based on the user's role and scope
   */
  async getKpis(user: { id: string; role: string; departmentId: string | null }) {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    if (user.role === Role.ADMIN || user.role === Role.ASSET_MANAGER) {
      // Global Scope
      const [available, allocated, maintenance, bookings, transfers, overdue, upcoming] = await Promise.all([
        prisma.asset.count({ where: { status: "AVAILABLE" } }),
        prisma.asset.count({ where: { status: "ALLOCATED" } }),
        prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } }),
        prisma.resourceBooking.count({ where: { status: { in: ["UPCOMING", "ONGOING"] } } }),
        prisma.transferRequest.count({ where: { status: "REQUESTED" } }),
        prisma.allocation.count({ where: { status: "ACTIVE", expectedReturnAt: { lt: now } } }),
        prisma.allocation.count({ where: { status: "ACTIVE", expectedReturnAt: { gte: now, lte: sevenDaysFromNow } } }),
      ]);

      return { available, allocated, maintenance, bookings, transfers, overdue, upcoming };
    } 
    
    if (user.role === Role.DEPARTMENT_HEAD && user.departmentId) {
      const deptId = user.departmentId;

      // Department-Scoped Scope
      const [available, allocated, maintenance, bookings, transfers, overdue, upcoming] = await Promise.all([
        prisma.asset.count({ where: { departmentId: deptId, status: "AVAILABLE" } }),
        prisma.asset.count({ where: { departmentId: deptId, status: "ALLOCATED" } }),
        prisma.asset.count({ where: { departmentId: deptId, status: "UNDER_MAINTENANCE" } }),
        prisma.resourceBooking.count({ where: { user: { departmentId: deptId }, status: { in: ["UPCOMING", "ONGOING"] } } }),
        prisma.transferRequest.count({ where: { asset: { departmentId: deptId }, status: "REQUESTED" } }),
        prisma.allocation.count({ where: { employee: { departmentId: deptId }, status: "ACTIVE", expectedReturnAt: { lt: now } } }),
        prisma.allocation.count({ where: { employee: { departmentId: deptId }, status: "ACTIVE", expectedReturnAt: { gte: now, lte: sevenDaysFromNow } } }),
      ]);

      return { available, allocated, maintenance, bookings, transfers, overdue, upcoming };
    }

    // Employee-Scoped Scope (Own assets, own requests, own bookings)
    const [allocated, maintenance, bookings, transfers, overdue, upcoming] = await Promise.all([
      prisma.allocation.count({ where: { employeeId: user.id, status: "ACTIVE" } }),
      prisma.maintenanceRequest.count({ where: { raisedById: user.id, status: { in: ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"] } } }),
      prisma.resourceBooking.count({ where: { userId: user.id, status: { in: ["UPCOMING", "ONGOING"] } } }),
      prisma.transferRequest.count({ where: { OR: [{ fromUserId: user.id }, { toUserId: user.id }], status: "REQUESTED" } }),
      prisma.allocation.count({ where: { employeeId: user.id, status: "ACTIVE", expectedReturnAt: { lt: now } } }),
      prisma.allocation.count({ where: { employeeId: user.id, status: "ACTIVE", expectedReturnAt: { gte: now, lte: sevenDaysFromNow } } }),
    ]);

    // For employees, "available" represents available bookable assets they can access
    const available = await prisma.asset.count({ where: { isBookable: true, status: "AVAILABLE" } });

    return { available, allocated, maintenance, bookings, transfers, overdue, upcoming };
  }

  /**
   * Fetch top 10 recent activity logs, scoped by user role
   */
  async getRecentActivity(user: { id: string; role: string; departmentId: string | null }) {
    let whereClause = {};

    if (user.role === Role.DEPARTMENT_HEAD && user.departmentId) {
      whereClause = {
        user: {
          departmentId: user.departmentId,
        },
      };
    } else if (user.role === Role.EMPLOYEE) {
      whereClause = {
        userId: user.id,
      };
    }

    return prisma.activityLog.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}

export const dashboardService = new DashboardService();
