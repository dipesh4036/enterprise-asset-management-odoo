import { Request, Response, NextFunction } from "express";
import * as reportService from "../services/report.service";
import { sendSuccess } from "../utils/response";

/**
 * Gets asset utilization per department
 */
export async function getUtilization(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getAssetUtilization();
    sendSuccess(res, data, "Utilization report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets maintenance requests frequency over the last 6 months
 */
export async function getMaintenanceFrequency(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getMaintenanceFrequency();
    sendSuccess(res, data, "Maintenance frequency report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets list of idle assets (in AVAILABLE status with no updates in > 60 days)
 */
export async function getIdleAssets(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getIdleAssets();
    sendSuccess(res, data, "Idle assets report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets booking heatmap data (day-hour coordinates)
 */
export async function getBookingHeatmap(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getBookingHeatmap();
    sendSuccess(res, data, "Booking heatmap report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets general summaries per department (cost, headcount, active repairs)
 */
export async function getDepartmentSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getDepartmentSummary();
    sendSuccess(res, data, "Department summary report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Gets list of assets due/overdue for maintenance (poor status or old checks)
 */
export async function getDueMaintenance(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getDueMaintenance();
    sendSuccess(res, data, "Due maintenance report retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Exports department summaries as a CSV download
 */
export async function exportCSV(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportService.getDepartmentSummary();

    // Construct CSV content
    const headers = ["Department Name", "Total Assets", "Total Value ($)", "Headcount", "Active Repairs"];
    const rows = data.map((dept) => [
      `"${dept.departmentName.replace(/"/g, '""')}"`,
      dept.totalAssets,
      dept.totalValue,
      dept.employeesCount,
      dept.pendingRepairs,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="department-assets-summary.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}
