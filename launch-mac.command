#!/bin/bash

# ============================================
# Athena AI Desktop Application Launcher
# macOS Shell Script
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
    echo "1. Navigate to your AegisEngine folder in Finder"
    echo "   (The folder where you ran 'npm install')"
    echo ""
    echo "2. Find the launch-mac.command file there"
    echo ""
    echo "3. Hold Command+Option and drag launch-mac.command"
    echo "   to your desktop to create an alias"
    echo ""
    echo "4. Use the alias on your desktop to launch Athena AI"
    echo ""
    echo "DO NOT copy or move the .command file itself to your desktop."
    echo "You need to create an ALIAS instead."
    echo ""
    echo "Current location: $(pwd)"
    echo "========================================================"
    read -p "Press any key to exit..."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    read -p "Press any key to exit..."
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
    read -p "Press any key to exit..."
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
    read -p "Press any key to exit..."
    exit 1
fi