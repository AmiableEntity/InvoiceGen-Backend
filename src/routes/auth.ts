import { Router } from "express";
import { connectWallet, getMe } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

export const authRouter = Router();

// POST /api/auth/wallet — connect wallet (register or login)
authRouter.post("/wallet", connectWallet);

// GET /api/auth/me — get current user (requires auth)
authRouter.get("/me", authenticate, getMe);
