#!/bin/bash
echo "Starting Athena AI Desktop..."
cd "$(dirname "$0")"

# Check if electron exists
if [ -f "node_modules/electron/dist/electron" ]; then
    ./node_modules/electron/dist/electron electron-main.cjs
elif [ -f "node_modules/.bin/electron" ]; then
    ./node_modules/.bin/electron electron-main.cjs
else
    echo "Error: Electron not found. Please ensure node_modules are properly installed."
    exit 1
fi