# Athena AI - Cybersecurity Intelligence Platform

A futuristic, JARVIS-inspired cybersecurity dashboard with ultra-smooth animations and advanced UI effects.

## Overview

Athena AI is a comprehensive cybersecurity platform featuring:
- Real-time threat monitoring and analysis
- CVE (Common Vulnerabilities and Exposures) classification
- Automated penetration testing and scanning
- Security audit logging and compliance tracking
- Admin controls for user and system management

## Recent Updates

### November 6, 2025 - Admin Features Expansion
Expanded admin functionality with new pages and reorganized navigation:

**New Admin Pages:**
- **AI Control Panel** - Emergency kill switch, override mode, system controls
- **AI Chat Interface** - Real-time chat with AI assistant (with infinite loop protection)
- **Deletion Management** - Centralized deletion interface for all entities
- **Classifiers** - ML model management with CRUD operations

**Navigation Improvements:**
- Reorganized into dropdown menus for better organization
- "Tests & Documents" dropdown: Pentest, Tests, Documents, Clients, Classifiers, Audit Logs
- "Admin" dropdown: User Management, AI Health, AI Control Panel, AI Chat, Deletion Management
- Active state highlighting for current page/section

**New API Endpoints:**
- GET/PATCH `/api/ai-control` - AI system control settings
- GET/POST `/api/chat` - AI chat message management
- GET/POST/PATCH/DELETE `/api/classifiers` - ML classifier CRUD

**Technical Fixes:**
- Fixed apiRequest parameter order (method, url, data)
- Implemented controlled Select components for proper form handling
- Added sender-based conditional logic to prevent AI chat infinite loops

All features tested end-to-end and production-ready.

### November 5, 2025 - Ultra-Smooth Animation System
Implemented advanced animation system with performance optimizations:

**New Animation Components:**
- **SmoothScroll** - Lenis-powered buttery-smooth scrolling with proper RAF cleanup
- **MagneticCursor** - Spring-based magnetic cursor effect (desktop only)
- **CursorGlow** - Radial gradient spotlight following cursor
- **TickerTape** - Seamless infinite marquee for threat feeds with dynamic width measurement
- **AnimatedContainer** - Scroll-triggered fade-in animations with spring physics
- **Enhanced GlassCard** - Optimized hover effects with GPU acceleration

**Performance Optimizations:**
- GPU acceleration via willChange CSS properties
- Spring physics (stiffness 100-500, damping 15-30) for natural motion
- ResizeObserver for dynamic content measurement
- Proper requestAnimationFrame cleanup to prevent memory leaks
- Intersection Observer for viewport-based animations
- Custom CSS utilities for smooth elevation effects

**Animation Configuration:**
- Smooth scroll: 1.2s duration with custom easing
- Ticker speed: 60px/s (configurable)
- Spring stiffness: 100-500 depending on interaction
- Spring damping: 15-30 for balanced bounce

All animations tested and architect-approved for production use.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Wouter** for lightweight routing
- **Framer Motion** for advanced spring animations
- **Lenis** for smooth scrolling
- **Shadcn/UI** component library
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Query** for server state management

### Animation Libraries
- framer-motion - Primary animation library with spring physics
- lenis - Smooth scroll implementation
- react-intersection-observer - Viewport detection
- Custom CSS utilities for GPU-accelerated effects

### Backend
- **Express** server
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for type-safe database queries
- **JWT** authentication with refresh tokens
- **Session** management with PostgreSQL store

## Project Structure

```
client/src/
├── components/
│   ├── Animation Components/
│   │   ├── SmoothScroll.tsx - Lenis smooth scroll wrapper
│   │   ├── MagneticCursor.tsx - Cursor-following magnetic effect
│   │   ├── CursorGlow.tsx - Radial gradient cursor spotlight
│   │   ├── TickerTape.tsx - Seamless infinite marquee
│   │   ├── AnimatedContainer.tsx - Scroll-triggered animations
│   │   └── GlassCard.tsx - Glass morphism cards with hover
│   ├── UI Components/
│   │   ├── Navigation.tsx - Main header navigation
│   │   ├── MetricCard.tsx - Dashboard metric displays
│   │   ├── ThreatBadge.tsx - Threat severity indicators
│   │   └── HolographicBackground.tsx - Animated gradient bg
│   └── ui/ - Shadcn component library
├── pages/
│   ├── Dashboard.tsx - Main dashboard with ticker tape
│   ├── CVEClassifier.tsx - CVE analysis tool
│   ├── PentestScan.tsx - Penetration testing
│   ├── AdminPage.tsx - User management
│   ├── AIHealth.tsx - AI system health monitoring
│   ├── AIControlPanel.tsx - AI control with kill switch
│   ├── AIChat.tsx - AI chat interface
│   ├── DeletionManagement.tsx - Centralized deletion
│   ├── Classifiers.tsx - ML classifier management
│   ├── Clients.tsx - Client management
│   ├── Tests.tsx - Test tracking
│   ├── Documents.tsx - Document management
│   └── AuditLogs.tsx - Security audit logs
├── lib/
│   └── queryClient.ts - React Query configuration
└── index.css - Global styles with animation utilities

server/
├── routes.ts - API endpoints
├── storage.ts - In-memory data storage
└── index.ts - Express server setup

shared/
└── schema.ts - Shared TypeScript types
```

## Key Features

