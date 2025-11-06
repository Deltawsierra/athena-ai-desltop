# Athena AI Desktop - Portable Edition

## 🚀 Quick Start

### First Time Setup (Required Once)
1. Extract this folder to your desired location (e.g., Desktop)
2. Install dependencies:
   - **Windows**: Double-click "install.bat"
   - **Mac/Linux**: Run "./install.sh" in terminal

### Running the Application
After installation:
- **Windows**: Double-click "run.bat"
- **Mac/Linux**: Run "./run.sh" in terminal

## 📋 System Requirements
- Node.js 16 or later
- 2GB RAM minimum
- 500MB disk space

## 🔐 Default Login Credentials
- **Admin**: username "admin", password "admin123"
- **Test User**: username "testuser", password "password123"

## 💡 Features
- ✅ Fully offline operation
- ✅ Local SQLite database
- ✅ JARVIS-inspired interface
- ✅ Real-time threat monitoring
- ✅ CVE classification
- ✅ Penetration testing
- ✅ Audit logging

## 🔧 Troubleshooting

### If the app doesn't start:
1. Ensure Node.js is installed (run "node --version" in terminal)
2. Delete node_modules folder and run install script again
3. Check that all files were extracted properly

### Database Issues:
- Your data is stored in "athena.db" file
- To reset: Delete athena.db and restart the app

## 📁 File Structure
- athena.db - Local database
- server/ - Backend code
- client/dist/ - Frontend application
- electron-main.cjs - Desktop app entry point

## 🛠️ For Developers
To run in development mode:
1. Install all dependencies: npm install
2. Start dev server: npm run dev

---
Built with ❤️ using Electron, React, and SQLite
