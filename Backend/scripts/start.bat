@echo off
REM Locket Backend Start Script for Windows

echo 🚀 Starting Locket Backend API...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if db.json exists
if not exist "db.json" (
    echo ❌ db.json not found! Please make sure the database file exists.
    pause
    exit /b 1
)

REM Start the server
echo 🔧 Starting server on port 3001...
npm start

pause
