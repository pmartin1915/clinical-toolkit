@echo off
REM ============================================================================
REM Android Test Automation - Windows Batch Launcher
REM
REM Double-click this file to automatically test Clinical Wizard on Android
REM ============================================================================

echo.
echo ================================================================================
echo    CLINICAL WIZARD - ANDROID TEST AUTOMATION
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

REM Set Android SDK path if not already set
if "%ANDROID_HOME%"=="" (
    echo [INFO] ANDROID_HOME not set, using default location
    set ANDROID_HOME=D:\Android\SDK
    echo Set ANDROID_HOME=%ANDROID_HOME%
) else (
    echo [INFO] Using ANDROID_HOME: %ANDROID_HOME%
)

echo.
echo Starting Android test automation...
echo.

REM Run the Node.js script
node android-test.js

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================================
    echo    SUCCESS! Android Studio should be opening...
    echo ================================================================================
    echo.
) else (
    echo.
    echo ================================================================================
    echo    ERRORS OCCURRED - Check android-test.log for details
    echo ================================================================================
    echo.
)

pause
