import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { authenticate } from "../middlewares/auth";

export const dashboardRouter = Router();

// All dashboard routes require authentication
dashboardRouter.use(authenticate);

dashboardRouter.get("/stats", getDashboardStats);
