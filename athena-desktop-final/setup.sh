#!/bin/bash
echo "🚀 Setting up Athena AI Desktop..."
echo "This will install dependencies and prepare the application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Rebuild native modules
echo "🔧 Rebuilding native modules..."
cd node_modules/better-sqlite3
npm run install
cd ../..

echo "✅ Setup complete! You can now run the application."
