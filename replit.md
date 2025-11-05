# Athena AI - Cybersecurity Intelligence Platform

A futuristic, JARVIS-inspired cybersecurity dashboard for penetration testing and vulnerability analysis.

## Overview

Athena AI is a high-value cybersecurity platform featuring:
- **3D Holographic Interface**: Immersive backgrounds with grid floors, glowing orbs, and animated effects
- **Dual Theme System**: Completely different aesthetics for light and dark modes
- **Glassmorphism Design**: Modern glass cards with backdrop blur and neon accents
- **AI-Powered Analysis**: Penetration testing, CVE classification, and threat detection
- **Real-time Visualizations**: Interactive charts, metrics, and progress indicators

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GlassCard.tsx           # Glassmorphic card container
│   │   ├── ThreatBadge.tsx         # Severity indicators
│   │   ├── MetricCard.tsx          # Dashboard metrics
│   │   ├── ConfidenceMeter.tsx     # Circular progress indicator
│   │   ├── ProgressBar.tsx         # Linear progress bars
│   │   ├── StatusIndicator.tsx     # Status pills
│   │   ├── Navigation.tsx          # Top navigation bar
│   │   ├── ThemeToggle.tsx         # Light/dark mode toggle
│   │   └── HolographicBackground.tsx  # 3D background system
│   ├── pages/               # Application pages
│   │   ├── Login.tsx               # Authentication
│   │   ├── Dashboard.tsx           # Main overview
│   │   ├── PentestScan.tsx        # Penetration testing
│   │   ├── CVEClassifier.tsx      # Vulnerability classifier
│   │   ├── AdminPage.tsx          # Admin analytics
│   │   ├── AuditLogs.tsx          # System logs
│   │   └── not-found.tsx          # 404 page
│   ├── App.tsx              # Main application
│   └── index.css            # Global styles & theme definitions
│
server/
├── index.ts                 # Express server
├── routes.ts                # API endpoints
└── storage.ts               # Data persistence

shared/
└── schema.ts                # Type definitions
```

## Features

### 🎨 Theme System

**Dark Mode (Default)**
- Deep navy backgrounds with neon cyan/magenta accents
- High contrast for maximum visibility
- Cyberpunk/sci-fi aesthetic
- 3D holographic background with grid floor and glowing elements

**Light Mode**
- Clean white/light blue environment
- Professional, modern tech interface
- Softer color palette
- Bright holographic background with subtle effects

**Toggle**: Click the Sun/Moon icon in the top-right navigation

### 🌌 3D Holographic Backgrounds

The `HolographicBackground` component creates an immersive experience:
- Theme-specific generated backgrounds (completely different for light/dark)
- Layered visual effects: base image, gradients, glowing orbs, grid overlay
- Animated pulsing orbs in cyan and magenta
- SVG grid pattern with perspective depth
- Always behind content (z-index: -10)

### 🛡️ Component Library

**GlassCard**: Glassmorphic container with backdrop blur
- Used for all primary content
- Glowing border on hover
- Theme-aware styling

**MetricCard**: Dashboard statistics display
- Large gradient numbers
- Trend indicators
- Icon support

**ThreatBadge**: Severity indicators
- Color-coded: Critical, High, Medium, Low, Info
- Pulsing animation for high-severity threats

**ConfidenceMeter**: Circular progress for AI confidence
- Animated stroke
- Gradient colors based on confidence level
- Central percentage display

**ProgressBar**: Linear progress visualization
- Smooth animations
- Gradient fills
- Label support

**StatusIndicator**: Compact status pills
- Pulsing animation
- Color-coded states

### 📊 Pages

1. **Dashboard**: Overview with metrics, charts, and recent activity
2. **Pentest Scan**: Comprehensive security scanning with live progress
3. **CVE Classifier**: AI-powered vulnerability classification
4. **Admin Page**: Analytics and system management
5. **Audit Logs**: Activity timeline and system logs
6. **Login**: Authentication with glassmorphic design

## Development

### Running the Application

The workflow "Start application" runs automatically:
```bash
npm run dev
```

This starts:
- Express server (backend) on port 5000
- Vite development server (frontend)

### Adding New Features

1. **New Component**: Create in `client/src/components/`
   - Always use TypeScript
   - Include example file in `examples/` subdirectory
   - Follow glassmorphism aesthetic

2. **New Page**: Create in `client/src/pages/`
   - Register route in `client/src/App.tsx`
   - Add navigation link in `Navigation.tsx`
   - Use `min-h-screen` without `bg-background`

3. **Styling**:
   - Use Tailwind utility classes
   - Theme colors defined in `index.css`
   - Follow `design_guidelines.md`

### Color Palette

**Light Mode:**
```css
--background: 210 40% 98%
--foreground: 222 47% 11%
--card: 0 0% 100%
--primary: 199 89% 48%
--purple: 271 91% 65%
--cyan: 189 94% 43%
--magenta: 328 86% 70%
```

**Dark Mode:**
```css
--background: 222 47% 11%
--foreground: 210 40% 98%
--card: 215 28% 17%
--primary: 189 94% 43%
--purple: 328 86% 70%
--cyan: 189 94% 43%
--magenta: 328 86% 70%
```

## Authentication

Default credentials:
- **Username**: Admin
- **Password**: password

Session stored in memory (resets on server restart).

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, Node.js
- **UI Components**: Shadcn/ui, Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Routing**: Wouter

## Design Principles

1. **Futuristic Aesthetic**: JARVIS-inspired HUD interface
2. **Glassmorphism**: Backdrop blur with semi-transparent surfaces
3. **3D Depth**: Holographic backgrounds create immersion
4. **Theme Duality**: Completely different light/dark experiences
5. **Minimal Animation**: Strategic use of transitions and effects
6. **Data First**: Clear information hierarchy
7. **Enterprise UX**: Professional, usable, accessible

## File Semantics

- `HolographicBackground.tsx`: Always placed at root in App.tsx
- `ThemeToggle.tsx`: Placed in Navigation component
- `design_guidelines.md`: Complete design system documentation
- Page components: Never use `bg-background` class
- All components: Must work in both themes

## Future Enhancements

- Real API integration for penetration testing
- Email report delivery
- Multi-user support with role-based access
- Real-time threat notifications
- Advanced data visualizations
- PDF report generation
- Export functionality

## Credits

Built with ❤️ using Replit Agent
Athena AI - Goddess of Wisdom, Strategy, and Protection
