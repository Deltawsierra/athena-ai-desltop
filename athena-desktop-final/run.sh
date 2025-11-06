#!/bin/bash
echo "🚀 Starting Athena AI Desktop..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running setup first..."
    ./setup.sh
fi

# Check if better-sqlite3 is properly built
if [ ! -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ]; then
    echo "🔧 Rebuilding native modules..."
    cd node_modules/better-sqlite3
    npm run install
    cd ../..
fi

# Run the application
if [ -f "node_modules/.bin/electron" ]; then
    echo "🖥️  Launching Athena AI Desktop..."
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "❌ Error: Electron not found. Please run ./setup.sh first"
    exit 1
fi
