#!/bin/bash
echo "🚀 Starting Athena AI Desktop..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running install.sh first..."
    ./install.sh
fi

# Run with electron
if [ -f "node_modules/.bin/electron" ]; then
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "❌ Error: Electron not found. Please run ./install.sh first"
    exit 1
fi
