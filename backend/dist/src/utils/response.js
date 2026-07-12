"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, message = "Success", statusCode = 200) {
    const response = {
        success: true,
        message,
        data,
        errors: null,
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
}
function sendError(res, message = "Internal Server Error", statusCode = 500, errors = null) {
    const response = {
        success: false,
        message,
        data: null,
        errors,
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
}
function sendPaginated(res, data, total, page, limit, message = "Success") {
    const response = {
        success: true,
        message,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        errors: null,
        timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
}
//# sourceMappingURL=response.js.map