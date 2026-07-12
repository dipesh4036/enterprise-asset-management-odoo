import { api } from "@/lib/axios";

export interface AllocationItem {
  id: string;
  assetId: string;
  asset: {
    id: string;
    assetTag: string;
    name: string;
  };
  employeeId: string;
  employee: {
    id: string;
    name: string;
    email: string;
  };
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  allocatedAt: string;
  expectedReturnAt: string | null;
  returnedAt: string | null;
  conditionNotes: string | null;
  isOverdue: boolean;
  createdAt: string;
}

export interface TransferRequestItem {
  id: string;
  assetId: string;
  asset: {
    id: string;
    assetTag: string;
    name: string;
  };
  fromUserId: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
  };
  toUserId: string;
  toUser: {
    id: string;
    name: string;
    email: string;
  };
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationConflictResponse {
  success: boolean;
  message: string;
  data?: {
    holder?: {
      name: string;
      department: string;
    };
    canRequestTransfer?: boolean;
    allocation?: AllocationItem;
  };
  errors?: {
    conflict?: string;
  };
}

export interface AllocationResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const allocationService = {
  /**
   * Allocates an asset to an employee
   */
  async createAllocation(data: {
    assetId: string;
    employeeId: string;
    expectedReturnAt?: string;
  }): Promise<AllocationConflictResponse> {
    const res = await api.post<AllocationConflictResponse>("/allocations", data);
    return res.data;
  },

  /**
   * Retrieves overdue asset checkouts
   */
  async getOverdueAllocations(): Promise<AllocationResponse<AllocationItem[]>> {
    const res = await api.get<AllocationResponse<AllocationItem[]>>("/allocations/overdue");
    return res.data;
  },

  /**
   * Returns an allocated asset to inventory
   */
  async returnAsset(
    id: string,
    data: { conditionNotes: string }
  ): Promise<AllocationResponse<AllocationItem>> {
    const res = await api.post<AllocationResponse<AllocationItem>>(`/allocations/${id}/return`, data);
    return res.data;
  },

  /**
   * Requests a transfer request for an allocated asset
   */
  async requestTransfer(data: {
    assetId: string;
    reason?: string;
  }): Promise<AllocationResponse<TransferRequestItem>> {
    const res = await api.post<AllocationResponse<TransferRequestItem>>("/transfers", data);
    return res.data;
  },

  /**
   * Retrieves transfer requests (sent/received)
   */
  async getTransferRequests(): Promise<AllocationResponse<TransferRequestItem[]>> {
    const res = await api.get<AllocationResponse<TransferRequestItem[]>>("/transfers");
    return res.data;
  },

  /**
   * Approves a transfer request
   */
  async approveTransfer(id: string): Promise<AllocationResponse<TransferRequestItem>> {
    const res = await api.patch<AllocationResponse<TransferRequestItem>>(`/transfers/${id}/approve`);
    return res.data;
  },

  /**
   * Rejects a transfer request
   */
  async rejectTransfer(id: string): Promise<AllocationResponse<TransferRequestItem>> {
    const res = await api.patch<AllocationResponse<TransferRequestItem>>(`/transfers/${id}/reject`);
    return res.data;
  },
};
export default allocationService;
