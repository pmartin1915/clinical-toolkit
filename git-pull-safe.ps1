# ============================================================================
# Safe Git Pull - PowerShell
# Handles merge conflicts automatically, especially package-lock.json
# ============================================================================

[CmdletBinding()]
param()

# Set console encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Color functions
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success { param([string]$Message); Write-ColorOutput "✓ $Message" "Green" }
function Write-ErrorMsg { param([string]$Message); Write-ColorOutput "✗ $Message" "Red" }
function Write-Warning { param([string]$Message); Write-ColorOutput "⚠ $Message" "Yellow" }
function Write-Info { param([string]$Message); Write-ColorOutput "ℹ $Message" "Cyan" }

# Header
Clear-Host
Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Cyan"
Write-ColorOutput "   SAFE GIT PULL WITH AUTO CONFLICT RESOLUTION   " "Cyan"
Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Cyan"
Write-Host ""

# Check Node.js
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

Write-Host ""
Write-Info "Starting safe git pull..."
Write-Host ""

# Run the Node.js script
try {
    & node git-pull-safe.js
    $exitCode = $LASTEXITCODE

    Write-Host ""
    if ($exitCode -eq 0) {
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Green"
        Write-Success "   SUCCESS! Your code is up to date"
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Green"
    } else {
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Yellow"
        Write-Warning "   CONFLICTS DETECTED - Check git-pull.log for details"
        Write-ColorOutput "═══════════════════════════════════════════════════════════════════════" "Yellow"
    }
} catch {
    Write-ErrorMsg "Failed to run git-pull-safe.js: $_"
    $exitCode = 1
}

Write-Host ""
Read-Host "Press Enter to exit"
exit $exitCode
