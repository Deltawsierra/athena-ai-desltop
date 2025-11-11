#!/bin/bash

# ============================================
# Athena AI Desktop Application Launcher
# Linux Shell Script
# ============================================

echo "Starting Athena AI Cybersecurity Platform..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

# Navigate to the script's directory
cd "$SCRIPT_DIR"

# Check if we're in the application directory
if [ ! -f "package.json" ]; then
    echo "========================================================"
    echo "ERROR: Cannot launch from this location!"
    echo "========================================================"
    echo ""
    echo "This launcher script was not found in the application folder."
    echo ""
    echo "TO FIX THIS PROBLEM:"
    echo ""
    echo "1. Navigate to your AegisEngine folder"
    echo "   (The folder where you ran 'npm install')"
    echo ""
    echo "2. Find the launch-linux.sh file there"
    echo ""
    echo "3. Create a symbolic link or desktop shortcut:"
    echo "   ln -s $(pwd)/launch-linux.sh ~/Desktop/AthenaAI"
    echo ""
    echo "4. Use the shortcut on your desktop to launch Athena AI"
    echo ""
    echo "DO NOT copy or move the .sh file itself to your desktop."
    echo "You need to create a SYMBOLIC LINK instead."
    echo ""
    echo "Current location: $(pwd)"
    echo "========================================================"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/ or through your package manager."
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ERROR: Application dependencies not found."
    echo ""
    echo "Please run 'npm install' in this directory first:"
    echo "$(pwd)"
    echo ""
    echo "Steps:"
    echo "1. Open Terminal"
    echo "2. Navigate to: $(pwd)"
    echo "3. Run: npm install"
    echo "4. Wait for installation to complete"
    echo "5. Try launching again"
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

echo ""
echo "Launching Athena AI..."
echo "The application will open in a new window momentarily."
echo ""
echo "To stop the application, close the Electron window."
echo ""

# Run Electron in production mode
export NODE_ENV=production
npm run electron

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to start the application."
    echo "Please check the error messages above."
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi