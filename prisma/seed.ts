/**
 * Seed script — populates the database with sample data for development.
 * Run: npm run db:seed
 */

import { PrismaClient, InvoiceStatus, Currency } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a sample freelancer user
  const user = await prisma.user.upsert({
    where: { walletAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Alex Rivera",
      email: "alex@freelance.dev",
      walletAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    },
  });

  console.log(`✅ Created user: ${user.name}`);

  // Create sample invoices
  const invoices = [
    {
      invoiceNumber: "INV-001234-001",
      title: "Website Redesign Project",
      description: "Full redesign of company website",
      status: InvoiceStatus.PAID,
      currency: Currency.USDC,
      subtotal: 4200,
      tax: 0,
      total: 4200,
      dueDate: new Date("2026-04-30"),
      freelancerName: "Alex Rivera",
      freelancerEmail: "alex@freelance.dev",
      freelancerWallet: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
      clientName: "TechCorp Inc.",
      clientEmail: "billing@techcorp.io",
      stellarTxHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      userId: user.id,
      items: [
        { description: "UI/UX Design", quantity: 1, unitPrice: 800, total: 800 },
        { description: "Frontend Development", quantity: 40, unitPrice: 75, total: 3000 },
        { description: "QA Testing", quantity: 8, unitPrice: 50, total: 400 },
      ],
    },
    {
      invoiceNumber: "INV-001235-002",
      title: "Smart Contract Audit",
      status: InvoiceStatus.PENDING,
      currency: Currency.XLM,
      subtotal: 2500,
      tax: 0,
      total: 2500,
      dueDate: new Date("2026-05-20"),
      freelancerName: "Alex Rivera",
      freelancerEmail: "alex@freelance.dev",
      freelancerWallet: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
      clientName: "DeFi Labs",
      clientEmail: "ops@defilabs.xyz",
      userId: user.id,
      items: [
        { description: "Contract Review", quantity: 1, unitPrice: 2000, total: 2000 },
        { description: "Vulnerability Report", quantity: 1, unitPrice: 500, total: 500 },
      ],
    },
    {
      invoiceNumber: "INV-001236-003",
      title: "Mobile App Development",
      status: InvoiceStatus.OVERDUE,
      currency: Currency.USDC,
      subtotal: 7200,
      tax: 0,
      total: 7200,
      dueDate: new Date("2026-04-15"),
      freelancerName: "Alex Rivera",
      freelancerEmail: "alex@freelance.dev",
      freelancerWallet: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
      clientName: "StartupXYZ",
      clientEmail: "cto@startupxyz.com",
      userId: user.id,
      items: [
        { description: "App Development Sprint 1", quantity: 80, unitPrice: 90, total: 7200 },
      ],
    },
  ];

  for (const invoiceData of invoices) {
    const { items, ...invoiceFields } = invoiceData;

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceFields,
        items: {
          create: items,
        },
      },
    });

    console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
