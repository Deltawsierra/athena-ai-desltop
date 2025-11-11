#!/bin/bash
# Athena AI Desktop Launcher for Linux
# Run this file to launch Athena AI

echo "Starting Athena AI Cybersecurity Platform..."
echo ""

# Navigate to the script's directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/ and try again."
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "ERROR: Application dependencies not found."
    echo "Please ensure the application is properly installed."
    echo "If this is a development build, run 'npm install' first."
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi

echo ""
echo "Launching Athena AI..."
echo "The application will open in a new window momentarily."
echo ""
echo "To stop the application, close the Electron window or press Ctrl+C here."
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