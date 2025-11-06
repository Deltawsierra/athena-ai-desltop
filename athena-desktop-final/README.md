# Athena AI Desktop Application

## 🚀 Quick Start Guide

### Installation (First Time Only)

#### Windows:
1. Extract this folder to your desired location
2. Double-click **setup.bat**
3. Wait for installation to complete

#### Mac/Linux:
1. Extract this folder to your desired location
2. Open terminal in this folder
3. Run: **./setup.sh**
4. Wait for installation to complete

### Running the Application

#### Windows:
- Double-click **run.bat**

#### Mac/Linux:
- Run: **./run.sh** in terminal

## 📋 System Requirements

- **Node.js**: Version 16 or later
- **RAM**: 2GB minimum (4GB recommended)
- **Disk Space**: 500MB for installation
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+ (or similar Linux)

## 🔐 Login Credentials

| User Type | Username | Password |
|-----------|----------|----------|
| Administrator | admin | admin123 |
| Test User | testuser | password123 |

## ✨ Features

- **Fully Offline Operation**: No internet required after setup
- **Local SQLite Database**: All data stored locally
- **JARVIS-Inspired Interface**: Futuristic cybersecurity UI
- **Comprehensive Security Tools**:
  - Real-time Threat Monitoring Dashboard
  - CVE Classification System
  - Automated Penetration Testing
  - Security Audit Logging
  - Client & Test Management
  - AI-Powered Analysis Tools

## 🔧 Troubleshooting

### Application Won't Start

1. **Verify Node.js Installation**
   - Open terminal/command prompt
   - Run: `node --version`
   - Should show v16.0.0 or higher

2. **Rebuild Native Modules**
   - Delete the `node_modules` folder
   - Run setup script again

3. **Check for Errors**
   - Run from terminal/command prompt to see error messages
   - Check `athena.db` file exists

### Database Issues

- **Reset Database**: Delete `athena.db` file and restart
- **Backup Data**: Copy `athena.db` to save your data

### Missing Dependencies on Linux

If you see library errors, install:
```bash
sudo apt-get update
sudo apt-get install -y \
  libglib2.0-0 libgtk-3-0 libnss3 \
  libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libx11-6 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2 libxss1 libxtst6
```

## 📁 File Structure

- **athena.db** - Local SQLite database
- **server/** - Backend application code
- **client/dist/** - Frontend application
- **electron-main.cjs** - Desktop app entry point
- **setup.sh/.bat** - Installation scripts
- **run.sh/.bat** - Launch scripts

## 🛠️ Development Mode

For developers who want to modify the application:

1. Install all dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## 🆘 Support

If you encounter issues:
1. Check this README for solutions
2. Run from terminal to see detailed error messages
3. Ensure all system requirements are met

## 📝 License

Athena AI Desktop - Cybersecurity Intelligence Platform
Built with Electron, React, TypeScript, and SQLite

---
Version 1.0.0 | Ready for offline deployment
