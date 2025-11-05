# Athena AI - Design Guidelines

## Design Approach: JARVIS-Inspired Intelligence Platform

**Reference**: Iron Man's JARVIS interface aesthetic combined with Linear's clarity and modern enterprise cybersecurity dashboards (Datadog, Splunk). The design must convey intelligence, precision, and protective power worthy of the goddess Athena.

**Core Principle**: Futuristic glassmorphism with holographic accents, animated data visualizations, and sophisticated information architecture that balances high-tech aesthetics with enterprise-grade usability.

---

## Typography System

**Primary Font**: Space Grotesk or JetBrains Mono for headings - conveying tech sophistication
**Secondary Font**: Inter or Roboto for body text - ensuring readability in data-dense contexts

**Hierarchy**:
- Page Titles: `text-3xl md:text-4xl font-bold tracking-tight` with subtle letter-spacing
- Section Headers: `text-xl md:text-2xl font-semibold`
- Card Titles: `text-lg font-medium`
- Metrics/Stats: `text-4xl md:text-6xl font-bold tabular-nums` for numerical displays
- Body Text: `text-sm md:text-base`
- Labels/Metadata: `text-xs uppercase tracking-wide font-medium`

---

## Layout System & Spacing

**Spacing Primitives**: Use Tailwind units of `2, 4, 8, 12, 16` for consistent rhythm
- Component padding: `p-4 md:p-8`
- Section spacing: `space-y-8` or `gap-8`
- Card internal spacing: `p-6`
- Micro-spacing (between labels/values): `space-y-2`

**Container Strategy**:
- Main content: `max-w-7xl mx-auto px-4 md:px-8`
- Dashboard grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Data tables: Full-width with `max-w-full overflow-x-auto`

**Viewport Management**: Natural height flow, no forced 100vh constraints except hero sections if needed

---

## Core Component Library

### 1. Navigation & Header
- **Top Navigation Bar**: Fixed position with glassmorphism effect (backdrop-blur, semi-transparent)
- Contains: Athena AI logo with owl/shield icon, main nav links, user profile, logout
- Active state: Glowing border-bottom indicator with smooth transition
- Height: `h-16 md:h-20`
- Include subtle scan line animation overlay for JARVIS effect

### 2. Glassmorphism Cards (Primary Container)
- Foundational component for all data displays
- Structure: `rounded-xl backdrop-blur-md border` with subtle shadow
- Padding: `p-6 md:p-8`
- Include: Optional glowing border on hover (1px gradient border with 0.3s transition)
- States: Default, hover (subtle lift with `translate-y-[-2px]`), active

### 3. Metric/Stat Cards
- Large numerical display with label
- Layout: Vertical stack with icon/badge at top
- Number: `text-5xl font-bold tabular-nums` with animated count-up effect
- Label: `text-sm text-muted uppercase tracking-wide`
- Trend indicator: Small arrow/percentage change badge
- Grid placement: 3-4 columns on desktop, stack on mobile

### 4. Threat Badge Component
- Severity indicator: High/Medium/Low
- Shape: `rounded-full px-3 py-1 text-xs font-semibold uppercase`
- Include pulsing animation for "High" severity
- Use consistent sizing: `inline-flex items-center gap-1.5`

### 5. Data Tables
- Structure: Responsive table with sticky header
- Header: `bg-surface text-xs uppercase tracking-wide font-semibold`
- Row: `hover:bg-surface-hover transition-colors` with `border-b`
- Cell padding: `px-4 py-3`
- Include expandable row functionality (chevron icon, smooth height transition)
- Mobile: Convert to card stack with `hidden md:table-cell` pattern

### 6. Progress Indicators
- **Linear Progress Bar**: Full-width with animated fill, height `h-2`, rounded ends
- **Circular Progress**: For scan status, with percentage display inside
- **Animated Skeleton**: Shimmer effect for loading states using gradient animation

### 7. Confidence Meter (CVE Classifier)
- Visual representation of AI confidence (0-100%)
- Design: Horizontal bar with gradient fill that animates on render
- Include percentage value overlaid
- Height: `h-8`, rounded, with segmented appearance for visual interest