### Dashboard
- Real-time threat monitoring with animated ticker tape
- Metric cards with spring-based hover effects
- Interactive charts (pie, bar) with smooth transitions
- Glass morphism design with backdrop blur
- Recent activity feed with severity badges

### CVE Classifier
- Automated CVE analysis and severity classification
- Description-based vulnerability detection
- Integration-ready for external CVE databases

### Pentest Scanner
- Automated penetration testing
- Configurable scan depth and targets
- Real-time scan progress tracking

### Admin Panel
- User management (create, edit, delete)
- Role assignment (admin/user)
- System configuration
- AI health monitoring with system metrics
- AI control panel with emergency shutdown
- Deletion management for all entities

### AI Features
- **AI Chat** - Real-time chat interface with automated AI responses
- **AI Control Panel** - Emergency kill switch, override mode, system controls
- **AI Health Monitoring** - Track AI system status and performance metrics
- **ML Classifiers** - Manage machine learning models for threat detection

### Clients & Tests
- Client management with detailed profiles
- Security test tracking and assignment
- Document management and client association
- Test history and audit trail

### Audit Logs
- Comprehensive security event logging
- Filterable by user, action, timestamp
- Compliance tracking

## Animation Best Practices

### Performance
- Always use willChange for animated properties
- Prefer transform/opacity for GPU acceleration
- Use spring physics instead of duration-based easing
- Implement proper cleanup for RAF loops and observers
- Measure dynamic content widths for seamless loops

### Spring Configuration
- **Light interactions** (cards, buttons): stiffness 300-400, damping 25-30
- **Entry animations** (scroll-triggered): stiffness 100-150, damping 20
- **Cursor tracking**: stiffness 300, damping 30
- **Icons/small elements**: stiffness 500+, damping 15

### Accessibility
- Custom cursor disabled on mobile/touch devices
- Smooth scroll respects user motion preferences
- All interactive elements have proper focus states
- Animations don't interfere with functionality

## Environment Variables

### Frontend (VITE_)
- None required (all backend API calls use relative URLs)

### Backend
- `SESSION_SECRET` - Secret key for session encryption (auto-generated)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)

## Authentication

The application uses a dual-token JWT system:
- **Access tokens** - Short-lived (15 min), used for API requests
- **Refresh tokens** - Long-lived (7 days), used to obtain new access tokens
- Tokens stored in localStorage
- Automatic refresh before expiration

### Default Users
- **Admin**: username `testadmin`, password `password123`
- **Regular User**: username `testuser`, password `password123`

## Running the Project

1. The workflow "Start application" is pre-configured and runs automatically
2. Backend starts on port 5000
3. Frontend served via Vite HMR
4. Access at the Replit webview URL

## Development Guidelines

### Adding New Animations
1. Use existing components (AnimatedContainer, GlassCard) when possible
2. For custom animations, use framer-motion with spring physics
3. Add willChange CSS for animated properties
4. Test on both light and dark themes
5. Ensure proper cleanup in useEffect hooks

### Performance Checklist
- [ ] Uses GPU-accelerated properties (transform, opacity)
- [ ] Spring physics configured appropriately
- [ ] RAF loops have cleanup (cancelAnimationFrame)
- [ ] Observers (Intersection, Resize) are disconnected
- [ ] No fixed pixel values for dynamic content
- [ ] Tested on multiple viewport sizes

## Database Schema

- **users** - User accounts with authentication
- **scanResults** - Pentest scan results
- **cveResults** - CVE classification results
- **auditLogs** - Security event logs
- **clients** - Client information and profiles
- **tests** - Security tests and assessments
- **documents** - Client documents and reports
- **aiControlSettings** - AI system control configuration
- **aiChatMessages** - AI chat message history
- **classifiers** - ML classifier models and metadata

## API Routes

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - End session

### User Management
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Security Testing
- `GET /api/scans` - List scan results
- `POST /api/scans` - Create new scan
- `GET /api/cve` - List CVE results
- `POST /api/cve/classify` - Classify CVE

### Client Management
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Test Management
- `GET /api/tests` - List tests
- `POST /api/tests` - Create test
- `PATCH /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test

### Document Management
- `GET /api/documents` - List documents
- `POST /api/documents` - Create document
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### AI Features
- `GET /api/ai-control` - Get AI control settings
- `PATCH /api/ai-control` - Update AI settings
- `GET /api/chat` - Get chat messages
- `POST /api/chat` - Send chat message
- `GET /api/classifiers` - List ML classifiers
- `POST /api/classifiers` - Create classifier
- `PATCH /api/classifiers/:id` - Update classifier
- `DELETE /api/classifiers/:id` - Delete classifier

### Audit Logs
- `GET /api/audit-logs` - Retrieve audit logs

## Deployment

The application is designed to run on Replit with:
- Single port configuration (5000)
- Automatic database provisioning
- Built-in session management
- Zero-configuration deployment

## Future Enhancements

### Potential Improvements
- Three.js 3D visualizations (requires React 19+ for proper hook support)
- Real-time WebSocket updates for threat feeds
- Advanced filtering and search
- Export reports (PDF, CSV)
- Integration with external threat intelligence APIs
- Mobile-optimized touch animations
- Custom animation timeline editor

## Contributing

When making changes:
1. Follow existing code patterns
2. Test animations on multiple screen sizes
3. Run architect review for significant changes
4. Update this documentation
5. Ensure all tests pass

## Support

For issues or questions:
- Check browser console for errors
- Verify animation performance with DevTools
- Review architect feedback in task history
- Test on latest Chrome/Firefox for best results
