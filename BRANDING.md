# OmniDNS: Brand Identity Guidelines

## 1. Brand Essence

* **Mission:** To provide developers and network administrators with complete, intuitive control over their network traffic.
* **Voice:** Technical, precise, proactive, and transparent.
* **Personality:** Reliable (the "Shielded Node"), Insightful (the "Focus"), and Scalable (the "Symphony").

## 2. Logo Strategy

Since this is designed for an open-source project:

* **Concept:** Focus on the "Omni" (all-encompassing) and "DNS" (network/nodes/paths) connection. Think of abstract representations of data nodes, protected paths, or a centralized point of focus.
* **Versatility:** The logo must be legible at small sizes (like a browser favicon or a GitHub project thumbnail) and in monochrome (black/white) for documentation or terminal headers.
* **Rule:** Keep it geometric. Avoid overly complex details that make the logo look blurry when scaled down.

## 3. Color Palette

For a networking dashboard, "Dark Mode" is standard. A high-contrast palette reduces eye strain during long configuration sessions.

| Role | Color Concept | Code / Hex |
| --- | --- | --- |
| **Background** | Deep Charcoal / Pitch Navy | `#000204` |
| **Surface** | Dark Gray / Deep Space Card | `#071221` |
| **Secondary** | Secondary Elements / Inputs | `#14191f` |
| **Primary** | Cyan or Teal (Accent) | `#06B6D4` / `oklch(0.72 0.16 195)` |
| **Purple Accent** | Deep Purple (Flow accent) | `#8B5CF6` / `oklch(0.62 0.18 290)` |
| **Gold Accent** | Warm Gold (Flow accent) | `#EAB308` / `oklch(0.79 0.15 75)` |
| **Status/Alerts** | Semantic Colors | Red (Critical), Amber (Warning), Green (Healthy) |

*Pro Tip: Use the **60-30-10 Rule**. 60% of your dashboard should be the background/surface colors, 30% for secondary structures, and 10% for your vibrant accent (Cyan) to draw the user's eye to important actions.*

## 4. Typography

For a developer-focused tool, readability is non-negotiable. Use a **monospace font family** for data and a **clean sans-serif** for UI elements.

* **Primary (UI/Headings):** *Inter* or *Roboto*. They are clean, professional, and highly readable on dashboards.
* **Secondary (Data/Code/Logs):** *JetBrains Mono* or *Fira Code*. These are built for programmers and make technical data (like IP addresses and logs) much easier to scan.

## 5. Visual Consistency (The "Rulebook")

* **Clarity over Decoration:** Every visual element must serve a purpose (e.g., a chart showing traffic flow, a button indicating a state). Avoid "fluff."
* **Consistent Hierarchy:** Headlines should always be `Bold`, sub-headers `Medium`, and data labels `Regular/Monospace`.
* **Iconography:** Use a consistent icon set (e.g., *Lucide Icons* or *Phosphor Icons*). Do not mix different icon styles within the same dashboard.
