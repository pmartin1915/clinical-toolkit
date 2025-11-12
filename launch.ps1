# Clinical Toolkit Development Server Launcher
# Version: 1.0.0
# Description: Automated script to handle git operations, dependencies, and dev server startup

#Requires -Version 5.1

<#
.SYNOPSIS
    Launches the Clinical Toolkit development server with automated git and dependency management.

.DESCRIPTION
    This script automates the entire development workflow:
    - Checks git status and branch
    - Auto-commits uncommitted changes
    - Pulls latest changes from remote
    - Handles merge conflicts
    - Manages dependencies
    - Starts the dev server
    - Provides AI-friendly error reporting

.EXAMPLE
    .\launch.ps1
    Launches the dev server with default settings

.EXAMPLE
    .\launch.ps1 -SkipGitOperations
    Skips git operations and just starts the dev server

.EXAMPLE
    .\launch.ps1 -Verbose
    Shows detailed progress information
#>

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Skip git operations (commit, pull, etc.)")]
    [switch]$SkipGitOperations,

    [Parameter(HelpMessage = "Force reinstall of node_modules")]
    [switch]$ForceReinstall,

    [Parameter(HelpMessage = "Branch name to use (auto-detects if not specified)")]
    [string]$BranchName,

    [Parameter(HelpMessage = "Port for dev server (default: auto)")]
    [int]$Port = 0
)

# ============================================================================
# Configuration
# ============================================================================

$ErrorActionPreference = "Stop"
$Script:ErrorLog = @()
$Script:LogFile = "launch-log-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').txt"

# ============================================================================
# Helper Functions
# ============================================================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )

    $params = @{
        Object = $Message
        ForegroundColor = $Color
    }

    if ($NoNewline) {
        $params['NoNewline'] = $true
    }

    Write-Host @params
    Add-Content -Path $Script:LogFile -Value "[$(Get-Date -Format 'HH:mm:ss')] $Message"
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n> $Message" -Color Cyan
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "  [OK] $Message" -Color Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "  [WARN] $Message" -Color Yellow
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-ColorOutput "  [ERROR] $Message" -Color Red
}

function Add-ErrorReport {
    param(
        [string]$Type,
        [string]$Location,
        [string]$Message,
        [string]$Fix
    )

    $Script:ErrorLog += [PSCustomObject]@{
        Type = $Type
        Location = $Location
        Message = $Message
        Fix = $Fix
        Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    }
}

function Show-ErrorReport {
    if ($Script:ErrorLog.Count -eq 0) {
        return
    }

    Write-ColorOutput "`n===============================================================================" -Color Red
    Write-ColorOutput "                           ERROR REPORT                                    " -Color Red
    Write-ColorOutput "===============================================================================" -Color Red
    Write-ColorOutput "`n[!] COPY THIS ERROR REPORT TO AI FOR HELP:`n" -Color Yellow

    $separator = "=" * 80
    $divider = "-" * 19
    $errorText = "$separator`n"
    $errorText += "ERROR REPORT - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    $errorText += "$separator`n`n"

    $errorIndex = 1
    foreach ($error in $Script:ErrorLog) {
        $errorText += "`nERROR #$errorIndex`n"
        $errorText += "$divider`n"
        $errorText += "Type:     $($error.Type)`n"
        $errorText += "Location: $($error.Location)`n"
        $errorText += "Message:  $($error.Message)`n"
        $errorText += "Fix:      $($error.Fix)`n"
        $errorText += "Time:     $($error.Timestamp)`n`n"
        $errorIndex++
    }

    $currentBranch = git branch --show-current 2>$null
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null

    $errorText += "$separator`n"
    $errorText += "Project: Clinical Toolkit`n"
    $errorText += "Path:    $PWD`n"
    $errorText += "Branch:  $currentBranch`n"
    $errorText += "Node:    $nodeVersion`n"
    $errorText += "NPM:     $npmVersion`n"
    $errorText += "$separator`n"

    Write-ColorOutput $errorText -Color White

    # Save to file
    $timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
    $errorFile = "error-report-$timestamp.txt"
    $errorText | Out-File -FilePath $errorFile -Encoding UTF8
    Write-ColorOutput "`n[SAVED] Error report saved to: $errorFile" -Color Cyan
    Write-ColorOutput "[INFO] You can copy the report above and paste it to the AI for assistance.`n" -Color Yellow
}

