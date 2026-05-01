@echo off
REM Lost & Found - Quick Start Script for Windows

echo ============================================
echo Lost & Found - Clonfert College
echo Quick Start Script
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please install npm with Node.js
    pause
    exit /b 1
)

echo ✓ npm found
echo.

REM Navigate to backend
cd backend
echo ✓ Changed to backend directory
echo.

REM Check if dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
    echo.
)

echo.
echo ============================================
echo Starting Backend Server...
echo ============================================
echo.
echo Server will start on http://localhost:5000
echo.
echo Admin Panel: http://localhost:5000/admin.html
echo Public Site: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start
