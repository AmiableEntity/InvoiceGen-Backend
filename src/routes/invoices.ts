import { Router } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  verifyPayment,
} from "../controllers/invoiceController";
import { authenticate } from "../middlewares/auth";

export const invoiceRouter = Router();

// Public — anyone with the invoice ID can view it (for shareable links)
invoiceRouter.get("/:id", getInvoiceById);

// Protected — requires JWT
invoiceRouter.use(authenticate);

invoiceRouter.get("/", getInvoices);
invoiceRouter.post("/", createInvoice);
invoiceRouter.put("/:id", updateInvoice);
invoiceRouter.delete("/:id", deleteInvoice);
invoiceRouter.post("/:id/verify-payment", verifyPayment);