function Test-CommandExists {
    param([string]$Command)

    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Stop-DevServer {
    Write-Step "Checking for running dev servers..."

    $viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*vite*" }

    if ($viteProcesses) {
        Write-Warning "Found running dev server(s). Stopping..."
        $viteProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Success "Dev server stopped"
    } else {
        Write-Success "No running dev servers found"
    }
}

# ============================================================================
# Git Operations
# ============================================================================

function Invoke-GitOperations {
    if ($SkipGitOperations) {
        Write-Warning "Skipping git operations (-SkipGitOperations flag)"
        return $true
    }

    Write-Step "Checking git status..."

    # Verify we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-ErrorMessage "Not in a git repository!"
        Add-ErrorReport -Type "Git" -Location $PWD -Message "Not a git repository" -Fix "Navigate to the clinical-toolkit directory"
        return $false
    }

    # Get current branch
    $currentBranch = git branch --show-current
    Write-Success "Current branch: $currentBranch"

    # Determine target branch
    $targetBranch = if ($BranchName) {
        $BranchName
    } elseif ($currentBranch -like "claude/*") {
        $currentBranch
    } else {
        # Find the latest claude branch
        $claudeBranches = git branch -r | Where-Object { $_ -match "claude/mobile-toolkit-launch" } | Select-Object -First 1
        if ($claudeBranches) {
            ($claudeBranches -replace "origin/", "").Trim()
        } else {
            $currentBranch
        }
    }

    Write-Success "Target branch: $targetBranch"

    # Check for uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Warning "Found uncommitted changes"
        Write-ColorOutput "  Changes:" -Color Yellow
        $status | ForEach-Object { Write-ColorOutput "    $_" -Color Gray }

        # Auto-commit changes
        Write-Step "Auto-committing changes..."
        try {
            git add .
            $commitMsg = "chore: auto-commit before launching dev server`n`nAuto-committed by launch.ps1 script"
            git commit -m $commitMsg
            Write-Success "Changes committed"
        } catch {
            Write-ErrorMessage "Failed to commit changes: $_"
            Add-ErrorReport -Type "Git Commit" -Location $PWD -Message $_.Exception.Message -Fix "Manually commit or stash changes"
            return $false
        }
    } else {
        Write-Success "Working directory clean"
    }

    # Switch to target branch if needed
    if ($currentBranch -ne $targetBranch) {
        Write-Step "Switching to branch: $targetBranch..."
        try {
            $branchExists = git branch --list $targetBranch
            if (-not $branchExists) {
                # Check if remote branch exists
                $remoteBranch = "origin/$targetBranch"
                $remoteBranchExists = git branch -r --list $remoteBranch

                if ($remoteBranchExists) {
                    git checkout -b $targetBranch --track $remoteBranch
                } else {
                    throw "Branch '$targetBranch' does not exist locally or remotely"
                }
            } else {
                git checkout $targetBranch
            }
            Write-Success "Switched to branch: $targetBranch"
        } catch {
            Write-ErrorMessage "Failed to switch branch: $_"
            Add-ErrorReport -Type "Git Checkout" -Location $PWD -Message $_.Exception.Message -Fix "Manually checkout the correct branch"
            return $false
        }
    }

    # Fetch latest changes
    Write-Step "Fetching latest changes from remote..."
    try {
        git fetch origin $targetBranch 2>&1 | Out-Null
        Write-Success "Fetched latest changes"
    } catch {
        Write-Warning "Could not fetch from remote (continuing anyway)"
    }

    # Check if we're behind remote
    $localCommit = git rev-parse HEAD
    $remoteCommit = git rev-parse "origin/$targetBranch" 2>$null

    if ($remoteCommit -and ($localCommit -ne $remoteCommit)) {
        Write-Step "Pulling latest changes..."
        try {
            $pullResult = git pull origin $targetBranch 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Successfully pulled latest changes"
            } else {
                # Check for merge conflicts
                $conflictFiles = git diff --name-only --diff-filter=U
                if ($conflictFiles) {
                    Write-Warning "Merge conflicts detected in:"
                    $conflictFiles | ForEach-Object { Write-ColorOutput "    $_" -Color Yellow }

                    # Auto-resolve package-lock.json conflicts
                    if ($conflictFiles -contains "package-lock.json") {
                        Write-Step "Auto-resolving package-lock.json conflict..."
                        git checkout --theirs package-lock.json
                        git add package-lock.json
                        Write-Success "Resolved package-lock.json (using remote version)"
                    }

                    # Check if all conflicts are resolved
                    $remainingConflicts = git diff --name-only --diff-filter=U
                    if ($remainingConflicts) {
                        Write-ErrorMessage "Unable to auto-resolve all conflicts"
                        Add-ErrorReport -Type "Git Merge Conflict" -Location ($remainingConflicts -join ", ") `
                            -Message "Manual merge required" -Fix "Resolve conflicts manually or run: git merge --abort"
                        return $false
                    } else {
                        # Complete the merge
                        git commit --no-edit
                        Write-Success "All conflicts resolved and committed"
                    }
                } else {
                    throw "Pull failed: $pullResult"
                }
            }
        } catch {
            Write-ErrorMessage "Failed to pull changes: $_"
            Add-ErrorReport -Type "Git Pull" -Location $PWD -Message $_.Exception.Message -Fix "Manually pull changes or reset branch"
            return $false
        }
    } else {
        Write-Success "Already up to date with remote"
    }

    return $true
}

# ============================================================================
# Dependency Management
# ============================================================================

function Invoke-DependencyCheck {
    Write-Step "Checking dependencies..."

    if (-not (Test-Path "package.json")) {
        Write-ErrorMessage "package.json not found!"
        Add-ErrorReport -Type "Dependencies" -Location $PWD -Message "package.json missing" -Fix "Ensure you're in the project root directory"
        return $false
    }

    $needsInstall = $false

    # Check if node_modules exists
    if (-not (Test-Path "node_modules") -or $ForceReinstall) {
        if ($ForceReinstall) {
            Write-Warning "Force reinstall requested"
            if (Test-Path "node_modules") {
                Write-Step "Removing existing node_modules..."
                Remove-Item -Recurse -Force "node_modules"
                Write-Success "Removed node_modules"
            }
        } else {
            Write-Warning "node_modules not found"
        }
        $needsInstall = $true
    } else {
        Write-Success "node_modules exists"
    }

    # Check if package-lock.json changed recently
    if (Test-Path "package-lock.json") {
        $packageLockAge = (Get-Item "package-lock.json").LastWriteTime
        $nodeModulesAge = (Get-Item "node_modules").LastWriteTime

        if ($packageLockAge -gt $nodeModulesAge) {
            Write-Warning "package-lock.json is newer than node_modules"
            $needsInstall = $true
        }
    }

    if ($needsInstall) {
        Write-Step "Installing dependencies (this may take a few minutes)..."

        try {
            # Clear npm cache if this is a reinstall
            if ($ForceReinstall) {
                Write-ColorOutput "  Clearing npm cache..." -Color Gray
                npm cache clean --force 2>&1 | Out-Null
            }

            $installOutput = npm install 2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Success "Dependencies installed successfully"
            } else {
                # Check for specific errors
                $errorLines = $installOutput | Where-Object { $_ -match "error|ERR!" }
                if ($errorLines) {
                    Write-ErrorMessage "npm install failed with errors:"
                    $errorLines | ForEach-Object { Write-ColorOutput "    $_" -Color Red }

                    Add-ErrorReport -Type "NPM Install" -Location "package.json" `
                        -Message ($errorLines -join "`n") -Fix "Try running: npm cache clean --force, then npm install"
                    return $false
                }
            }
        } catch {
            Write-ErrorMessage "Failed to install dependencies: $_"
            Add-ErrorReport -Type "NPM Install" -Location $PWD -Message $_.Exception.Message -Fix "Check npm and Node.js installation"
            return $false
        }
    } else {
        Write-Success "Dependencies are up to date"
    }

    return $true
}

