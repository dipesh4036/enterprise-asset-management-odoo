export declare const API_PREFIX = "/api/v1";
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
};
export declare const ASSET_TAG_PREFIX = "AF";
export declare const ASSET_TAG_PAD_LENGTH = 4;
export declare const ASSET_CONDITIONS: readonly ["Good", "Fair", "Poor"];
export declare const NOTIFICATION_TYPES: {
    readonly ASSET_ASSIGNED: "ASSET_ASSIGNED";
    readonly MAINTENANCE_APPROVED: "MAINTENANCE_APPROVED";
    readonly MAINTENANCE_REJECTED: "MAINTENANCE_REJECTED";
    readonly BOOKING_CONFIRMED: "BOOKING_CONFIRMED";
    readonly BOOKING_CANCELLED: "BOOKING_CANCELLED";
    readonly BOOKING_REMINDER: "BOOKING_REMINDER";
    readonly TRANSFER_APPROVED: "TRANSFER_APPROVED";
    readonly OVERDUE_RETURN: "OVERDUE_RETURN";
    readonly AUDIT_DISCREPANCY: "AUDIT_DISCREPANCY";
};
export declare const ACTIVITY_ACTIONS: {
    readonly ASSET_CREATED: "ASSET_CREATED";
    readonly ASSET_UPDATED: "ASSET_UPDATED";
    readonly ASSET_ALLOCATED: "ASSET_ALLOCATED";
    readonly ASSET_RETURNED: "ASSET_RETURNED";
    readonly TRANSFER_REQUESTED: "TRANSFER_REQUESTED";
    readonly TRANSFER_APPROVED: "TRANSFER_APPROVED";
    readonly TRANSFER_REJECTED: "TRANSFER_REJECTED";
    readonly BOOKING_CREATED: "BOOKING_CREATED";
    readonly BOOKING_CANCELLED: "BOOKING_CANCELLED";
    readonly BOOKING_RESCHEDULED: "BOOKING_RESCHEDULED";
    readonly MAINTENANCE_RAISED: "MAINTENANCE_RAISED";
    readonly MAINTENANCE_APPROVED: "MAINTENANCE_APPROVED";
    readonly MAINTENANCE_REJECTED: "MAINTENANCE_REJECTED";
    readonly MAINTENANCE_ASSIGNED: "MAINTENANCE_ASSIGNED";
    readonly MAINTENANCE_RESOLVED: "MAINTENANCE_RESOLVED";
    readonly AUDIT_CREATED: "AUDIT_CREATED";
    readonly AUDIT_CLOSED: "AUDIT_CLOSED";
    readonly USER_ROLE_UPDATED: "USER_ROLE_UPDATED";
    readonly USER_STATUS_UPDATED: "USER_STATUS_UPDATED";
};
export declare const ENTITY_TYPES: {
    readonly USER: "User";
    readonly ASSET: "Asset";
    readonly ALLOCATION: "Allocation";
    readonly TRANSFER: "Transfer";
    readonly BOOKING: "Booking";
    readonly MAINTENANCE: "Maintenance";
    readonly AUDIT: "Audit";
    readonly DEPARTMENT: "Department";
    readonly CATEGORY: "Category";
};
//# sourceMappingURL=constants.d.ts.map