# NetShield DNS — Complete Documentation

A self-hosted DNS server for your home network with a full web dashboard. It filters ads and trackers, lets you create local DNS records, logs every query from every device on your network, and gives you traffic steering rules — all manageable from a browser.

---

## Table of Contents

1. [How It Works](#1-how-it-works)
2. [Installation & First Run](#2-installation--first-run)
3. [Connecting to Your Home Router](#3-connecting-to-your-home-router)
4. [The Dashboard](#4-the-dashboard)
5. [Feature Reference](#5-feature-reference)
   - [Query Logs](#51-query-logs)
   - [Local DNS Records](#52-local-dns-records)
   - [Blocklist Management](#53-blocklist-management)
   - [Traffic Steering](#54-traffic-steering)
   - [Settings](#55-settings)
   - [Profile](#56-profile)
6. [API Reference](#6-api-reference)
7. [CLI Flags](#7-cli-flags)
8. [Architecture Deep Dive](#8-architecture-deep-dive)
9. [Troubleshooting](#9-troubleshooting)
10. [Default Credentials](#10-default-credentials)

---

## 1. How It Works

When any device on your network (phone, laptop, TV, smart bulb) needs to look up a domain name, it asks a DNS server. Normally that server is your ISP or Google. NetShield DNS puts your own computer in that role.

```
Device asks: "What is the IP for google.com?"
         │
         ▼
   Your Router (192.168.1.1)
         │  forwards DNS queries to NetShield
         ▼
   NetShield DNS (192.168.1.X:53)
         │
         ├─ Is the domain on the blocklist?
         │     YES → return 0.0.0.0 (blocked)
         │
         ├─ Is there a custom local record?
         │     YES → return your local IP (e.g. 192.168.1.50)
         │
         ├─ Is it in the in-memory cache?
         │     YES → return cached answer instantly
         │
         └─ Forward to upstream (Cloudflare 1.1.1.1 / Google 8.8.8.8)
               → cache the answer
               → return it to the device
```

Every query — blocked, allowed, cached, custom — is logged to SQLite and shown live in the dashboard.

---

## 2. Installation & First Run

### Prerequisites

The development environment runs entirely inside Docker. You do not need Go or Node.js installed on your machine.

**For Docker-based workflow (recommended):**
- Docker 24 or later
- Docker Compose v2 (`docker compose` — note: no hyphen)

**For building from source without Docker:**
- Go 1.22 or later
- Node.js 18+ and npm
- Linux/macOS (Windows works but port 53 may need extra steps)

---

### Quick start with Docker (recommended)

This is how the project is developed. Everything — backend hot-reload, frontend HMR, linting, and production builds — runs in containers.

#### 1. Clone and set up

```bash
git clone <repo-url>
cd home_network_DNS_management_system

# One-time setup: wires git hooks and pre-builds the check images
make setup
```

#### 2. Start the development stack

```bash
make dev
```

This starts two containers:

| Container | What it runs | URL |
|-----------|-------------|-----|
| `dns-server-dev` | Go backend with **Air hot-reload** — recompiles on every `.go` save | `http://localhost:8080` |
| `frontend-1` | React + Vite with **HMR** — updates instantly on every `.tsx` save | `http://localhost:5173` |

DNS listens on **UDP port 5354** on the host (mapped to 5353 inside the container). Port 5354 is used in dev to avoid conflicts with system services that hold 53 and 5353.

Open **http://localhost:5173** in your browser. The Vite dev server proxies all `/api` requests to the backend automatically.

#### 3. Useful dev commands

```bash
make logs        # tail live logs from both containers
make dev-down    # stop the dev stack
make test        # run Go lint (golangci-lint) + unit tests + TypeScript type-check
make test-backend   # Go checks only
make test-frontend  # TypeScript type-check only
```

#### 4. What hot-reload covers

- **Backend:** [Air](https://github.com/air-verse/air) watches `backend/` and recompiles on every `.go` change. The new binary starts automatically — no manual restart.
- **Frontend:** Vite HMR pushes React component updates to the browser instantly — no page reload needed.

---

### Production build with Docker

Builds a single minimal Alpine image (~20 MB) with the Go binary and the compiled React frontend embedded inside it.

```bash
# Build the production image
make build

# Start the production stack (detached, restarts on failure)
make up
# → Dashboard at http://localhost:8080
# → DNS on port 53 (host networking)

# Stop
make down
```

The production container runs as a non-root user. The binary receives `cap_net_bind_service` so it can bind port 53 without root.

Data is persisted in a Docker named volume (`dns-data`). The database survives container restarts and image rebuilds.

```bash
# Rebuild from scratch and restart
make restart

# View production logs
docker compose -f docker/docker-compose.yml logs -f

# Remove all containers AND the data volume (destructive — deletes all logs/records)
make clean-all
```

#### Override production flags

Edit `docker/docker-compose.yml` and uncomment the `command:` line:

```yaml
command: ["./dns-server", "--upstream", "9.9.9.9:53", "--log-prune", "168h"]
```

Then `make restart` to apply.

---

### Build from source (no Docker)

Only needed if you cannot use Docker.

```bash
git clone <repo-url>
cd home_network_DNS_management_system

# 1. Build the frontend
cd frontend
npm install
npm run build        # outputs to frontend/dist/
cd ..

# 2. Build the Go binary with the frontend embedded
cd backend
go build -tags embed -o ../netshield-dns ./cmd/dns-server
cd ..

# 3. Run (port 53 requires root or cap_net_bind_service)
sudo ./netshield-dns
```

#### Run in development mode (no Docker)

```bash
# Terminal 1 — backend on a high port (no root needed)
cd backend
go run ./cmd/dns-server \
  --http-port 8080 \
  --dns-port  5353 \
  --log-level debug

# Terminal 2 — frontend dev server
cd frontend
npm install
npm run dev
# Open http://localhost:5173
# Vite proxies /api → http://localhost:8080 automatically
```

---

### Docker file layout

```
docker/
├── Dockerfile              # Multi-stage: frontend-builder → builder → dev → test → production
├── docker-compose.yml      # Production stack (host networking, port 53)
├── docker-compose.dev.yml  # Dev stack (Air + Vite HMR, ports 8080 / 5173 / 5354)
└── docker-compose.test.yml # CI/check stack (golangci-lint + tsc)
```

| Stage | Base image | Purpose |
|-------|-----------|---------|
| `frontend-builder` | `node:22-alpine` | `npm run build` — compiles React to `dist/` |
| `builder` | `golang:1.25-alpine` | `go build -tags embed` — embeds `dist/` into binary |
| `dev` | `golang:1.25-alpine` | Air hot-reload; source mounted as volume |
| `test` | `golang:1.25-alpine` | golangci-lint + go test; used by pre-commit hook |
| `production` | `alpine:3.20` | Final image — binary only, ~20 MB |

---

### First run output

```
{"level":"INFO","msg":"listening","protocol":"UDP","port":53}
{"level":"INFO","msg":"listening","protocol":"TCP","port":53}
{"level":"INFO","msg":"listening","protocol":"HTTP","port":8080}
```

Open **http://localhost:8080** (production) or **http://localhost:5173** (dev) and log in.

---

## 3. Connecting to Your Home Router

This is the step that makes NetShield work for every device on your network automatically.

### Step 1 — Find your server's local IP

```bash
ip addr show | grep 'inet ' | grep -v '127.0.0.1'
# Example output: inet 192.168.1.50/24
```

### Step 2 — Give the server a fixed IP

Devices get IP addresses from the router via DHCP. By default those addresses can change. Fix it so your server always has the same IP.

**In the router (recommended):** Router admin panel → DHCP / LAN settings → find your server by its MAC address → assign a reserved IP (e.g. `192.168.1.50`).

**On Linux directly:**
```bash
# Find your connection name
nmcli con show

# Set static IP
nmcli con modify "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses 192.168.1.50/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns 127.0.0.1
nmcli con up "Wired connection 1"
```

### Step 3 — Allow DNS through the firewall

```bash
sudo ufw allow 53/udp
sudo ufw allow 53/tcp
sudo ufw allow 8080/tcp  # dashboard
```

### Step 4 — Tell your router to use NetShield

Log into your router admin (usually `http://192.168.1.1` or `http://192.168.0.1`).

Find the **DHCP settings** or **LAN DNS settings** and set:

```
Primary DNS:    192.168.1.50    ← your server's static IP
Secondary DNS:  1.1.1.1         ← fallback if your server is down
```

Save and restart the router. Every device that reconnects will now use NetShield DNS automatically — no configuration needed on each device.

### Step 5 — Auto-start on boot

```bash
sudo tee /etc/systemd/system/netshield-dns.service > /dev/null << 'EOF'
[Unit]
Description=NetShield DNS Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/netshield
ExecStart=/opt/netshield/netshield-dns
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable netshield-dns
sudo systemctl start netshield-dns
sudo systemctl status netshield-dns
```

### Step 6 — Verify it is working

From any device on your WiFi:

```bash
# Should return an answer and show your server's IP in the SERVER line
dig @192.168.1.50 google.com

# Test a blocked domain (should return 0.0.0.0 if on the blocklist)
dig @192.168.1.50 ads.doubleclick.net

# Check the dashboard — you will see the query appear in Query Logs
```

---

## 4. The Dashboard

Open **http://your-server-ip:8080** in any browser on your network.

### Login

Default credentials (change immediately after first login):

```
Email:    anontom90@gmail.com
Password: admin@1234
```

### Layout

```
┌─────────────────┬──────────────────────────────────────────────┐
│                 │  Header — Search (⌘K), Notifications, User  │
│   Sidebar       ├──────────────────────────────────────────────┤
│                 │                                              │
│  ● Dashboard    │            Page Content                      │
│  ● DNS Records  │                                              │
│  ● Steering     │                                              │
│  ● Blocklist    │                                              │
│  ● Query Log    │                                              │
│  ● Settings     │                                              │
│  ● Cloud Sync   │                                              │
│  ● Profile      │                                              │
└─────────────────┴──────────────────────────────────────────────┘
```

The **header search** (press `⌘K` or `Ctrl+K`) lets you jump to any page by typing a keyword. Use arrow keys to navigate, Enter to open.

### Dashboard page

The main dashboard shows four real-time stat cards (total queries, blocked, % blocked, cache size), a compact view of the 5 most recent queries, a System Health panel, and a Network Load chart that plots the live query rate over the last 7 poll intervals. All data refreshes every 3 seconds and re-fetches immediately when you switch back to the browser tab.

---

## 5. Feature Reference

### 5.1 Query Logs

**Page:** Sidebar → Query Log

Shows every DNS query made by every device on your network in real time. The dashboard also shows a compact version of the 5 most recent queries.

#### What each column means

| Column | Description |
|--------|-------------|
| Timestamp | When the query was made |
| Client | IP address of the device that made the request |
| Domain | The domain name that was looked up |
| Type | Record type (A = IPv4, AAAA = IPv6, etc.) |
| Status | What happened to the query (see below) |

#### Status types

| Status | Colour | Meaning |
|--------|--------|---------|
| **Allowed** | Green | Query was forwarded to upstream DNS and answered |
| **Blocked** | Red | Domain is on the blocklist — returned `0.0.0.0` |
| **Cached** | Blue | Answer was served from the local in-memory cache — no upstream request made |
| **Custom** | Amber | Domain matched a local DNS record you defined |

#### Filtering

- **Domain search** — type in the search box to filter by domain name (400ms debounce, hits the server on each change)
- **All / Blocked / Allowed** — toggle buttons filter to show only that category; all filters are applied server-side
- **Pagination** — the table shows 25 logs per page; use the arrows to navigate. Up to 500 logs are fetched per poll

#### How logs are written

Logs are written **asynchronously** — the DNS server never waits for the database write to respond to a query. Logs are buffered in memory (up to 100 entries) and flushed to SQLite in a batch transaction every 5 seconds (or when the buffer hits 100). This keeps DNS response time fast even under heavy load.

#### Clearing logs

Click **Clear** in the header. A confirmation dialog appears. Confirming calls `DELETE /api/logs` and wipes the entire `query_logs` table. This is permanent.

#### Auto-refresh

Logs auto-refresh every 3 seconds. The table also re-fetches immediately when you switch back to the browser tab.

#### Log pruning (optional)

Start the server with `--log-prune 72h` to automatically delete logs older than 72 hours. The prune job runs every hour.

---

### 5.2 Local DNS Records

**Page:** Sidebar → DNS Records

Lets you map a domain name to a local IP address. Useful for giving your home devices easy-to-remember names.

**Example use cases:**
- `nas.home` → `192.168.1.20` (your NAS)
- `router.home` → `192.168.1.1`
- `pi.home` → `192.168.1.10` (a Raspberry Pi)
- `printer.home` → `192.168.1.30`

#### Adding a record

1. Select the record type (A for IPv4 is the most common)
2. Enter the domain name — e.g. `nas.home`
3. Enter the IP value — e.g. `192.168.1.20`
4. Click **Add Record** (or press Enter in either field)

Once added, any device on your network can reach `nas.home` and it will resolve to `192.168.1.20`. No need to remember IP addresses.

#### How it works internally

When a DNS query arrives for a domain, the handler checks `custom_records` in SQLite **before** checking the cache or forwarding upstream. If a match is found, the local IP is returned with a 300-second TTL. Custom records take priority over upstream DNS — you can override any domain this way.

**Validation rules:**
- Domain: 1–253 characters, letters/digits/dots/hyphens/underscores only
- IP: must be a valid IPv4 or IPv6 address (validated with `net.ParseIP`)

#### Deleting a record

Click the trash icon on any row. A confirmation dialog asks before deleting.

---

### 5.3 Blocklist Management

**Page:** Sidebar → Blocklist

Controls which domains are blocked across your entire network.

#### How blocking works

When a DNS query arrives, the server checks `IsBlocked(domain)` in SQLite **first**, before anything else. If the domain matches, the server returns `0.0.0.0` (a loopback black hole) with a 60-second TTL. The device gets no valid IP and the connection fails silently.

The SQL check supports wildcard blocking:

```sql
SELECT COUNT(*) FROM blocklist
WHERE ? LIKE CASE WHEN wildcard THEN '%' || domain ELSE domain END
```

A wildcard entry of `example.com` with `wildcard=true` blocks `ads.example.com`, `tracker.example.com`, and all subdomains.

#### Block-NXDOMAIN mode

Start the server with `--block-nxdomain` to return `NXDOMAIN` (domain does not exist) instead of `0.0.0.0`. Some clients handle NXDOMAIN better; others prefer the black-hole IP. Default is `0.0.0.0`.

#### Block an individual domain

1. Go to **Block Individual Domain** panel
2. Enter the domain — e.g. `ads.example.com`
3. Click **Block Domain**

The domain is added to the `blocklist` table and takes effect immediately for all future queries. Active queries in-flight are not affected.

#### Unblock a domain

In the **Recently Blocked** list, hover a domain and click the trash icon. A confirmation dialog appears before removing it.

#### Adlist sources (UI display)

The adlist sources shown in the table (StevenBlack, OISD, etc.) are currently display-only mock entries. They show what a fully integrated adlist sync system would look like. The blocking that actually works comes from domains you manually add via the dashboard or the API.

#### Log entries for blocked domains

Every blocked query is logged with `action = "blocked"`. You can see them in Query Logs filtered by **Blocked**.

---

### 5.4 Traffic Steering

**Page:** Sidebar → Traffic Steering

Lets you define named rules that express how DNS traffic should be routed. Rules are stored in the database, ordered by priority, and can be toggled on/off at any time.

> **Note:** Steering rules are stored and displayed in the dashboard. The DNS handler currently evaluates blocklist and custom records directly. Steering rules express intended routing policy and are ready for DNS handler integration in a future update.

#### Rule fields

| Field | Description |
|-------|-------------|
| **Rule Name** | A human-readable label — e.g. "Block Social Media" |
| **Priority** | 1–10. Lower number = evaluated first. Two rules with the same priority are ordered by insertion order |
| **Condition Type** | What to match on: Domain, Client IP, Query Type, or Time Range |
| **Condition Value** | The value to match — e.g. `*.corp.internal`, `192.168.1.0/24`, `A`, `09:00-18:00` |
| **Action** | What to do: Forward, Block, or Redirect |
| **Target** | For Forward/Redirect: the IP or upstream address. Not used for Block |

#### Creating a rule

1. Fill in all fields in the **Create Steering Rule** form
2. Click **Add Rule**
3. The rule appears in the table sorted by priority

#### Enabling / disabling a rule

Use the toggle switch in the **Status** column. The change is saved instantly via `PUT /api/steering`.

#### Deleting a rule

Click the trash icon on a row. A confirmation dialog appears.

#### Example rules

| Name | Condition Type | Condition Value | Action | Target |
|------|---------------|-----------------|--------|--------|
| Block ads | Domain | `ads.google.com` | Block | — |
| Internal DNS | Domain | `*.corp.local` | Forward | `10.0.0.53` |
| IoT isolation | Client IP | `192.168.2.0/24` | Forward | `1.1.1.1` |

---

### 5.5 Settings

**Page:** Sidebar → Settings

#### Server Name

A label for this node. Stored in the `settings` table under the key `server_name`.

#### Automatic Updates

A toggle stored in settings under `auto_update`. In a production deployment this would trigger automatic blocklist re-syncs.

#### Upstream DNS

Select which DNS provider to forward queries to when they are not blocked, cached, or matched by a custom record.

| Option | Address |
|--------|---------|
| Cloudflare | `1.1.1.1:53` |
| Google | `8.8.8.8:53` |
| Quad9 | `9.9.9.9:53` |
| Custom | Any `IP:port` |

The server always has two upstreams configured: the one you select, plus `8.8.8.8:53` as a hardcoded fallback. If the primary upstream fails, it automatically retries with the fallback. A background health-check loop probes each upstream every 30 seconds.

**Note:** Changing the upstream in the dashboard saves to the `settings` table. For the change to affect live DNS queries the server needs to be restarted — the upstream is read at startup from the `--upstream` flag.

#### Saving settings

Click **Save Configuration**. Settings are written to the `settings` table using `INSERT OR REPLACE` in a single transaction. A success toast confirms the save.

---

### 5.6 Profile

**Page:** User menu (top-right avatar) → Profile

#### Change Password

Enter your current password, a new password (minimum 8 characters), and confirm the new password. Click **Save Changes**.

**What happens internally:**
1. The server verifies your current password using Argon2id
2. If correct and the new password is at least 8 characters, a new Argon2id hash is computed with a fresh 16-byte random salt
3. The `users` table is updated with the new hash
4. Your existing session remains valid — you do not need to log in again

**Password hashing:** Argon2id with `m=19456`, `t=2`, `p=1`. The stored format is:
```
$argon2id$v=19$m=19456,t=2,p=1$<base64-salt>$<base64-hash>
```

#### Sign Out

Click your avatar → **Sign out**. This calls `DELETE /api/session` with your bearer token, which deletes the session row from SQLite. The token is immediately invalid server-side.

---

## 6. API Reference

All endpoints except `/health` and `/api/login` require a `Authorization: Bearer <token>` header.

Get a token by logging in:

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anontom90@gmail.com","password":"admin@1234"}'
# → {"token":"<your-token>"}

TOKEN="<paste token here>"
```

---

### Authentication

#### `POST /api/login`
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anontom90@gmail.com","password":"admin@1234"}'
```
Response: `{"token":"abc123..."}`

#### `DELETE /api/session`
```bash
curl -X DELETE http://localhost:8080/api/session \
  -H "Authorization: Bearer $TOKEN"
```

---

### Status

#### `GET /api/status`
```bash
curl http://localhost:8080/api/status -H "Authorization: Bearer $TOKEN"
```
```json
{
  "queries_forwarded": 1423,
  "queries_blocked": 204,
  "queries_custom": 12,
  "queries_cached": 567,
  "cache_size": 342,
  "cache_hits": 567,
  "cache_misses": 856,
  "uptime_seconds": 86400.5
}
```

#### `GET /health`
No auth required.
```bash
curl http://localhost:8080/health
# → {"status":"ok"}
```

---

### Query Logs

#### `GET /api/logs`
```bash
# All logs (default limit 100, max 1000)
curl "http://localhost:8080/api/logs" -H "Authorization: Bearer $TOKEN"

# Filter options
curl "http://localhost:8080/api/logs?action=blocked" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:8080/api/logs?action=forwarded" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:8080/api/logs?domain=google" -H "Authorization: Bearer $TOKEN"
curl "http://localhost:8080/api/logs?action=blocked&domain=ads&limit=50" -H "Authorization: Bearer $TOKEN"
```
Logs are returned newest first. `action` must be one of: `forwarded`, `blocked`, `custom`, `cached`.

#### `DELETE /api/logs`
```bash
curl -X DELETE http://localhost:8080/api/logs -H "Authorization: Bearer $TOKEN"
```

---

### Local DNS Records

#### `GET /api/records`
```bash
curl http://localhost:8080/api/records -H "Authorization: Bearer $TOKEN"
# → {"nas.home":"192.168.1.20","router.home":"192.168.1.1"}
```

#### `POST /api/records`
```bash
curl -X POST http://localhost:8080/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"nas.home","ip":"192.168.1.20"}'
```

#### `DELETE /api/records`
```bash
curl -X DELETE http://localhost:8080/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"nas.home"}'
```

---

### Blocklist

#### `GET /api/blocklist`
```bash
curl http://localhost:8080/api/blocklist -H "Authorization: Bearer $TOKEN"
```
```json
[
  {"domain":"ads.example.com","added_at":"2024-10-25T10:00:00Z","wildcard":false},
  {"domain":"tracker.net","added_at":"2024-10-25T11:00:00Z","wildcard":true}
]
```

#### `POST /api/blocklist`
```bash
# Block exact domain
curl -X POST http://localhost:8080/api/blocklist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"ads.example.com","wildcard":false}'

# Block domain and ALL subdomains
curl -X POST http://localhost:8080/api/blocklist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"tracker.net","wildcard":true}'
```

#### `DELETE /api/blocklist`
```bash
curl -X DELETE http://localhost:8080/api/blocklist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"ads.example.com"}'
```

---

### Traffic Steering

#### `GET /api/steering`
```bash
curl http://localhost:8080/api/steering -H "Authorization: Bearer $TOKEN"
```

#### `POST /api/steering`
```bash
curl -X POST http://localhost:8080/api/steering \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Block Social Media",
    "condition_type": "Domain",
    "condition_value": "*.facebook.com",
    "action_type": "Block",
    "action_target": "",
    "priority": 1,
    "enabled": true
  }'
# → {"id":3,"ok":true}
```

#### `PUT /api/steering`
Toggle enabled state:
```bash
curl -X PUT http://localhost:8080/api/steering \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":3,"enabled":false}'
```

#### `DELETE /api/steering`
```bash
curl -X DELETE http://localhost:8080/api/steering \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":3}'
```

---

### Settings

#### `GET /api/settings`
```bash
curl http://localhost:8080/api/settings -H "Authorization: Bearer $TOKEN"
# → {"server_name":"home-dns","upstream_dns":"1.1.1.1:53","auto_update":"true"}
```

#### `PUT /api/settings`
```bash
curl -X PUT http://localhost:8080/api/settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"server_name":"home-dns","upstream_dns":"9.9.9.9:53","auto_update":"true"}'
```

---

### Password

#### `PUT /api/password`
```bash
curl -X PUT http://localhost:8080/api/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"admin@1234","new_password":"MyNewPass99"}'
```

---

## 7. CLI Flags

```bash
sudo ./netshield-dns [flags]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--dns-port` | `53` | UDP/TCP port to listen for DNS queries |
| `--http-port` | `8080` | Port for the web dashboard and REST API |
| `--db` | `data/dns.db` | Path to the SQLite database file |
| `--upstream` | `1.1.1.1:53` | Primary upstream DNS resolver |
| `--cache-size` | `1000` | Maximum entries in the in-memory DNS cache |
| `--block-nxdomain` | `false` | Return NXDOMAIN instead of `0.0.0.0` for blocked domains |
| `--log-prune` | disabled | Auto-delete logs older than this duration (e.g. `72h`) |
| `--log-format` | `text` | Log format: `text` or `json` |
| `--log-level` | `info` | Log verbosity: `debug`, `info`, `warn`, `error` |
| `--static` | `` | Serve static files from this directory (dev only) |

### Examples

```bash
# Production — JSON logs, large cache, auto-prune after 30 days
sudo ./netshield-dns \
  --upstream 9.9.9.9:53 \
  --cache-size 5000 \
  --log-format json \
  --log-prune 720h

# Debug — see every DNS query in logs
sudo ./netshield-dns --log-level debug

# Run without root using high ports
./netshield-dns --dns-port 5353 --http-port 3000
```

---

## 8. Architecture Deep Dive

### Query resolution order

For every incoming DNS query, the handler checks in this exact order:

```
1. Blocklist check  — SQLite: SELECT COUNT(*) FROM blocklist WHERE ...
        ↓ not blocked
2. Custom records   — SQLite: SELECT ip FROM custom_records WHERE domain = ?
        ↓ no match
3. In-memory cache  — LRU + TTL, protected by sync.RWMutex
        ↓ cache miss
4. Forward upstream — primary (--upstream flag) → fallback (8.8.8.8)
        ↓ response received
5. Cache the answer
6. Log the query    — async buffered channel → batch SQLite write
7. Return to client
```

### In-memory DNS cache

The cache is an LRU structure backed by a doubly-linked list (`container/list`) and a hash map. It holds up to `--cache-size` entries (default 1000).

- **Get:** O(1) — checks expiry, moves to front of LRU list, increments hit counter
- **Set:** O(1) — if full, evicts the least recently used entry before inserting
- **TTL eviction:** Background goroutine runs every 30 seconds, removes up to 100 expired entries per run
- **Negative caching:** NXDOMAIN responses are cached for 60 seconds so repeated lookups of non-existent domains do not hit upstream

### Upstream failover

The `PooledForwarder` tries upstreams in order. If an upstream returns an error, it is marked unhealthy and the next one is tried. A background health-check goroutine probes each upstream every 30 seconds with a `google.com A` query. When an upstream recovers, it is marked healthy again and logs `upstream recovered`.

### Async log writes

DNS queries are logged via a buffered Go channel (capacity 1000). The DNS handler sends a log entry and returns immediately — the database write never blocks the DNS response.

A background goroutine drains the channel and batches entries. The buffer is flushed to SQLite in a single `BEGIN / INSERT ... / COMMIT` transaction when either:
- The buffer reaches 100 entries, or
- 5 seconds have elapsed since the last flush

This means there is up to a 5-second delay before queries appear in the dashboard. On shutdown, an explicit `Flush()` call writes any remaining buffered entries before the process exits.

### Authentication

Sessions are 32-byte cryptographically random tokens (base64url-encoded, 43 characters), stored in the `sessions` table with no expiry. They remain valid until explicitly invalidated by `DELETE /api/session`.

Every protected API request validates the token with a single SQLite lookup. The email address from the session is placed in the request context (`context.WithValue`) for handlers that need it (e.g. `ChangePassword`).

### Password hashing

Argon2id with:
- Memory: 19 456 KB (19 × 1024)
- Time: 2 iterations
- Parallelism: 1 thread
- Key length: 32 bytes
- Salt: 16 bytes, cryptographically random per password

Comparison uses `subtle.ConstantTimeCompare` to prevent timing attacks.

### Database schema

```sql
users         (email TEXT PRIMARY KEY, password TEXT)
sessions      (token TEXT PRIMARY KEY, email TEXT, created_at TEXT)
settings      (key TEXT PRIMARY KEY, value TEXT)
query_logs    (id INTEGER PRIMARY KEY AUTOINCREMENT,
               timestamp TEXT, domain TEXT, client_ip TEXT, action TEXT)
custom_records(domain TEXT PRIMARY KEY, ip TEXT)
blocklist     (domain TEXT PRIMARY KEY, added_at TEXT, wildcard INTEGER DEFAULT 0)
steering_rules(id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT, condition_type TEXT, condition_value TEXT,
               action_type TEXT, action_target TEXT,
               priority INTEGER, enabled INTEGER)
```

SQLite is configured with:
- `PRAGMA journal_mode=WAL` — allows concurrent reads while a write is in progress
- `PRAGMA busy_timeout=5000` — waits up to 5 seconds on lock contention instead of immediately failing
- `PRAGMA synchronous=NORMAL` — good durability without fsync on every single write

### UDP and TCP DNS

Both UDP (standard, max 512 bytes) and TCP (used for large responses and zone transfers) are supported. UDP uses a 1500-byte read buffer. TCP uses a 2-byte length prefix (per RFC 1035) and a 5-second connection deadline.

Both listeners use a 500ms deadline in their accept loops so they can check the shutdown signal without blocking forever.

---

## 9. Troubleshooting

### "Permission denied" on port 53

Port 53 requires root on Linux. Either run with `sudo`, or grant the binary the `cap_net_bind_service` capability:

```bash
sudo setcap 'cap_net_bind_service=+ep' ./netshield-dns
./netshield-dns  # no sudo needed
```

Or use iptables to redirect port 53 to a high port:

```bash
./netshield-dns --dns-port 5353

sudo iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-port 5353
sudo iptables -t nat -A PREROUTING -p tcp --dport 53 -j REDIRECT --to-port 5353
```

### Devices still using the old DNS

DNS settings from DHCP are cached by devices. Force a refresh:

```bash
# Linux
sudo dhclient -r && sudo dhclient

# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows (run as administrator)
ipconfig /release && ipconfig /renew && ipconfig /flushdns
```

### Dashboard not loading

```bash
# Check the server is running
sudo systemctl status netshield-dns

# Check the HTTP port responds
curl http://localhost:8080/health

# Check the firewall
sudo ufw status
```

### Queries not appearing in logs

Logs are written asynchronously with up to a 5-second delay. Wait a few seconds and refresh. If they still do not appear:

```bash
sudo journalctl -u netshield-dns -f
```

### A blocked domain is still resolving

The device may have the old answer cached locally. The block takes effect immediately for new queries. Flush the device DNS cache (see above) or wait for the original TTL to expire.

### All DNS on the network stops working

If your server goes down, all devices will fail DNS until the router's secondary DNS (`1.1.1.1`) kicks in — this usually takes 5–30 seconds depending on the router.

To prevent outages: run the server as a systemd service with `Restart=on-failure`. Reboots are covered by `WantedBy=multi-user.target`.

### The UDP retry loop keeps printing on startup

```
WARN failed to listen UDP, retrying... port=53 attempt=1
```

This means port 53 is already in use (often by `systemd-resolved`). Disable it:

```bash
sudo systemctl stop systemd-resolved
sudo systemctl disable systemd-resolved
```

Then retry. The server attempts to bind UDP port 53 up to 10 times with a 2-second wait between each attempt.

---

## 10. Default Credentials

```
Email:    anontom90@gmail.com
Password: admin@1234
```

**Change the password immediately** after first login via Profile → Change Password, or via the API:

```bash
curl -X PUT http://localhost:8080/api/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"admin@1234","new_password":"YourStrongPassword123"}'
```
