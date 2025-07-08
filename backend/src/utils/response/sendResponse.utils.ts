import { Response } from 'express';

/**
 * Sends a structured JSON response.
 * @param res - Express response object.
 * @param status - HTTP status code.
 * @param message - Response message.
 * @param data - Optional response data.
 * @returns Express response.
 */

export function sendResponse<T>(
  res: Response,
  status: number,
  message: string,
  data?: T,
): Response {
  const isSuccess = status < 400;
  const baseResponse = { success: isSuccess, status, message };

  return res.status(status).json(data ? { ...baseResponse, data } : baseResponse);
}
