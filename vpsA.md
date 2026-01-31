# VPS A: Website & Control Plane Setup

This VPS hosts the main application, API, and management services.

## Prerequisites
- Node.js (Latest LTS)
- PostgreSQL (Internal Control DB)
- Redis

## Setup Steps
1.  **Clone/Copy Files**:
    ```bash
    # Copy project files here
    cd syneudp
    npm install
    ```

2.  **Environment Configuration**:
    Configure `apps/api/.env` and `apps/web/.env.local`.
    ```env
    # apps/api/.env
    PORT=4000
    DATABASE_URL=postgresql://... (Internal DB)
    REDIS_URL=redis://localhost:6379
    AGENT_URL=https://your-vpsB-tunnel.com # AGENT API (via Tunnel)
    AGENT_TOKEN=your-secure-token
    DB_HOST=db.example.com # Domain atau IP VPS B (untuk koneksi DB)
    ```

3.  **Initialization**:
    ```bash
    # Run migrations
    cd apps/api
    npx prisma migrate dev
    npm run db:seed
    ```

4.  **Run Services**:
    Recommend using `pm2` for production:
    ```bash
    pm2 start "npm run start" --name "syneudp-api" --cwd "./apps/api"
    pm2 start "npm run start" --name "syneudp-web" --cwd "./apps/web"
    ```

## Connectivity
- Ensure port `4000` (API) and `3000` (Web) are accessible or reverse-proxied (Nginx).
- Needs to be able to reach **VPS B** via the Tunnel URL or Public IP.
