# ============================================================================
# Android Test Automation - PowerShell Launcher
#
# Provides more advanced features and error handling than batch file
# Run with: .\android-test.ps1
# ============================================================================

[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$SkipEmulator,
    [switch]$Verbose
)

# Set console encoding for proper character display
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Color functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ $Message" "Cyan"
}

# Header
Clear-Host
Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "   CLINICAL WIZARD - ANDROID TEST AUTOMATION (PowerShell)   " "Cyan"
Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Cyan"
Write-Host ""

# Check Node.js
Write-Info "Checking prerequisites..."

try {
    $nodeVersion = node --version
    Write-Success "Node.js detected: $nodeVersion"
} catch {
    Write-ErrorMsg "Node.js is not installed or not in PATH"
    Write-Info "Please install Node.js from https://nodejs.org/"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Android SDK
if (-not $env:ANDROID_HOME) {
    Write-Warning "ANDROID_HOME environment variable not set"
    $defaultPath = "D:\Android\SDK"

    if (Test-Path $defaultPath) {
        Write-Info "Using default Android SDK path: $defaultPath"
        $env:ANDROID_HOME = $defaultPath
    } else {
        Write-ErrorMsg "Android SDK not found at default location"
        Write-Info "Please set ANDROID_HOME environment variable or update the script"
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Success "Android SDK found: $env:ANDROID_HOME"
}

Write-Host ""
Write-Info "Starting Android test automation..."
Write-Host ""

# Build arguments
$args = @()
if ($SkipBuild) { $args += "--skip-build" }
if ($SkipEmulator) { $args += "--skip-emulator" }
if ($Verbose) { $args += "--verbose" }

# Run the Node.js script
try {
    & node android-test.js @args
    $exitCode = $LASTEXITCODE

    Write-Host ""
    if ($exitCode -eq 0) {
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Green"
        Write-Success "   SUCCESS! Android Studio should be opening..."
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Green"
        Write-Host ""
        Write-Info "Next Steps:"
        Write-Info "1. Wait for Android Studio to finish loading"
        Write-Info "2. Click the green 'Run' button (▶) in the toolbar"
        Write-Info "3. Select your Pixel 6 emulator if prompted"
        Write-Info "4. Wait for the app to build and launch"
    } else {
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Red"
        Write-ErrorMsg "   ERRORS OCCURRED - Check android-test.log for details"
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Red"
    }
} catch {
    Write-ErrorMsg "Failed to run android-test.js: $_"
    $exitCode = 1
}

Write-Host ""
Read-Host "Press Enter to exit"
exit $exitCode
