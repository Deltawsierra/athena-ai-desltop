#!/bin/bash

echo "========================================"
echo "   ATHENA AI DESKTOP LAUNCHER"
echo "========================================"
echo ""

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check if Electron exists
if [ -f "node_modules/.bin/electron" ]; then
    echo "Starting Athena AI..."
    ./node_modules/.bin/electron electron-main.cjs
else
    echo ""
    echo "ERROR: Electron not found in node_modules!"
    echo ""
    echo "Please run these steps first:"
    echo "1. Make sure Node.js is installed"
    echo "2. Open Terminal in this folder"
    echo "3. Run: npm install"
    echo "4. Then run this launcher again"
    echo ""
    echo "Press Enter to exit..."
    read
fi