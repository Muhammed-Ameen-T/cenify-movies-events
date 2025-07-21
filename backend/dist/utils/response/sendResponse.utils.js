"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = sendResponse;
/**
 * Sends a structured JSON response.
 * @param res - Express response object.
 * @param status - HTTP status code.
 * @param message - Response message.
 * @param data - Optional response data.
 * @returns Express response.
 */
function sendResponse(res, status, message, data) {
    const isSuccess = status < 400;
    const baseResponse = { success: isSuccess, status, message };
    return res.status(status).json(data ? { ...baseResponse, data } : baseResponse);
}
