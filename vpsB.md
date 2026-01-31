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

3.  **Domain Setup (Opsional tapi Disarankan)**:
    - Masuk ke dashboard Domain Anda (misal: Cloudflare/Niagahoster).
    - Tambahkan **A Record**:
        - Name: `db` (sehingga domain jadi `db.example.com`)
        - Content: `[IP Public VPS B]`
        - Proxy: **OFF** (Hanya DNS). Koneksi DB butuh koneksi TCP langsung.

4.  **Run Agent**:
    ```bash
    pm2 start "npm run dev" --name "syneudp-agent"
    ```

## Nginx Configuration (VPS B)
Karena Anda menggunakan Nginx, buatlah config untuk meneruskan trafik API ke Agent:

```nginx
# /etc/nginx/sites-available/agent
server {
    listen 80;
    server_name agent.anda.com;

    location / {
        proxy_pass http://localhost:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security & Firewall
Sangat penting! Karena laptop Anda (Control Plane) perlu menyambung ke VPS B, Anda harus membuka port berikut di VPS B:

1.  **Port 80/443**: Untuk Agent API (lewat Nginx).
2.  **Port 3307, 5433, 27017**: Untuk koneksi Database langsung.

**Penting tentang Cloudflare Tunnel**:
Jika Cloudflare Tunnel hanya ada di **Laptop**, maka Laptop Anda bertindak sebagai **Client** yang menyambung ke VPS B. 
- Pastikan subdomain `agent.anda.com` dan `db.anda.com` sudah diarahkan ke IP VPS B di DNS.
- Matikan **Proxy (Orange Cloud)** di Cloudflare DNS khusus untuk port database agar koneksi TCP lancar.

