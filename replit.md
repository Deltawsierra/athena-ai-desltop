# Athena AI - Cybersecurity Intelligence Platform

## Overview

Athena AI is a futuristic, JARVIS-inspired cybersecurity dashboard designed for penetration testing, vulnerability analysis, and threat detection. The platform features a distinctive dual-theme system with completely different visual aesthetics for light and dark modes, 3D holographic backgrounds, glassmorphism design patterns, and AI-powered security analysis tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with protected route implementation requiring JWT authentication.

**UI Component System**: 
- shadcn/ui component library with Radix UI primitives
- Custom glassmorphic components (GlassCard, MetricCard, ThreatBadge, etc.)
- Tailwind CSS for styling with custom theme variables
- Framer Motion for animations and page transitions

**Theme System**:
- Dual-mode theming (light/dark) with completely different visual aesthetics
- Dark mode: Cyberpunk/sci-fi aesthetic with deep navy backgrounds and neon cyan/magenta accents
- Light mode: Professional, clean interface with white-blue backgrounds
- Theme preference stored in localStorage
- CSS custom properties for dynamic theme switching with 1-second transitions

**Authentication Flow**:
- JWT-based authentication with access and refresh tokens
- Token storage in localStorage (persistent) or sessionStorage (session-only)
- Automatic token refresh mechanism via TokenRefresher component
- Protected routes redirect to login with "next" parameter for post-auth navigation

**State Management**:
- TanStack Query (React Query) for server state and API calls
- Local component state with React hooks
- No global state management library (Redux, Zustand, etc.)

**Key Design Patterns**:
- Glassmorphism: Semi-transparent cards with backdrop blur and subtle borders
- 3D Holographic backgrounds with animated particles and geometric shapes
- Animated metrics with count-up effects and progress indicators
- Responsive design with mobile breakpoints

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**API Structure**:
- RESTful API endpoints prefixed with `/api`
- Routes defined in `server/routes.ts` (currently empty/placeholder)
- Session-based or token-based authentication expected (not yet implemented)

**Data Layer**:
- Storage interface pattern (IStorage) for abstraction
- In-memory implementation (MemStorage) as default
- Prepared for database integration via Drizzle ORM

**Build System**:
- Development: tsx for hot-reloading TypeScript execution
- Production: esbuild bundles server code, Vite bundles client code
- Single-file server bundle output to `dist/index.js`

**Development Features**:
- Request logging middleware with response capture
- Vite middleware integration for HMR in development
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`)

**Database Schema** (defined but not yet used):
- Users table with id (UUID), username (unique), and password fields
- Schema validation via drizzle-zod integration
- Migration files generated to `./migrations` directory

**Current Implementation**:
- In-memory storage (Map-based) for development
- User CRUD operations: getUser, getUserByUsername, createUser
- Ready to swap to PostgreSQL connection when DATABASE_URL is provided

**Rationale**: The application uses an abstraction layer (IStorage interface) to allow easy switching between in-memory and database persistence without changing application logic.

### Authentication and Authorization

**Strategy**: JWT-based authentication with access/refresh token pair

**Token Management**:
- Access tokens for API authorization
- Refresh tokens for obtaining new access tokens
- Client-side token validation via JWT payload decoding
- Automatic refresh scheduling (60 seconds before expiry)
- Storage strategy: localStorage for "remember me", sessionStorage otherwise

**Authorization Flow**:
- Login endpoint expected to return access and refresh tokens
- Protected routes validate token presence and expiry
- Token refresh mechanism runs in background via TokenRefresher component
- Logout clears all tokens and redirects to login

**Security Considerations**:
- Tokens validated on both client (expiry check) and server (expected)
- HTTPS required for production (tokens transmitted in headers)
- No password stored client-side, only tokens

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Unstyled, accessible UI primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for data visualization (bar charts, pie charts)
- **Framer Motion**: Animation library for smooth transitions and effects
- **Embla Carousel**: Touch-friendly carousel component

### Development and Build Tools
- **Vite**: Frontend build tool and dev server with HMR
- **esbuild**: Fast JavaScript bundler for production server code
- **tsx**: TypeScript execution engine for development
- **Tailwind CSS**: Utility-first CSS framework with PostCSS
- **TypeScript**: Type-safe JavaScript with strict configuration

### Backend and Data
- **Express.js**: Web server framework
- **Drizzle ORM**: TypeScript ORM for SQL databases
- **@neondatabase/serverless**: PostgreSQL client for Neon DB (serverless)
- **drizzle-zod**: Zod schema generation from Drizzle schemas
- **connect-pg-simple**: PostgreSQL session store for Express (not yet used)

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx** / **class-variance-authority**: Conditional className utilities
- **cmdk**: Command palette component (not visibly used yet)
- **zod**: Schema validation and type inference

### Database
- **PostgreSQL**: Expected production database (via Neon serverless)
- Currently optional: Application runs with in-memory storage if DATABASE_URL is not provided

### Assets and Media
- **Generated Images**: Static holographic backgrounds and logo assets stored in `attached_assets/generated_images/`
- Dark mode background: Deep space with neon grid floor
- Light mode background: Bright environment with subtle holographic elements
- Athena AI logo: Owl shield design for branding

### Notes on Missing Integrations
- Authentication backend endpoints are not yet implemented (mock data in frontend)
- Admin dashboard, CVE classifier, and pentest scan features use placeholder/mock data
- Email automation, SMS alerts, and reporting features mentioned in docs but not implemented
- External security tool integrations (SIEM, etc.) are planned but not present