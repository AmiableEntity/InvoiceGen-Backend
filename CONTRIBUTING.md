# Contributing to StellarInvoice Backend

Thanks for your interest in contributing! This guide covers everything you need to go from setup to your first merged PR.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Good First Issues](#good-first-issues)
- [Local Setup](#local-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels. Hostile or dismissive behavior will not be tolerated.

---

## Ways to Contribute

- **Fix a bug** — pick an open issue and submit a PR
- **Add an endpoint** — check the roadmap issues first
- **Improve validation** — tighten up Zod schemas
- **Write tests** — integration tests are especially needed
- **Improve error messages** — make them more actionable
- **Update docs** — fix typos, improve setup instructions

---

## Good First Issues

These are well-scoped and beginner-friendly:

- [ ] Add `GET /api/invoices/:id/payments` — list payments for an invoice
- [ ] Add `PATCH /api/invoices/:id/status` — manually update invoice status
- [ ] Return `shareableLink` in invoice responses (constructed from `APP_URL` env var)
- [ ] Add request body logging in development mode
- [ ] Improve seed data — add more varied invoice examples
- [ ] Add input sanitization (strip HTML from string fields)
- [ ] Write integration tests for the auth endpoints
- [ ] Add `updatedAt` filter to invoice list query (`?updatedAfter=ISO_DATE`)

Look for issues tagged [`good first issue`](https://github.com/AmiableEntity/InvoiceGen-backend/issues?q=label%3A%22good+first+issue%22) on GitHub.

---

## Local Setup

```bash
# 1. Fork the repo, then clone your fork
git clone https://github.com/YOUR_USERNAME/InvoiceGen-backend.git
cd InvoiceGen-backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum

# 4. Set up the database
createdb stellar_invoicegen       # or use your preferred PostgreSQL GUI
npm run db:migrate
npm run db:generate
npm run db:seed

# 5. Start the dev server
npm run dev
# → http://localhost:4000

# 6. Verify it's running
curl http://localhost:4000/health
```

---

## Branch Naming

```
feat/short-description        New feature or endpoint
fix/short-description         Bug fix
chore/short-description       Deps, config, tooling
docs/short-description        Documentation only
test/short-description        Tests only
```

Examples:
```
feat/invoice-payments-endpoint
fix/duplicate-txhash-error
test/auth-controller-integration
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add GET /api/invoices/:id/payments endpoint
fix: handle Prisma unique constraint on duplicate tx hash
chore: upgrade @stellar/stellar-sdk to v12
test: add integration tests for invoice creation
docs: add database schema diagram to README
```

Rules:
- Present tense ("add" not "added")
- First line under 72 characters
- Add a body for non-obvious changes

---

## Pull Request Process

1. **Fork** and branch from `main`
2. **Keep changes focused** — one feature or fix per PR
3. **Check for errors** before opening:
   ```bash
   npm run build        # TypeScript must compile cleanly
   npm run lint         # No lint errors
   ```
4. **Open the PR** with:
   - A clear title following commit message style
   - What changed and why
   - Any relevant issue links (`Closes #123`)
   - Notes on anything that needs special review attention
5. **Address review feedback** promptly — we aim to review within a few days

---

## Coding Standards

- **TypeScript strict mode** — no implicit `any`, no `@ts-ignore` without explanation
- **Error handling** — all controller functions must call `next(err)`, never `res.status(500).send()`
- **Validation** — use Zod for all request body validation before touching the database
- **Thin controllers** — business logic belongs in services or utils, not controllers
- **Prisma transactions** — use `prisma.$transaction()` when multiple writes must be atomic
- **JSDoc comments** — add `/** */` comments to all exported functions describing what they do, their params, and what they throw
- **No raw SQL** — use Prisma query methods only

---

## Reporting Bugs

Open an issue with:

1. The endpoint and request that triggered the bug
2. Expected response vs actual response
3. Any relevant error logs
4. Your Node.js and PostgreSQL versions

---

## Suggesting Features

Open an issue describing:

1. The problem or use case
2. Your proposed API design (endpoint, request body, response shape)
3. Any edge cases to consider

Discuss before building — this avoids wasted effort on approaches that won't be merged.

---

Thanks for contributing. Every improvement, no matter how small, makes this project better for everyone.
