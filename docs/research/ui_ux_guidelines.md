# OmniDNS UI/UX & Styling Guidelines for AI Assistants

This document serves as the styling standard for the OmniDNS DNS Management interface. It outlines the design principles, visual tokens, and specific instructions for AI assistants to audit, identify, and resolve Tailwind CSS and shadcn-related styling issues.

---

## 1. Core Visual Archetype
OmniDNS is a premium, developer-centric network utility. The interface must look extremely clean, high-performance, and high-fidelity. It uses a **Sleek Tech Dark/Light** system relying on CSS variables and OKLCH color spaces.

### Design Tokens (Defined in `src/index.css` & `tailwind.config.js`)
- **Base Background**: `bg-background` (OKLCH near-white or near-black)
- **Component Containers (Cards, Modals)**: `bg-card` (provides elevations, offset from background)
- **Interactive States**: Hover (`hover:bg-muted` or `hover:bg-accent`), active (`bg-accent` or `bg-primary`)
- **Borders & Dividers**: `border-border` (default) or `border-border/50` (subtle)
- **Primary Action Accent**: `bg-primary` (deep Indigo-Blue in Light Mode, vibrant Cyan-Blue in Dark Mode)
- **Typography**: Inter (UI / Sans), JetBrains Mono (Code/DNS records)

---

## 2. Common Styling Anti-Patterns (The Audit List)
When scanning the codebase, look for the following Tailwind CSS and shadcn anti-patterns. If found, they must be flagged and refactored.

### A. Arbitrary Colors & Values
*   **Anti-pattern**: `bg-[#0f172a]`, `text-[#f8fafc]`, `p-[17px]`, `w-[230px]`
*   **Correct pattern**: Use semantic values and design tokens:
    *   Colors: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`
    *   Spacing: `p-4`, `p-6`, `w-56`, `w-64`
    *   Opacity: `text-foreground/80` or `border-border/50`

### B. Inconsistent Borders & Rings
*   **Anti-pattern**: Hardcoded border colors like `border-slate-200` or `border-neutral-800`.
*   **Correct pattern**: Use `border-border` or `border-border/50`.
*   **Anti-pattern**: Missing focus outlines or inconsistent ring styles on inputs/buttons.
*   **Correct pattern**: Ensure keyboard accessibility is present on all interactive components:
    *   `focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:outline-none`

### C. Inconsistent Button Styling
*   **Anti-pattern**: Raw HTML `<button>` elements with inline custom Tailwind classes.
*   **Correct pattern**: Always use the shadcn `Button` component or wrap with class utilities from the standard button configuration.

### D. Hardcoded Dark/Light Mode Colors
*   **Anti-pattern**: `bg-slate-900 text-white dark:bg-slate-950`
*   **Correct pattern**: Use CSS-variable-backed classes so both dark and light modes look correct without code fragmentation. For example, `bg-card text-card-foreground border-border/50`.

---

## 3. Sidebar Styling Standard for Items (The "Iters")
The sidebar is the primary navigation spine of OmniDNS. It must feel fluid, premium, and highly responsive.

### A. Anatomical Structure of a Sidebar Item
A single navigation item consists of:
1.  **Container**: Padding, border-radius, background, transition, layout.
2.  **Icon**: Consistent size, scale-up on hover, responsive coloring.
3.  **Label**: Clean typography, truncated when space is restricted, hidden in collapse.
4.  **Indicator (Optional)**: A left/right accent line indicating active selection.
5.  **Badge (Optional)**: Quantitative badge for notifications, events, or state (e.g., logs count).

### B. State Matrix
| State | Styling Classes | Visual Description |
| :--- | :--- | :--- |
| **Default** | `text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200` | Muted slate text, no background, transitions enabled. |
| **Hover** | `bg-muted/60 text-foreground scale-[1.01]` | Slight micro-scaling, subtle background shift, text brightens. |
| **Active** | `bg-primary/10 text-primary border-l-2 border-primary` | Subtly tinted background matching the primary brand color, bold/semi-bold text, clear left-edge accent line. (Avoid solid dark/saturated backgrounds as they create heavy visual drag). |
| **Focused** | `ring-2 ring-ring ring-offset-2 outline-none` | Visible when using Tab/Keyboard navigation. |
| **Collapsed** | `justify-center p-2` | Text hidden, icons centered, tooltips active. |

### C. Collapse/Expand Micro-Interactions
- Use a spring or smooth transition on the sidebar container: `transition-all duration-300 ease-in-out`.
- Sidebar width: Expanded `w-64` (or `w-[260px]`), Collapsed `w-[72px]` (or `w-18`).
- Icons must transition scales on hover: `group-hover:scale-105 transition-transform duration-200`.

---

## 4. How to Audit and Fix Styling Issues in OmniDNS
1.  **Identify Arbitrary Color Classes**: Use grep to find `bg-[#`, `text-[#`, `border-[#`.
2.  **Verify Dark Mode Contrast**: Ensure no hardcoded light text on light backgrounds or dark text on dark backgrounds exists without responsive wrappers.
3.  **Audit Sidebar Item Classes**: Replace default standard buttons/nav links with the premium sidebar item design defined above.
4.  **Refactor Non-Standard Cards**: Check features for hardcoded backgrounds (e.g. `bg-slate-900` in `Dashboard`) and align them to use standard variables.
