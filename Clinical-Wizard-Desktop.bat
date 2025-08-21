@echo off
title Clinical Wizard Desktop
echo 🩺 Clinical Wizard - Evidence-Based Medical Decision Support
echo ========================================================
echo Starting desktop application...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo Visit: https://nodejs.org
    pause
    exit /b 1
)

REM Check if build exists
if not exist "dist" (
    echo 📦 Building application...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed. Please check the output above.
        pause
        exit /b 1
    )
)

REM Install express if needed (using built-in package.json)
echo 📋 Checking server dependencies...
npm list express >nul 2>&1
if errorlevel 1 (
    echo Installing server dependencies...
    npm install express
)

REM Start the desktop application
echo 🚀 Launching Clinical Wizard Desktop...
echo.
echo 🏥 All 7 medical conditions available offline
echo 🧮 5+ clinical calculators ready
echo 📚 Evidence-based guidelines included
echo.
node desktop-launcher.cjs

pause