# Research: DNS Mechanical Implementation Analysis
**Date:** 2026-06-08
**Status:** Finalized

### Objective
Document the detailed mechanical differences between local (open-source) and cloud (paid) DNS implementations to inform technical design choices and feature prioritization.

### Market/Context Analysis
The DNS market is split between local control (privacy/LAN management) and cloud convenience (remote access/maintenance). Understanding the 'how' behind their features is key to bridging this gap.

---

## 1. Ad & Tracker Blocking
### How it works fundamentally
When your device tries to load a website, it asks the DNS server for the IP address of the ad server (e.g., ://google.com). The DNS server checks a list of blocked domains. If it matches, the server returns a "Null IP" (like 0.0.0.0), which tells your device the ad doesn't exist, instantly blocking it before it downloads.

### ⚔️ Competitor Implementation
*   **Open-Source Side (Pi-hole / AdGuard Home):** Downloads giant text files of blocklists directly onto your local machine. Your local CPU processes the lookups.
    *   **Pros:** Fully customizable; your blocklists are highly private.
    *   **Cons:** Takes up local memory; you must manually schedule updates to keep blocklists current.
*   **Paid Side (NextDNS / Control D):** The blocklists are hosted and managed on massive cloud databases.
    *   **Pros:** Zero impact on your hardware. Updates happen automatically in the cloud.
    *   **Cons:** You cannot easily upload massive, custom-built text lists of your own making.

---

## 2. Encrypted DNS (DoH / DoT)
### How it works fundamentally
Standard DNS queries are sent in plaintext, allowing your Internet Service Provider (ISP) or hackers on public Wi-Fi to see every website you visit. DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) wrap your DNS requests in a layer of cryptographic encryption, hiding them from prying eyes.

### ⚔️ Competitor Implementation
*   **Open-Source Side:**
    *   AdGuard Home / Technitium: Acts as a local encryption gateway. They take the plaintext query from your phone, encrypt it locally, and send it to an upstream provider.
    *   Pi-hole: Cannot do this out of the box. It requires you to install a separate background service (like cloudflared) to handle the encryption tunnel.
*   **Paid Side:** They generate a unique, encrypted web address (URL) specifically for your account. You paste this URL directly into your iPhone, Android, or web browser settings. The encryption is natively managed by your device's operating system directly to their servers.

---

## 3. Local Domain Hosting & LAN Routing
### How it works fundamentally
This translates human-readable local names into internal network IP addresses. For example, typing http://nas.local in your browser will route you directly to your home storage server (192.168.1.50) instead of searching the public internet.

### ⚔️ Competitor Implementation
*   **Open-Source Side:** This is their biggest strength. Because they sit inside your physical house, tools like Technitium give you full "Authoritative Zone files." You can map complex routing, local mail servers, and custom smart-home device names seamlessly.
*   **Paid Side:** Because paid services live out on the public cloud, they cannot see your home network. To make local routing work, you must install an extra software agent (like Control D's ctrld utility) on your home router to bridge the cloud settings to your local devices.

---

## 4. Out-of-Home / Cellular Protection
### How it works fundamentally
Applying your custom DNS rules, ad-blocking, and parental controls to your smartphone or laptop when you leave your home Wi-Fi and connect to 5G, cellular data, or public coffee shop networks.

### ⚔️ Competitor Implementation
*   **Open-Source Side:** Incredibly difficult to achieve. To get out-of-home protection with Pi-hole or AdGuard Home, you must host a permanent, secure Home VPN server (like WireGuard). Your phone must constantly stay connected to your home VPN, which drains smartphone battery life heavily.
*   **Paid Side:** This is where paid services excel. They provide lightweight mobile apps or native configuration profiles. Your phone connects to their nearest global data center over 5G seamlessly, providing ad-blocking anywhere in the world with zero battery drain.

---

## 5. Traffic Geo-Proxying / Spoofing
### How it works fundamentally
When you try to access a website, the DNS server doesn't just give you the IP address; it acts as a middleman. It intercepts your web traffic and routes it through a proxy server located in another country, tricking the website into thinking you are physically located there.

### ⚔️ Competitor Implementation
*   **Open-Source Side:** Strictly impossible. Local open-source DNS servers are just traffic directors; they do not own global server networks or bandwidth to tunnel your actual web traffic around the world.
*   **Paid Side (Control D Exclusive):** They operate a massive global proxy infrastructure. From a web dashboard, you can click on a streaming app icon, select "United Kingdom," and the DNS will automatically route only that specific app's traffic through their UK servers, bypassing geographic blocks without needing a full-system VPN.

---

## 6. Hardware Maintenance & Reliability
### How it works fundamentally
Keeping the system running smoothly 24 hours a day, 7 days a week, ensuring that any device in the house can always access the internet without interruption.

### ⚔️ Competitor Implementation
*   **Open-Source Side:** You are the IT manager. If your Raspberry Pi crashes, its micro-SD card corrupts, or your home loses electricity, your entire family loses internet access immediately because the local DNS server is offline.
*   **Paid Side:** They handle all maintenance. They deploy their software across global networks with automatic failovers. If one cloud data center goes down, your internet traffic is instantly routed to the next closest city without you ever noticing.

---
### Conclusion & Next Steps
This mechanical breakdown confirms that our project should focus on enhancing the "local strength" while exploring hybrid approaches for remote access/mobile connectivity.
