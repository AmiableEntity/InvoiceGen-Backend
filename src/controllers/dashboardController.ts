import type { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import type { AuthRequest } from "../middlewares/auth";

/**
 * GET /api/dashboard/stats
 * Returns aggregated stats for the authenticated user's dashboard.
 */
export async function getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    // Run all queries in parallel for performance
    const [totalInvoices, paidInvoices, pendingInvoices, overdueInvoices, revenueResult, recentInvoices] =
      await Promise.all([
        prisma.invoice.count({ where: { userId } }),
        prisma.invoice.count({ where: { userId, status: "PAID" } }),
        prisma.invoice.count({ where: { userId, status: "PENDING" } }),
        prisma.invoice.count({ where: { userId, status: "OVERDUE" } }),
        // Sum total revenue from paid invoices
        prisma.invoice.aggregate({
          where: { userId, status: "PAID" },
          _sum: { total: true },
        }),
        // Last 5 invoices
        prisma.invoice.findMany({
          where: { userId },
          include: { items: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalPaid: paidInvoices,
        totalPending: pendingInvoices,
        totalOverdue: overdueInvoices,
        totalRevenue: revenueResult._sum.total ?? 0,
        recentInvoices,
      },
    });
  } catch (err) {
    next(err);
  }
}
