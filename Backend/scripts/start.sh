#!/bin/bash

# Locket Backend Start Script

echo "🚀 Starting Locket Backend API..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if db.json exists
if [ ! -f "db.json" ]; then
    echo "❌ db.json not found! Please make sure the database file exists."
    exit 1
fi

# Start the server
echo "🔧 Starting server on port 3001..."
npm start
