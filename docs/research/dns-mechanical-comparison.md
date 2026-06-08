# Research: DNS Mechanical Implementation Analysis
**Date:** 2026-06-08
**Status:** Finalized

### Objective
Document the mechanical differences between local (open-source) and cloud (paid) DNS implementations to inform technical design choices and feature prioritization.

### Market/Context Analysis
The DNS space is split between local control (privacy/LAN management) and cloud convenience (remote access/maintenance). Understanding the 'how' behind their features is key to bridging this gap.

### Technical Exploration: Mechanical Comparison

| Feature | Open-Source (Local) Mechanism | Paid (Cloud) Mechanism |
| :--- | :--- | :--- |
| **Ad Blocking** | Local CPU processes downloaded text-based blocklists. | Massive cloud-hosted databases; zero local impact. |
| **Encryption** | Local gateway (e.g., AdGuard Home) or extra daemon (cloudflared). | Unique account-based DoH/DoT URL natively configured. |
| **LAN Routing** | Direct authoritative control over local zone files. | Requires local agent (e.g., ctrld) on the router. |
| **Mobile Protection** | Requires a persistent, battery-draining home VPN. | Native device profiles/apps over global PoPs. |
| **Geo-Proxying** | Impossible (Local DNS cannot tunnel traffic). | Cloud-based global proxy infrastructure. |
| **Maintenance** | Self-managed hardware (Pi/PC), prone to outages. | Managed global infrastructure with auto-failover. |

### Key Insights
- **Local Strength:** Unmatched control over LAN routing, privacy, and full autonomy.
- **Cloud Strength:** Superior remote connectivity, zero hardware maintenance, and global reach.
- **Project Opportunity:** Can we create a local solution that provides a lightweight "remote agent" or integrates with existing VPN protocols to bridge the mobile/out-of-home gap without full VPN overhead?

### Conclusion & Next Steps
This mechanical breakdown confirms that our project should focus on enhancing the "local strength" while exploring hybrid approaches for remote access/mobile connectivity.
