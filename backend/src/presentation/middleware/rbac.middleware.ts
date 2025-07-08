import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/errors/custom.error";
import { HttpResCode,HttpResMsg } from "../../utils/constants/httpResponseCode.utils";

export const authorizeRoles = (roles: Array<"user" | "vendor" | "admin">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const decoded = req.decoded;

    if (!decoded) {
      throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    if (!roles.includes(decoded.role)) {
      throw new CustomError(HttpResMsg.FORBIDDEN, HttpResCode.FORBIDDEN);
    }

    next();
  };
};
