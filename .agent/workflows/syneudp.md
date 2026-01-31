---
description: Workflow rules for SyneUDP AI Agent to build a pay-as-you-go database service platform using control-plane and agent architecture.
---

# SyneUDP Agent Workflow

You are an autonomous senior software engineer building a production-grade SaaS platform named **SyneUDP**.

The platform provides **pay-as-you-go database services** (MySQL and PostgreSQL). SMTP and other services will be added later and must NOT be implemented now.

You must strictly follow the rules below.

---

## Core Architecture Rules

1. The system MUST be split into two logical planes:
   - Control Plane: API + Web
   - Service Plane: Agent

2. The Control Plane MUST NEVER execute privileged database operations directly.

3. All privileged operations (create database, create user, grant/revoke access, suspend, resume, terminate) MUST be executed by the Agent via internal HTTP calls.

4. The Agent is a private internal service and MUST NOT expose any public endpoints.

5. The Control Plane communicates with the Agent using a shared secret header:
   - Header name: `X-Agent-Token`
   - Token value comes from environment variables and must match on both sides.

---

## Technology Stack Constraints

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (email/password + Google OAuth)

### Backend (Control Plane)
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL (internal control database)

### Service Plane (Agent)
- Node.js
- Express.js
- Direct root access to MySQL and PostgreSQL service engines
- No ORM required

---

## Database Strategy

1. Internal Control Database:
   - PostgreSQL
   - Stores users, products, instances, usage, wallet, ledger
   - Managed via Prisma

2. Service Databases:
   - MySQL service engine
   - PostgreSQL service engine
   - One database + one user per customer instance

3. Credentials for customer databases must be:
   - Randomly generated
   - Stored encrypted at rest in the internal database
   - Never logged in plaintext

---

## Agent Responsibilities

The Agent MUST provide internal HTTP endpoints for:

- Create MySQL database and user
- Create PostgreSQL database and user
- Suspend database access
- Resume database access
- Rotate database user password
- Terminate database (drop db + user)

The Agent MUST:
- Validate `X-Agent-Token`
- Reject any request without a valid token
- Return structured JSON responses
- Never implement authentication for users

---

## Control Plane Responsibilities

The Control Plane MUST:
- Authenticate users using Supabase JWT
- Handle billing and wallet logic
- Track usage per instance
- Call the Agent for all service operations
- Never store root database credentials
- Never expose Agent URLs to frontend

---

## Billing Rules

1. Billing model is pay-as-you-go.
2. Usage is calculated per second and billed hourly.
3. A scheduled worker runs periodically to:
   - Calculate usage
   - Deduct balance
   - Suspend instances when balance is insufficient
4. Billing operations must be idempotent.

---

## Security Rules

1. No secrets may be hardcoded.
2. All secrets must come from environment variables.
3. The Agent must only listen on internal interfaces.
4. User input must always be validated.
5. All errors must return structured JSON responses.

---

## Code Style Rules (ABSOLUTE)

- DO NOT write comments in code.
- DO NOT include commented-out code.
- DO NOT generate README files unless explicitly requested.
- DO NOT explain code unless explicitly asked.
- Use clean, production-ready naming.
- Prefer explicit logic over magic behavior.

Violation of these rules is considered a failure.

---

## Output Expectations

When generating code:
- Output complete files, not partial snippets.
- Include file paths when relevant.
- Ensure the project runs locally via Docker Compose.
- Ensure Prisma migrations and seeds work correctly.

Focus only on **Database Service MVP**.
SMTP, object storage, cron email, and other services MUST NOT be implemented yet.

Follow this workflow strictly.
