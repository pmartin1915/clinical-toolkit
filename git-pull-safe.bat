@echo off
REM ============================================================================
REM Safe Git Pull - Windows Launcher
REM Handles merge conflicts automatically, especially package-lock.json
REM ============================================================================

echo.
echo ================================================================================
echo    SAFE GIT PULL WITH AUTO CONFLICT RESOLUTION
echo ================================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Starting safe git pull...
echo.

REM Run the Node.js script
node git-pull-safe.js

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================================
    echo    SUCCESS! Your code is up to date
    echo ================================================================================
    echo.
) else (
    echo.
    echo ================================================================================
    echo    CONFLICTS DETECTED - Check git-pull.log for details
    echo ================================================================================
    echo.
)

pause
