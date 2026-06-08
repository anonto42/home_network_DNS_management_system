# RFC 002: Hybrid Remote Agent Architecture

**Date:** 2026-06-08
**Status:** Draft

### Objective
Define the infrastructure required to implement "Out-of-Home/Cellular Protection," "Geo-Proxying," and "Zero Maintenance" features, which require bridging our local server with external infrastructure.

### Proposed Architecture: "The Hybrid Proxy"
To provide cloud-like features from a self-hosted core, we must transition to a hybrid architecture:

1.  **Local Core (Current):** Continues to manage local DNS, ad-blocking, and LAN routing.
2.  **Remote Proxy Layer:** A globally distributed proxy cluster (deployed on VPS providers) that acts as the "public face" for remote devices.
3.  **Mobile/Remote Agent:** A lightweight agent on the remote device that maintains a secure, encrypted tunnel to the proxy layer, which then routes traffic back to the local core.

### Future Implementation Roadmap
- **Step 1:** Implement a simple VPN/WireGuard-compatible protocol to handle remote tunneling to the local server.
- **Step 2:** Develop a proxy component that supports geo-location spoofing.
- **Step 3:** Deploy a "Controller" service that manages the local/remote state.

### Infrastructure Implications
- Requires external server costs.
- Increases security attack surface.
