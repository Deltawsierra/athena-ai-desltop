# Athena AI - Cybersecurity Intelligence Platform (Desktop Edition)

## Overview
Athena AI Desktop is a futuristic, JARVIS-inspired, comprehensive cybersecurity platform designed to run entirely offline as a standalone desktop application. It provides real-time threat monitoring and analysis, CVE classification, automated penetration testing, security audit logging, compliance tracking, and robust admin controls.

## Features
- **Dashboard**: Real-time threat monitoring with animated ticker tape, metric cards, and interactive charts
- **CVE Classifier**: Automated analysis and severity classification of CVEs
- **Pentest Scanner**: Automated penetration testing with configurable scans
- **Admin Panel**: User management, role assignment, system configuration
- **AI Features**: AI Chat interface, AI Control Panel for system overrides
- **Clients & Tests**: Comprehensive management of client information and security tests
- **Audit Logs**: Detailed security event logging for compliance
- **Offline Operation**: Runs completely offline with local SQLite database

## Quick Start

### Prerequisites
- Node.js v20 or later
- npm (comes with Node.js)
- Windows 10/11, macOS, or Linux

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd AthenaAI

# Install dependencies
npm install

# If you get missing module errors, install these specifically:
npm install esbuild electron electron-builder
```

### Running the Application

#### Development Mode (with hot reload)
```bash
# Windows
dev-run.bat

# macOS/Linux
npm run electron
```

#### Production Mode
```bash
# Windows
production-run.bat

# macOS/Linux
NODE_ENV=production npx electron electron-main.cjs
```

### Building for Distribution

#### Windows Installer
```bash
# One-click build and installer creation
build-installer.bat
```

This creates: `dist-electron\AthenaAI-Setup-1.0.0.exe`

#### Manual Build Steps
```bash
# 1. Build the server bundle
node build-electron-server.cjs

# 2. Build the frontend
npx vite build

# 3. Create installer
npx electron-builder --win   # Windows
npx electron-builder --mac   # macOS
npx electron-builder --linux # Linux
```

## Default Credentials
- **Admin Account**
  - Username: `admin`
  - Password: `admin123`

- **Test Account**
  - Username: `testadmin`
  - Password: `testpass123`

## Project Structure
```
AthenaAI/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── lib/         # Utilities and helpers
│   │   └── App.tsx      # Main application component
├── server/              # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage-*.ts    # Database storage layers
├── shared/             # Shared types and schemas
├── dist/               # Built files (generated)
├── electron-main.cjs   # Electron main process
├── electron-preload.cjs # Electron preload script
└── build-electron-server.cjs # Server build script
```

## Technical Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + Shadcn/UI
- Framer Motion (animations)
- Recharts (data visualization)
- React Query (state management)
- Wouter (routing)

### Backend
- Express.js server
- SQLite database (offline storage)
- Drizzle ORM
- Session-based authentication

### Desktop
- Electron v33
- Custom app:// protocol
- Content Security Policy configured
- Sandboxing enabled

## Troubleshooting

### "Cannot find module 'esbuild'" Error
```bash
npm install esbuild
```

### "Cannot find module 'electron'" Error
```bash
npm install electron
```

### Build Errors
1. Delete node_modules and dist folders
2. Run `npm install` again
3. Try building again

### App Won't Start in Production
Make sure the server bundle exists:
```bash
# Check if this file exists
dist/server-electron.mjs

# If not, run:
node build-electron-server.cjs
```

### Content Security Policy Errors
The app now uses system fonts and works completely offline. If you still see CSP errors:
1. Rebuild the application: `build-installer.bat`
2. Make sure you're running the latest build

## Security Features
- **Offline Operation**: No external dependencies or network calls
- **Content Security Policy**: Strict CSP without unsafe-eval
- **Context Isolation**: Enabled for all windows
- **Sandboxing**: Enabled for additional security
- **Custom Protocol**: Uses secure app:// protocol
- **Local Database**: All data stored locally in SQLite

## Adding Icons
Place icon files in the `build/` directory:
- `icon.ico` - Windows icon (256x256 or higher)
- `icon.icns` - macOS icon
- `icon.png` - Linux icon (512x512)

## Development

### Adding New Features
1. Create components in `client/src/components/`
2. Add pages in `client/src/pages/`
3. Define API routes in `server/routes.ts`
4. Update database schema in `shared/schema.ts`

### Testing Changes
```bash
# Run in development mode
npm run electron

# Test production build
NODE_ENV=production npx electron electron-main.cjs
```

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use semantic HTML and ARIA labels

## Deployment

### Creating Installers
The application can be packaged for distribution on Windows, macOS, and Linux:

```bash
# Windows (.exe installer)
npx electron-builder --win

# macOS (.dmg)
npx electron-builder --mac

# Linux (.AppImage, .deb)
npx electron-builder --linux
```

Installers will be created in the `dist-electron/` directory.

### Distribution
- Windows: `AthenaAI-Setup-1.0.0.exe`
- macOS: `AthenaAI-1.0.0-[arch].dmg`
- Linux: `AthenaAI-1.0.0.AppImage`

## License
MIT License - See LICENSE file for details

## Support
For issues or questions, please open an issue on the project repository.

---
Built with ❤️ by the Athena AI Team