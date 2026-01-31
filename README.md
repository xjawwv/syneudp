# SyneUDP - Managed Database Platform

A pay-as-you-go managed database platform supporting MySQL and PostgreSQL.

## Architecture

```
syneudp/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express.js API server
│   └── agent/        # Service Agent for DB provisioning
├── packages/
│   └── shared/       # Shared types and utilities
└── infra/            # Docker Compose infrastructure
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Supabase project (for auth)

### 1. Start Infrastructure

```bash
cd infra
docker compose up -d
```

This starts:
- Control plane PostgreSQL (port 5432)
- MySQL service engine (port 3306)
- PostgreSQL service engine (port 5433)
- Redis (port 6379)

### 2. Configure Environment

Copy example files and configure:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Agent
cp apps/agent/.env.example apps/agent/.env

# Web
cp apps/web/.env.example apps/web/.env
```

Required configuration:
- `DATABASE_URL` - Control plane PostgreSQL connection
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` - Supabase project credentials
- `AGENT_TOKEN` - Shared secret between API and Agent
- `ENCRYPTION_KEY` - 32-byte hex key for password encryption

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Database Migrations

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1 - Agent
npm run dev:agent

# Terminal 2 - API
npm run dev:api

# Terminal 3 - Web
npm run dev:web
```

## Features

### User Features
- Email/password and Google OAuth authentication
- Wallet-based billing with manual deposits
- MySQL and PostgreSQL database provisioning
- Instance management (suspend, resume, terminate)
- Password rotation
- Usage tracking and history

### Admin Features
- Deposit approval workflow
- User management

### Billing
- Per-second usage tracking
- Priced per hour
- 5-minute billing cycles
- Auto-suspend on negative balance

## API Endpoints

### Authentication
All protected endpoints require `Authorization: Bearer <supabase_jwt>` header.

### User Endpoints
- `GET /api/v1/me` - Get current user
- `GET /api/v1/wallet` - Get wallet balance
- `GET /api/v1/ledger` - Get ledger entries
- `POST /api/v1/deposits` - Request deposit
- `GET /api/v1/deposits` - List deposits
- `GET /api/v1/products` - List products
- `POST /api/v1/instances` - Create instance
- `GET /api/v1/instances` - List instances
- `GET /api/v1/instances/:id` - Get instance
- `POST /api/v1/instances/:id/suspend` - Suspend instance
- `POST /api/v1/instances/:id/resume` - Resume instance
- `POST /api/v1/instances/:id/terminate` - Terminate instance
- `POST /api/v1/instances/:id/rotate-password` - Rotate password
- `PUT /api/v1/instances/:id/allowed-ips` - Update allowed IPs
- `GET /api/v1/usage` - Get usage records

### Admin Endpoints
- `GET /api/v1/admin/deposits` - List pending deposits
- `POST /api/v1/admin/deposits/:id/confirm` - Confirm deposit
- `GET /api/v1/admin/users` - List users

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Prisma
- **Auth**: Supabase Auth
- **Queue**: BullMQ + Redis
- **Databases**: PostgreSQL (control plane), MySQL/PostgreSQL (service engines)