# ============================================================================
# Dev Server
# ============================================================================

function Start-DevServer {
    Write-Step "Starting development server..."

    # Stop any existing dev servers
    Stop-DevServer

    # Check if vite is available
    if (-not (Test-Path "node_modules\.bin\vite.ps1") -and -not (Test-Path "node_modules\.bin\vite.cmd")) {
        Write-ErrorMessage "Vite not found in node_modules!"
        Add-ErrorReport -Type "Dev Server" -Location "node_modules" -Message "Vite not installed" -Fix "Run: npm install"
        return $false
    }

    Write-Success "Starting Vite dev server..."
    Write-ColorOutput "`n===============================================================================" -Color Green
    Write-ColorOutput "                       LAUNCHING DEV SERVER                                " -Color Green
    Write-ColorOutput "===============================================================================`n" -Color Green

    Write-ColorOutput "  [*] Your Clinical Toolkit is ready!" -Color Cyan
    Write-ColorOutput "  [*] Open your browser and check the dev server URL below" -Color Cyan
    Write-ColorOutput "  [*] Press F12 in browser to open DevTools" -Color Cyan
    Write-ColorOutput "  [*] Click the phone icon to enable mobile device simulation" -Color Cyan
    Write-ColorOutput "`n  [!] Press Ctrl+C to stop the server`n" -Color Yellow

    # Start the dev server in the current console
    $portArg = if ($Port -gt 0) { "--port", $Port } else { @() }

    try {
        # Run npm run dev directly (this will keep running until Ctrl+C)
        & npm run dev @portArg
        return $true
    } catch {
        Write-ErrorMessage "Failed to start dev server: $_"
        Add-ErrorReport -Type "Dev Server" -Location "npm run dev" -Message $_.Exception.Message `
            -Fix "Check if port is available, try: npm run dev manually"
        return $false
    }
}

# ============================================================================
# Main Execution
# ============================================================================

function Main {
    $script:ErrorLog = @()

    Write-ColorOutput "" -Color Cyan
    Write-ColorOutput "===============================================================================" -Color Cyan
    Write-ColorOutput "                                                                               " -Color Cyan
    Write-ColorOutput "                 CLINICAL TOOLKIT DEVELOPMENT LAUNCHER                         " -Color Cyan
    Write-ColorOutput "                           Version 1.0.0                                       " -Color Cyan
    Write-ColorOutput "                                                                               " -Color Cyan
    Write-ColorOutput "===============================================================================" -Color Cyan
    Write-ColorOutput "" -Color Cyan

    Write-ColorOutput "[PATH] Project Path: $PWD" -Color Gray
    Write-ColorOutput "[TIME] Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Color Gray
    Write-ColorOutput "[LOG]  Log File: $Script:LogFile`n" -Color Gray

    # Verify prerequisites
    Write-Step "Verifying prerequisites..."

    $prerequisites = @{
        "git" = "Git is required for version control"
        "node" = "Node.js is required to run the dev server"
        "npm" = "NPM is required to manage dependencies"
    }

    $missingPrereqs = @()
    foreach ($cmd in $prerequisites.Keys) {
        if (Test-CommandExists $cmd) {
            $version = & $cmd --version 2>&1 | Select-Object -First 1
            Write-Success "$cmd ($version)"
        } else {
            Write-ErrorMessage "$cmd not found"
            $missingPrereqs += $cmd
            Add-ErrorReport -Type "Prerequisites" -Location "System" -Message "$cmd not found" -Fix $prerequisites[$cmd]
        }
    }

    if ($missingPrereqs.Count -gt 0) {
        Write-ErrorMessage "Missing required tools: $($missingPrereqs -join ', ')"
        Show-ErrorReport
        return 1
    }

    # Execute workflow
    $steps = @(
        @{ Name = "Git Operations"; Function = { Invoke-GitOperations } }
        @{ Name = "Dependency Check"; Function = { Invoke-DependencyCheck } }
        @{ Name = "Dev Server"; Function = { Start-DevServer } }
    )

    foreach ($step in $steps) {
        $result = & $step.Function
        if (-not $result) {
            Write-ColorOutput "`n[FAILED] Launch failed at: $($step.Name)`n" -Color Red
            Show-ErrorReport
            return 1
        }
    }

    if ($Script:ErrorLog.Count -eq 0) {
        Write-ColorOutput "" -Color Green
        Write-ColorOutput "===============================================================================" -Color Green
        Write-ColorOutput "                                                                               " -Color Green
        Write-ColorOutput "                      LAUNCH COMPLETED SUCCESSFULLY!                           " -Color Green
        Write-ColorOutput "                                                                               " -Color Green
        Write-ColorOutput "===============================================================================" -Color Green
        Write-ColorOutput "" -Color Green
    } else {
        Show-ErrorReport
    }

    return 0
}

# ============================================================================
# Script Entry Point
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-ColorOutput "`n!!! UNEXPECTED ERROR !!!`n" -Color Red
    Write-ColorOutput $_.Exception.Message -Color Red
    Write-ColorOutput "`nStack Trace:" -Color Yellow
    Write-ColorOutput $_.ScriptStackTrace -Color Gray

    Add-ErrorReport -Type "Unexpected Error" -Location $_.InvocationInfo.ScriptName `
        -Message $_.Exception.Message -Fix "Check the error message and stack trace above"

    Show-ErrorReport
    exit 1
}
