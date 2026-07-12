import { api } from "@/lib/axios";

export interface AuditEntry {
  id: string;
  auditCycleId: string;
  assetId: string;
  asset: {
    id: string;
    assetTag: string;
    name: string;
    status: string;
    location: string;
    condition: string;
  };
  status: "PENDING" | "VERIFIED" | "MISSING" | "DAMAGED";
  notes: string | null;
  verifiedAt: string | null;
}

export interface AuditCycle {
  id: string;
  name: string;
  departmentId: string | null;
  department?: {
    name: string;
  } | null;
  location: string | null;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  assignments: {
    id: string;
    auditor: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  entries?: AuditEntry[];
  stats?: {
    total: number;
    pending: number;
    verified: number;
    missing: number;
    damaged: number;
    completed: number;
    progressPercent: number;
  };
}

export interface DiscrepancyItem {
  id: string;
  assetTag: string;
  name: string;
  notes: string | null;
}

export interface DiscrepancyReport {
  totalDiscrepancies: number;
  missing: DiscrepancyItem[];
  damaged: DiscrepancyItem[];
}

export interface CloseAuditResponse {
  cycle: AuditCycle;
  discrepancyReport: DiscrepancyReport;
}

export interface AuditResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const auditService = {
  /**
   * Fetch all audit cycles with stats
   */
  async getCycles(): Promise<AuditResponse<AuditCycle[]>> {
    const res = await api.get<AuditResponse<AuditCycle[]>>("/audits");
    return res.data;
  },

  /**
   * Fetch details of a single audit cycle
   */
  async getCycleDetail(id: string): Promise<AuditResponse<AuditCycle>> {
    const res = await api.get<AuditResponse<AuditCycle>>(`/audits/${id}`);
    return res.data;
  },

  /**
   * Create a new audit cycle with assigned auditors
   */
  async createCycle(data: {
    name: string;
    departmentId?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    auditorIds: string[];
  }): Promise<AuditResponse<AuditCycle>> {
    const res = await api.post<AuditResponse<AuditCycle>>("/audits", data);
    return res.data;
  },

  /**
   * Re-assign auditors to a cycle
   */
  async assignAuditors(id: string, auditorIds: string[]): Promise<AuditResponse<any>> {
    const res = await api.post<AuditResponse<any>>(`/audits/${id}/assign`, { auditorIds });
    return res.data;
  },

  /**
   * Submit check results for a specific asset entry in a cycle
   */
  async submitAuditEntry(
    cycleId: string,
    data: {
      assetId: string;
      status: "PENDING" | "VERIFIED" | "MISSING" | "DAMAGED";
      notes?: string;
    }
  ): Promise<AuditResponse<AuditEntry>> {
    const res = await api.post<AuditResponse<AuditEntry>>(`/audits/${cycleId}/entries`, data);
    return res.data;
  },

  /**
   * Close the audit cycle, locking it and syncing registry statuses
   */
  async closeCycle(id: string): Promise<AuditResponse<CloseAuditResponse>> {
    const res = await api.post<AuditResponse<CloseAuditResponse>>(`/audits/${id}/close`);
    return res.data;
  },
};