### 8. Interactive Form Elements
- Input fields: `rounded-lg border px-4 py-3 focus:ring-2` with smooth transitions
- Checkboxes: Custom styled with glowing effect when checked
- Buttons:
  - Primary: `rounded-lg px-6 py-3 font-semibold` with subtle glow effect
  - Secondary: Ghost style with border
  - Icon buttons: `rounded-full p-2` for compact actions

### 9. Timeline/Log Viewer
- Vertical timeline with connection lines
- Each entry: Timestamp (left), icon/badge, content (right)
- Line spacing: `space-y-4`
- Include filter controls at top (date range, type selector)

### 10. Chart/Visualization Containers
- Wrapper: Same glassmorphism card style
- Include: Title, time range selector, legend
- Chart padding: `p-4` to ensure breathing room
- Use animated entry transitions for data points

---

## Page-Specific Layouts

### Dashboard Page
**Structure**: 
1. Welcome header with user greeting and real-time timestamp
2. 4-column metrics grid (Total Scans, Threats Detected, Active Monitors, System Status)
3. 2-column layout:
   - Left: Threat Breakdown chart (pie/donut showing vulnerability types)
   - Right: Recent Activity timeline (last 10 scans/detections)
4. Full-width: Top Keywords visualization (tag cloud or bar chart)
5. Quick action buttons: "Start New Scan", "View Reports", "Configure Alerts"

### Pentest Scan Page
**Structure**:
1. Scan configuration form (left 2/3): URL input, max pages, checks selection (multi-column checkbox grid)
2. Scan status panel (right 1/3): Live progress circle, status text, discovered pages counter
3. When running: Full-width progress visualization with scan phases
4. Results section: 
   - Summary cards (3-column: Total Findings, Severity Breakdown, Pages Scanned)
   - Findings table with expandable details
   - Action buttons: Download PDF, Email Report, Export JSON

### CVE Classifier Page
**Structure**:
1. Hero-style header with description
2. 2-column layout:
   - Left: Input form (textarea for CVE description, submit button)
   - Right: Info panel (example inputs, tips, recent classifications)
3. Results panel (appears below): 
   - Animated card slide-in
   - Label with icon badge
   - Confidence meter with gradient
   - Keywords as animated tag chips
   - Related CVEs section

### Admin Analytics Page
**Structure**:
1. Date range selector and filter controls
2. 3-column stats overview
3. Charts section (2-column grid):
   - Scan volume over time (line chart)
   - Threat type distribution (bar chart)
4. Full-width audit log table with search, sort, pagination

### Login Page
**Layout**: Centered card (`max-w-md mx-auto`) on full viewport
- Athena AI logo/wordmark at top
- Form fields with floating labels
- "Remember me" checkbox and "Forgot password" link
- Animated holographic border effect on card

---

## Animation Strategy (Minimal, Strategic)

**Use sparingly**:
- Scan line effect on header (subtle, slow)
- Metric counter animations on dashboard load (count-up effect)
- Progress bar fills (smooth width transition)
- Card hover lifts (`transform: translateY(-2px)`)
- Page transitions (fade-in, slide-up on route change)
- Loading spinners with orbital animation

**Avoid**: Excessive hover effects, distracting particle effects, auto-playing animations

---

## Icon Strategy
Use **Heroicons** (outline for navigation, solid for badges/status)
- Threat types: Shield, bug, key, lock icons
- Actions: Play, pause, download, refresh, settings
- Status: Check circle, x circle, exclamation triangle
- Never create custom SVGs; use icon library exclusively

---

## Accessibility & Interaction

- All interactive elements: Minimum 44px touch target
- Focus states: Visible ring with 2px offset
- Color contrast: Ensure all text meets WCAG AA standards
- Keyboard navigation: Full support with visible focus indicators
- Loading states: Always include aria-live regions for screen readers
- Form validation: Inline error messages with icons

---

## Images

**Dashboard Hero/Header**: Optional branded header image showing abstract network visualization or circuit board pattern (full-width, h-48, with overlay gradient for text readability)

**About/Marketing Content**: If creating an About page, include:
- Athena AI concept illustration (AI brain + shield motif)
- Team or technology showcase images in 2-column grid
- Use `rounded-xl` for all images with subtle shadow

**No hero image required** for functional dashboard pages - focus on data visualization and glassmorphism panels for visual impact.