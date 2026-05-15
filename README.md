# StellarInvoice — Backend

Express + TypeScript REST API with PostgreSQL (Prisma) for the StellarInvoice crypto invoicing system.

## Features

- JWT authentication via Stellar wallet address
- Full invoice CRUD with line items
- On-chain payment verification via Stellar Horizon
- Dashboard stats aggregation
- Rate limiting and security headers
- Prisma ORM with PostgreSQL
- Seed data for development

## Architecture

```
src/
  index.ts              Express app entry point
  controllers/          Route handler logic
  routes/               Express router definitions
  middlewares/          Auth, error handling
  utils/                Prisma client, Stellar helpers
prisma/
  schema.prisma         Database schema
  seed.ts               Sample data seeder
```

## API Structure

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/wallet | No | Connect wallet (register/login) |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/invoices | Yes | List user's invoices |
| GET | /api/invoices/:id | No | Get invoice by ID (public) |
| POST | /api/invoices | Yes | Create invoice |
| PUT | /api/invoices/:id | Yes | Update invoice |
| DELETE | /api/invoices/:id | Yes | Delete invoice |
| POST | /api/invoices/:id/verify-payment | Yes | Verify Stellar payment |
| GET | /api/dashboard/stats | Yes | Dashboard statistics |

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Install

```bash
npm install
```

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE stellar_invoicegen;
```

2. Copy and configure environment:
```bash
cp .env.example .env
# Edit DATABASE_URL and other values
```

3. Run migrations:
```bash
npm run db:migrate
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Seed sample data:
```bash
npm run db:seed
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `STELLAR_NETWORK` | `testnet` or `mainnet` |
| `STELLAR_HORIZON_URL` | Horizon server URL |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Run

```bash
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm run start    # Run compiled output
```

## Deployment

1. Set `NODE_ENV=production`
2. Use a managed PostgreSQL (e.g. Supabase, Railway, Neon)
3. Deploy to Railway, Render, or Fly.io
4. Run `npm run db:migrate` on first deploy

## Future Improvements

- Email notifications on payment
- Webhook support for payment events
- Invoice PDF generation
- Multi-user organizations
- Recurring invoice scheduler
