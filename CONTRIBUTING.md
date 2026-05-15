# Contributing to StellarInvoice Backend

## Branch Naming

```
feat/short-description
fix/short-description
chore/short-description
docs/short-description
```

## Commit Message Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add payment webhook endpoint
fix: handle duplicate tx hash gracefully
chore: upgrade prisma to v6
```

## Running Locally

```bash
# 1. Clone and install
git clone https://github.com/your-org/stellar-invoicegen-backend
cd stellar-invoicegen-backend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL URL and secrets

# 3. Set up database
npm run db:migrate
npm run db:generate
npm run db:seed

# 4. Start dev server
npm run dev
```

## Pull Request Process

1. Branch from `main`
2. Keep changes focused — one feature or fix per PR
3. Run `npm run build` to check for TypeScript errors
4. Describe what changed and why in the PR description
5. Link related issues

## Coding Standards

- TypeScript strict mode — no implicit `any`
- All controllers must call `next(err)` for error handling
- Use Zod for request validation
- Keep controllers thin — business logic goes in services
- Add JSDoc comments to exported functions

## Good First Issues

- Add request logging middleware
- Add input sanitization for invoice title/description
- Write integration tests for invoice CRUD
- Add pagination metadata to list responses
- Add `GET /api/invoices/:id/payments` endpoint
