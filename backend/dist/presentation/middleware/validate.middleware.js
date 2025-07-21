"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
/**
 * Middleware to validate request body using Zod schema.
 * If validation fails, it responds with an unauthorized error.
 *
 * @param {ZodSchema<any>} schema - The Zod schema used for validation.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function.
 */
const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    // If validation fails, format error messages and send response
    if (!result.success) {
        const errorMessage = result.error.errors
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
        (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, errorMessage);
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
