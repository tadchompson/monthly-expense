# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal monthly expense analyzer that ingests Chase credit card CSV exports and displays spending data. Angular 21 frontend, Express/TypeScript backend, MongoDB Atlas database.

**Core workflow:** Upload Chase CSV → expenses stored in MongoDB → view/filter expenses by month → see category spending breakdown.

**Current status:** MVP is functional. CSV upload, expense listing with month/year filters, category summary with totals, and individual expense deletion all work end-to-end. The CSV parser maps Chase-specific columns (Date, Description, Amount, Category). MongoDB Atlas connection works (required a DNS SRV fix for Windows — see `server/src/config/db.ts`).

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
cd client && ng test    # Unit tests via Vitest
```

## Architecture

### Client (`client/`)
- **Angular 21** with standalone components, signals, and lazy-loaded routes
- Three views: Expenses list (`components/expenses/`), Category summary (`components/summary/`), CSV upload (`components/upload/`)
- `services/expense.service.ts` — all HTTP calls to the backend API
- `models/expense.model.ts` — shared TypeScript interfaces (Expense, CategorySummary, UploadResponse)
- Dev proxy (`proxy.conf.json`) forwards `/api/*` requests to `localhost:3000`

### Server (`server/`)
- **Express** with modular structure: `config/`, `models/`, `routes/`, `services/`
- `config/db.ts` — MongoDB connection using Mongoose; uses Google DNS (8.8.8.8) for SRV resolution to work around Windows router DNS limitations
- `models/expense.model.ts` — Mongoose schema with timestamps and uploadBatchId for grouping CSV imports
- `routes/expense.routes.ts` — REST API: upload CSV, list/filter expenses, category summary aggregation, delete
- `services/csv-parser.service.ts` — CSV parsing with flexible column name mapping
- File uploads handled by Multer (in-memory storage)

### API Endpoints
- `POST /api/expenses/upload` — CSV file upload (multipart/form-data)
- `GET /api/expenses?month=&year=&category=` — filtered expense list
- `GET /api/expenses/summary?month=&year=` — category-grouped aggregation
- `DELETE /api/expenses/:id` — delete single expense
- `GET /api/health` — health check

### Environment
- `MONGODB_URI` env var for database connection (defaults to local MongoDB)
- Server runs on port 3000, client on port 4200
