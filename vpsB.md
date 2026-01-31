# VPS B: Database Service & Agent Setup

This VPS acts as the compute node where user databases are actually provisioned.

## Prerequisites
- Node.js (Latest LTS)
- Docker (Recommended for managing DB engines) or Native:
    - MySQL
    - PostgreSQL
    - MongoDB

## Setup Steps
1.  **Copy Agent Files**:
    ```bash
    # Copy apps/agent folder
    cd agent
    npm install
    ```

2.  **Environment Configuration**:
    Configure `apps/agent/.env`:
    ```env
    PORT=4001
    AGENT_TOKEN=your-secure-token (MUST MATCH VPS A)
    
    # Root Credentials for Provisioning
    MYSQL_ROOT_PASSWORD=...
    POSTGRES_PASSWORD=...
    MONGODB_URL=mongodb://root:password@localhost:27017
    ```

3.  **Run Agent**:
    ```bash
    pm2 start "npm run dev" --name "syneudp-agent"
    ```

## Cloudflare Tunnel (Important)
If this VPS doesn't have a public static IP, expose the agent port:
```bash
cloudflared tunnel --url http://localhost:4001
```
Copy the resulting URL and put it in `AGENT_URL` on **VPS A**.

## Security
- Open ports `3306`, `5433`, `27017` only to **VPS A's IP** (Whitelisting).
- The Agent itself should only be reachable via the Tunnel or a Private Network.
