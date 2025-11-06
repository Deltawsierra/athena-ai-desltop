#!/bin/bash

echo ""
echo "========================================"
echo "   ATHENA AI DESKTOP INSTALLER"
echo "========================================"
echo ""

# Set installation directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    INSTALL_DIR="$HOME/Desktop/AthenaAI"
    OS="macOS"
else
    INSTALL_DIR="$HOME/Desktop/AthenaAI"
    OS="Linux"
fi

echo "Operating System: $OS"
echo "Installation directory: $INSTALL_DIR"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    if [[ "$OS" == "macOS" ]]; then
        echo "  Download from: https://nodejs.org"
        echo "  Or use Homebrew: brew install node"
    else
        echo "  Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  Fedora: sudo dnf install nodejs npm"
        echo "  Or download from: https://nodejs.org"
    fi
    exit 1
fi

echo "Found Node.js: $(node --version)"
echo ""

# Remove old installation
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing old installation..."
    rm -rf "$INSTALL_DIR"
fi

# Create installation directory
echo "Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Copy all files
echo "Installing Athena AI files..."
cp -r . "$INSTALL_DIR/"

# Change to installation directory
cd "$INSTALL_DIR"

# Install dependencies
echo ""
echo "Installing dependencies (this may take 2-3 minutes)..."
echo "Please wait..."
npm install --production --silent

# Rebuild native modules
echo ""
echo "Finalizing installation..."
cd node_modules/better-sqlite3
npm run install --silent 2>/dev/null
cd ../..

# Create desktop launcher script
cat > "$HOME/Desktop/Athena AI.command" << 'EOF'
#!/bin/bash
cd "$HOME/Desktop/AthenaAI"
./node_modules/.bin/electron electron-main.cjs
EOF

chmod +x "$HOME/Desktop/Athena AI.command"

# For Linux, also create desktop entry
if [[ "$OS" == "Linux" ]]; then
    cat > "$HOME/Desktop/AthenaAI.desktop" << EOF
[Desktop Entry]
Name=Athena AI
Comment=Cybersecurity Intelligence Platform
Exec=$INSTALL_DIR/node_modules/.bin/electron $INSTALL_DIR/electron-main.cjs
Icon=$INSTALL_DIR/build/icon.png
Terminal=false
Type=Application
Categories=Development;Security;
EOF
    chmod +x "$HOME/Desktop/AthenaAI.desktop"
fi

echo ""
echo "========================================"
echo "   INSTALLATION COMPLETE!"
echo "========================================"
echo ""
echo "Athena AI has been installed successfully!"
echo ""
echo "A launcher has been created on your desktop."
if [[ "$OS" == "macOS" ]]; then
    echo "Double-click 'Athena AI.command' to launch the application."
else
    echo "Double-click 'AthenaAI' to launch the application."
fi
echo ""
echo "Default Login Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Enter to exit..."
read
