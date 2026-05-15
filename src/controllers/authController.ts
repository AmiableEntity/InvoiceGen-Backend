import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AppError } from "../middlewares/errorHandler";

const walletAuthSchema = z.object({
  walletAddress: z.string().min(56).max(56), // Stellar public keys are 56 chars
  name: z.string().optional(),
  email: z.string().email().optional(),
});

/**
 * POST /api/auth/wallet
 * Register or login a user by their Stellar wallet address.
 * Returns a JWT token for subsequent authenticated requests.
 */
export async function connectWallet(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = walletAuthSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Invalid wallet address", 400);
    }

    const { walletAddress, name, email } = parsed.data;

    // Upsert user — create if new, return existing if already registered
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        ...(name && { name }),
        ...(email && { email }),
      },
      create: {
        walletAddress,
        name: name ?? null,
        email: email ?? null,
      },
    });

    // Sign JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("Server configuration error", 500);

    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" } as jwt.SignOptions
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export async function getMe(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, walletAddress: true, createdAt: true },
    });

    if (!user) throw new AppError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
