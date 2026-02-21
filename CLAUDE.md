# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal monthly expense analyzer that ingests Chase credit card CSV exports and displays spending data. Angular 21 frontend, Express/TypeScript backend, MongoDB Atlas database.

**Core workflow:** Upload Chase CSV → expenses stored in MongoDB → view/filter expenses by month → see category spending breakdown.

**Current status:** MVP is functional with dashboard. CSV upload, expense listing with month/year filters, category summary with totals, manual entry, dashboard with income vs expenses charts, and subscription tracking all work end-to-end. The CSV parser maps Chase-specific columns (Date, Description, Amount, Category). MongoDB Atlas connection works (required a DNS SRV fix for Windows — see `server/src/config/db.ts`).

## Commands

### Development
```bash
# Install all dependencies (client + server)
npm run install:all

# Run client dev server (localhost:4200, proxies /api to :3000)
npm run client

# Run server dev server (localhost:3000, auto-reloads via ts-node-dev)
npm run server
```

### Build
```bash
npm run build:client    # Angular production build
npm run build:server    # TypeScript compilation to server/dist/
```

### Test
```bash
cd server && npm test   # Server unit tests via Vitest
cd client && ng test    # Client unit tests via Vitest
```

## Architecture

### Client (`client/`)
- **Angular 21** with standalone components, signals, and lazy-loaded routes
- Four views: Expenses list (`components/expenses/`), Category summary (`components/summary/`), CSV upload (`components/upload/`), Dashboard (`components/dashboard/`)
- `components/subscription-dialog/` — modal dialog for subscription drill-down and exclusion management, opened from dashboard
- `services/expense.service.ts` — all HTTP calls to the backend API (expenses + subscription endpoints)
- `models/expense.model.ts` — shared TypeScript interfaces (Expense, DashboardData, SubscriptionGroup, SubscriptionExclusion, etc.)
- Dev proxy (`proxy.conf.json`) forwards `/api/*` requests to `localhost:3000`

### Server (`server/`)
- **Express** with modular structure: `config/`, `models/`, `routes/`, `services/`
- `config/db.ts` — MongoDB connection using Mongoose; uses Google DNS (8.8.8.8) for SRV resolution to work around Windows router DNS limitations
- `models/expense.model.ts` — Mongoose schema with timestamps and uploadBatchId for grouping CSV imports
- `models/subscription-exclusion.model.ts` — excluded subscription descriptions (contains matching)
- `routes/expense.routes.ts` — REST API: upload CSV, list/filter expenses, category summary, dashboard aggregation, delete
- `routes/subscription.routes.ts` — subscription transactions (grouped by pattern) and exclusion CRUD
- `services/csv-parser.service.ts` — CSV parsing with flexible column name mapping
- `services/subscription.service.ts` — named `SUBSCRIPTION_PATTERNS` array, `matchSubscription()`, `buildSubscriptionRegex()`, `buildExclusionRegex()`. Subscription detection is regex-based against descriptions (Chase has no "Subscription" category)
- File uploads handled by Multer (in-memory storage)

### API Endpoints
- `POST /api/expenses/upload` — CSV file upload (multipart/form-data)
- `POST /api/expenses/manual` — add manual entry (income or expense)
- `GET /api/expenses?month=&year=&category=` — filtered expense list
- `GET /api/expenses/summary?month=&year=` — category-grouped aggregation
- `GET /api/expenses/dashboard?year=&month=` — aggregated dashboard data (trend, categories, merchants, subscriptions)
- `GET /api/expenses/latest-period` — most recent month/year with data
- `GET /api/expenses/years` — distinct years with data
- `DELETE /api/expenses/:id` — delete single expense
- `GET /api/subscriptions/transactions?year=&month=` — subscription transactions grouped by pattern (respects exclusions)
- `GET /api/subscriptions/exclusions` — list all subscription exclusions
- `POST /api/subscriptions/exclusions` — add exclusion `{ description, patternKey, label }`
- `DELETE /api/subscriptions/exclusions/:id` — remove exclusion
- `GET /api/health` — health check

### Dashboard (`components/dashboard/`)
- ECharts via ngx-echarts for charts; `(chartClick)` event for month drill-down
- Stat cards: Total Spent, Total Income, Net Balance, Avg Monthly, Subscriptions (clickable → opens dialog), Months
- Dashboard endpoint supports optional `month` query param; chart data always returns full year
- Subscription total respects exclusions via `$not` regex (not `$nin` exact match)

### Subscription Exclusions
- Exclusions are **description-based with contains matching** — stored pattern is matched case-insensitively against transaction descriptions
- User controls match breadth by editing the pattern text (e.g. `AMAZON PRIME` excludes all variants, `GOOGLE *YouTubePremium` only excludes YouTube Premium)
- Special regex chars are escaped via `escapeRegex()` so patterns match literally
- Exclusions persist in MongoDB and apply globally to dashboard totals and subscription dialog

### Key Patterns
- Angular 21 signals throughout (no RxJS state, only for HTTP calls)
- Chase CSV categories: "Bills & Utilities", "Shopping", "Food & Drink", etc. — no "Subscription" category exists
- `signal.set()` returns void — can't use `||` chains in Angular templates, use helper methods instead
- Manual entry presets per category (Paycheck → "Biweekly Paycheck", Transfer → "Mom Amazon Transfer", Rent → "[Month] Rent", Utilities → "[Month] Utilities") + Custom fallback

### Git Workflow
- Work on `dev` branch, NOT `master`
- To merge into `master`: create a PR via `gh pr create`
- Never push directly to `master`

### Environment
- `MONGODB_URI` env var for database connection (defaults to local MongoDB)
- Server runs on port 3000, client on port 4200
