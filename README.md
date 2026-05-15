# StellarInvoice — Backend

> REST API for the StellarInvoice crypto invoicing system. Handles user auth, invoice management, and on-chain payment verification via the Stellar network.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

---

## What is this?

This is the backend service for StellarInvoice. It:

- Authenticates users by their Stellar wallet address (no passwords)
- Stores invoices and line items in PostgreSQL
- Verifies Stellar payment transactions on-chain via Horizon
- Serves a REST API consumed by the [frontend](https://github.com/AmiableEntity/InvoiceGen-frontend)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Express + TypeScript | HTTP server |
| Prisma ORM | Database access |
| PostgreSQL | Data storage |
| JWT | Authentication tokens |
| Zod | Request validation |
| Stellar SDK | On-chain tx verification |
| Helmet + CORS | Security headers |
| express-rate-limit | Abuse prevention |

---

## Project Structure

```
src/
  index.ts                  App entry point, middleware setup
  controllers/
    authController.ts       Wallet connect, get current user
    invoiceController.ts    Invoice CRUD + payment verification
    dashboardController.ts  Aggregated stats
  routes/
    auth.ts                 POST /api/auth/wallet, GET /api/auth/me
    invoices.ts             Invoice CRUD routes
    dashboard.ts            Dashboard stats route
  middlewares/
    auth.ts                 JWT verification middleware
    errorHandler.ts         Global error handler + AppError class
  utils/
    prisma.ts               Singleton Prisma client
    stellar.ts              Horizon payment verification helper
prisma/
  schema.prisma             Database schema (User, Invoice, Payment)
  seed.ts                   Sample data for development
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/wallet` | No | Register or login with wallet address |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Invoices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/invoices` | Yes | List invoices (paginated) |
| GET | `/api/invoices/:id` | No | Get invoice by ID (public) |
| POST | `/api/invoices` | Yes | Create invoice |
| PUT | `/api/invoices/:id` | Yes | Update invoice |
| DELETE | `/api/invoices/:id` | Yes | Delete invoice |
| POST | `/api/invoices/:id/verify-payment` | Yes | Verify Stellar tx + mark paid |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Yes | Aggregated invoice stats |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone and install

```bash
git clone https://github.com/AmiableEntity/InvoiceGen-backend.git
cd InvoiceGen-backend
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/stellar_invoicegen"
JWT_SECRET=your-secret-here
STELLAR_NETWORK=testnet
CORS_ORIGINS=http://localhost:3000
```

### 3. Set up the database

```bash
# Create the database first (in psql or your GUI)
createdb stellar_invoicegen

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed sample data
npm run db:seed
```

### 4. Run

```bash
npm run dev
# → http://localhost:4000
```

Test the health check:
```bash
curl http://localhost:4000/health
```

---

## Available Scripts

```bash
npm run dev          # Dev server with hot reload (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Regenerate Prisma client
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio (database GUI)
npm run lint         # ESLint
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 4000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `STELLAR_NETWORK` | Yes | `testnet` or `mainnet` |
| `STELLAR_HORIZON_URL` | No | Horizon URL (defaults to testnet) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |

---

## Database Schema

```
User          — wallet address, name, email
Invoice       — title, status, currency, amounts, parties, Stellar tx hash
InvoiceItem   — description, quantity, unit price (belongs to Invoice)
Payment       — tx hash, amount, status (belongs to Invoice)
```

---

## Deployment

1. Set `NODE_ENV=production` and all required env vars
2. Use a managed PostgreSQL (Supabase, Railway, Neon, or RDS)
3. Deploy to Railway, Render, or Fly.io
4. On first deploy, run: `npm run db:migrate`

---

## Related Repos

| Repo | Description |
|---|---|
| [InvoiceGen-frontend](https://github.com/AmiableEntity/InvoiceGen-frontend) | Next.js frontend |
| [InvoiceGen-Contract](https://github.com/AmiableEntity/InvoiceGen-Contract) | Soroban smart contract |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — all skill levels welcome.

---

## Future Improvements

- Email notifications on payment
- Webhook support for payment events
- Invoice PDF generation endpoint
- Recurring invoice scheduler
- Multi-user organizations / teams

---

## License

MIT — see [LICENSE](./LICENSE)
