#!/bin/bash
# The Arcane Codex - Node.js Server Startup Script
# This script starts the Node.js backend API server

echo "==================================================================="
echo "  THE ARCANE CODEX - Node.js Backend Server"
echo "==================================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Recommended version: 14.0.0 or higher"
    echo ""
    exit 1
fi

# Display Node.js version
echo "[INFO] Checking Node.js version..."
node --version
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] node_modules not found. Installing dependencies..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERROR] Failed to install dependencies!"
        exit 1
    fi
    echo ""
    echo "[SUCCESS] Dependencies installed successfully!"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found!"
    echo "Creating .env from .env.node.example..."
    echo ""
    cp .env.node.example .env
    echo ""
    echo "[INFO] Please edit .env if you need to change PORT or other settings"
    echo ""
fi

echo "[INFO] Starting The Arcane Codex API server..."
echo "[INFO] Server will be available at: http://localhost:3000"
echo "[INFO] Press Ctrl+C to stop the server"
echo ""
echo "==================================================================="
echo ""

# Start the server
npm start
