import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
  walletAddress?: string;
}

/**
 * JWT authentication middleware.
 * Verifies the Bearer token and attaches userId to the request.
 */
export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const payload = jwt.verify(token, secret) as { userId: string; walletAddress: string };
    req.userId = payload.userId;
    req.walletAddress = payload.walletAddress;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
