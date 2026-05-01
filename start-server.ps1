#!/usr/bin/env pwsh
# Lost & Found - Quick Start Script for PowerShell

Write-Host "============================================"
Write-Host "Lost & Found - Clonfert College"
Write-Host "Quick Start Script"
Write-Host "============================================"
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion"
} catch {
    Write-Host "ERROR: Node.js is not installed!"
    Write-Host "Please install Node.js from https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: $npmVersion"
} catch {
    Write-Host "ERROR: npm is not installed!"
    Write-Host "Please install npm with Node.js"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Navigate to backend
Set-Location backend
Write-Host "✓ Changed to backend directory"
Write-Host ""

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies!"
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✓ Dependencies installed"
    Write-Host ""
}

Write-Host ""
Write-Host "============================================"
Write-Host "Starting Backend Server..."
Write-Host "============================================"
Write-Host ""
Write-Host "Server will start on http://localhost:5000"
Write-Host ""
Write-Host "Admin Panel: http://localhost:5000/admin.html"
Write-Host "Public Site: http://localhost:5000"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

npm start
