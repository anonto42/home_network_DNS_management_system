# Roadmap

## Goal

Build a complete home DNS management system — learn DNS protocol, network security, Go backend, React frontend, and embedded hardware — all from scratch.

```
Phone ──DNS query──→ Go DNS Server (Linux) ──→ 1.1.1.1
                          │
                    SQLite (logs, records, blocklist)
                          │
                    REST API ──→ React Dashboard
                          │
                    ESP32 (monitor/display/fallback)
```

---

## Phase 1 — Learn DNS & Go Backend (Next)

Build the main DNS server in Go with React dashboard.

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| DNS Server | Go (`golang.org/x/net/dns/dnsmessage`) | Best DNS lib, goroutine-per-query |
| REST API | Go (`net/http` + Chi router) | Single binary, no deps |
| Storage | SQLite (`modernc.org/sqlite`, pure Go) | No CGO needed, embedded |
| Frontend | React + Vite + Tailwind | Modern stack, you know JS/TS |
| Deploy | systemd service | Auto-start on boot |

### Why This Order

1. Your existing fullstack skills (Node/TS) translate directly to Go + React
2. Learn DNS protocol while writing backend code you already understand
3. Zero hardware friction — everything runs on this Linux machine
4. Once DNS + API is solid, add ESP32 as hardware layer

### Features

- [ ] Go DNS server on port 53 (parse queries, build responses)
- [ ] Forward unresolved queries to 1.1.1.1
- [ ] Ad/tracker blocklist (exact + wildcard domains)
- [ ] Custom A/AAAA/CNAME records
- [ ] SQLite: persistent logs, records, blocklist
- [ ] LRU cache with TTL management
- [ ] REST API (stats, logs, CRUD records/blocklist)
- [ ] React dashboard (live logs, management UI)
- [ ] systemd service + Makefile
- [ ] Prometheus metrics endpoint

### Learning Outcomes

| Skill | What you'll build |
|-------|------------------|
| Go | UDP/TCP servers, goroutines, binary packet parsing |
| DNS wire protocol | Parse raw DNS packets, understand headers, flags, records |
| Network security | Blocklist logic, detect suspicious domains, DNS tunneling basics |
| SQLite | Schema design, query optimization, embedded database |
| React + Tailwind | Real-time dashboard, dark mode UX |
| Linux admin | systemd, firewall rules (port 53), logging |

---

## Phase 2 — ESP32 Hardware Layer

After the Go server is running, add the ESP32 to the network.

### Technology Decision

For your background (fullstack, wants to learn cybersecurity):

| Language | ESP32 Support | Learning Curve | Resume Value | Recommendation |
|----------|:---:|:---:|:---:|:---:|
| **C++ (Arduino)** | ✅ Excellent | Low | Medium | Best for quick hardware integration |
| **Rust (esp-rs)** | ✅ Official | Medium-High | ⭐⭐⭐⭐⭐ | Best for deep learning & resume |
| **MicroPython** | ✅ Good | Low | Low | Too limited for production use |
| **C (ESP-IDF)** | ✅ Best | High | High | Steep, lots of boilerplate |

**Recommended: Rust (esp-rs)** — Modern, safe, async/await, Espressif official support.

### What the ESP32 Does

```
Role: Network Sensor + Dashboard
─────────────────────────────
• Connects to Go server via WiFi
• Fetches DNS stats from Go REST API
• Displays live query count on OLED screen
• Physical button to toggle ad-blocking
• RGB LED: green=normal, red=blocking, yellow=degraded
• Optional: acts as DNS fallback if Go server goes down
```

### ESP32 Features

- [ ] WiFi station mode, connects to home network
- [ ] HTTP client to Go API (fetch stats, logs)
- [ ] OLED SSD1306 display (live query count, blocked domains)
- [ ] Physical button + RGB LED for status
- [ ] OTA firmware updates
- [ ] Watchdog timer for reliability

### Learning Outcomes (ESP32)

| Skill | What you'll build |
|-------|------------------|
| Rust embedded | no_std, HAL, interrupts |
| I2C protocol | Talk to OLED display |
| GPIO | Buttons, LEDs, debouncing |
| WiFi on MCU | Station mode, reconnection logic |
| Firmware OTA | Secure update mechanism |
| Power profiling | Deep sleep, battery-aware design |

---

## Phase 3 — Cybersecurity Features

Evolve the DNS server into a network security tool.

- [ ] Threat intelligence feeds (auto-download blocklists from URL)
- [ ] DGA (Domain Generation Algorithm) detection
- [ ] DNS tunneling detection
- [ ] Suspicious query alerting
- [ ] Per-client policies (different rules per device)
- [ ] DNS-over-TLS (DoT) upstream
- [ ] DNS-over-HTTPS (DoH) upstream
- [ ] DNSSEC validation
- [ ] GeoIP query source tracking
- [ ] Anomaly detection dashboard

---

## Project Structure

```
aloevol/dns-server/
├── cmd/
│   └── dns-server/          main.go (entry point)
├── internal/
│   ├── dns/                 packet parse, forwarder, cache
│   ├── api/                 REST handlers
│   ├── db/                  SQLite schema + queries
│   └── models/              shared types
├── web/                     React + Vite + Tailwind
│   ├── src/
│   └── package.json
├── firmware/                ESP32 Rust firmware
│   └── src/                 main.rs, display, wifi
├── Makefile
└── README.md
```
