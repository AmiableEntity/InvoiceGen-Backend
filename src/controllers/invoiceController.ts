import type { Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../utils/prisma";
import { verifyPaymentOnChain } from "../utils/stellar";
import { AppError } from "../middlewares/errorHandler";
import type { AuthRequest } from "../middlewares/auth";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  total: z.number().positive(),
});

const updateInvoiceSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  currency: z.enum(["XLM", "USDC"]).optional(),
  dueDate: z.string().datetime().or(z.string().min(1)).optional(),
  clientName: z.string().min(1).optional(),
  clientEmail: z.string().email().optional(),
  clientWallet: z.string().optional(),
  freelancerName: z.string().min(1).optional(),
  freelancerEmail: z.string().email().optional(),
  freelancerWallet: z.string().min(1).optional(),
  items: z.array(itemSchema).min(1).optional(),
  subtotal: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  total: z.number().positive().optional(),
});

const createInvoiceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  currency: z.enum(["XLM", "USDC"]),
  dueDate: z.string().datetime().or(z.string().min(1)),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientWallet: z.string().optional(),
  freelancerName: z.string().min(1),
  freelancerEmail: z.string().email(),
  freelancerWallet: z.string().min(1),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().default(0),
  total: z.number().positive(),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/invoices
 * Returns paginated invoices for the authenticated user.
 */
export async function getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: req.userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where: { userId: req.userId } }),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/invoices/:id
 * Returns a single invoice by ID. Public endpoint — no auth required.
 */
export async function getInvoiceById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { items: true, payments: true },
    });

    if (!invoice) throw new AppError("Invoice not found", 404);

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/invoices
 * Creates a new invoice for the authenticated user.
 */
export async function createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(`Validation error: ${parsed.error.errors[0].message}`, 400);
    }

    const { items, ...invoiceData } = parsed.data;

    // Generate a unique invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        dueDate: new Date(invoiceData.dueDate),
        userId: req.userId!,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/invoices/:id
 * Updates an invoice. Only the owner can update.
 */
export async function updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) throw new AppError("Invoice not found", 404);
    if (existing.userId !== req.userId) throw new AppError("Forbidden", 403);
    if (existing.status === "PAID") throw new AppError("Cannot edit a paid invoice", 400);

    const parsed = updateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(`Validation error: ${parsed.error.errors[0].message}`, 400);
    }

    const { items, ...updateData } = parsed.data;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items,
          },
        }),
      },
      include: { items: true },
    });

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/invoices/:id
 * Deletes an invoice. Only the owner can delete.
 */
export async function deleteInvoice(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) throw new AppError("Invoice not found", 404);
    if (existing.userId !== req.userId) throw new AppError("Forbidden", 403);

    await prisma.invoice.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: null, message: "Invoice deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/invoices/:id/verify-payment
 * Verifies a Stellar transaction and marks the invoice as paid.
 */
export async function verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { txHash } = req.body;
    if (!txHash || typeof txHash !== "string") {
      throw new AppError("txHash is required", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
    });

    if (!invoice) throw new AppError("Invoice not found", 404);
    if (invoice.status === "PAID") throw new AppError("Invoice is already paid", 400);

    // Check if this tx hash was already used
    const existingPayment = await prisma.payment.findUnique({ where: { txHash } });
    if (existingPayment) throw new AppError("Transaction already used for payment", 409);

    // Verify on Stellar network
    const verification = await verifyPaymentOnChain({
      txHash,
      expectedRecipient: invoice.freelancerWallet,
      expectedAmount: invoice.total,
      currency: invoice.currency,
    });

    if (!verification.valid) {
      throw new AppError(`Payment verification failed: ${verification.error}`, 400);
    }

    // Mark invoice as paid and record payment in a transaction
    const [updatedInvoice] = await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", stellarTxHash: txHash },
        include: { items: true },
      }),
      prisma.payment.create({
        data: {
          id: uuidv4(),
          txHash,
          amount: invoice.total,
          currency: invoice.currency,
          status: "CONFIRMED",
          paidAt: new Date(),
          invoiceId: invoice.id,
        },
      }),
    ]);

    res.json({ success: true, data: updatedInvoice, message: "Payment verified and invoice marked as paid" });
  } catch (err) {
    next(err);
  }
}
