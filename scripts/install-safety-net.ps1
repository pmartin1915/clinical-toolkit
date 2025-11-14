# Git Safety Net - Installation Script
# Run this once to set up the system

Write-Host "`n🔧 Git Safety Net - Installation" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "❌ PowerShell 5.1+ required. Current: $($PSVersionTable.PSVersion)" -ForegroundColor Red
    exit 1
}

# Check if in git repo
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check git
try {
    git --version | Out-Null
    Write-Host "✅ Git installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found" -ForegroundColor Red
    exit 1
}

# Check Node.js (optional for tests)
try {
    node --version | Out-Null
    Write-Host "✅ Node.js installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js not found (tests may not work)" -ForegroundColor Yellow
}

# Get device name
Write-Host "`n📱 Device Configuration" -ForegroundColor Cyan
$deviceName = Read-Host "Enter device name (e.g., PC, Laptop)"
if ([string]::IsNullOrWhiteSpace($deviceName)) {
    $deviceName = $env:COMPUTERNAME
}

# Update config
$configPath = ".git-safety-net\config.json"
$config = Get-Content $configPath | ConvertFrom-Json
$config.deviceName = $deviceName
$config.lastDevice = $deviceName
$config.lastSync = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$config | ConvertTo-Json | Set-Content $configPath

Write-Host "✅ Device set to: $deviceName" -ForegroundColor Green

# Setup PowerShell profile
Write-Host "`n⚙️  Configuring PowerShell profile..." -ForegroundColor Cyan

$profilePath = $PROFILE
$profileDir = Split-Path $profilePath

if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

if (-not (Test-Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}

# Add custom prompt function
$promptFunction = @'

# Git Safety Net - Custom Prompt
function prompt {
    $path = Get-Location
    $gitBranch = ""
    $gitStatus = ""
    
    if (Test-Path ".git") {
        try {
            $branch = git rev-parse --abbrev-ref HEAD 2>$null
            if ($branch) {
                $gitBranch = " ($branch"
                
                $status = git status --porcelain 2>$null
                if ($status) {
                    $gitStatus = " ✗"
                    $color = "Yellow"
                } else {
                    $unpushed = git log origin/$branch..$branch 2>$null
                    if ($unpushed) {
                        $gitStatus = " ⚠"
                        $color = "Red"
                    } else {
                        $gitStatus = " ✓"
                        $color = "Green"
                    }
                }
                $gitBranch += $gitStatus + ")"
            }
        } catch {}
    }
    
    $projectName = Split-Path -Leaf $path
    Write-Host "[$projectName]" -NoNewline -ForegroundColor Cyan
    if ($gitBranch) {
        Write-Host $gitBranch -NoNewline -ForegroundColor $color
    }
    Write-Host " $path" -NoNewline -ForegroundColor White
    return "> "
}

# Git Safety Net - Aliases
Set-Alias work "$PSScriptRoot\scripts\work.ps1"
Set-Alias done "$PSScriptRoot\scripts\done.ps1"
Set-Alias status "$PSScriptRoot\scripts\status.ps1"
Set-Alias sync "$PSScriptRoot\scripts\sync-devices.ps1"
'@

# Check if already installed
$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -notlike "*Git Safety Net*") {
    Add-Content $profilePath $promptFunction
    Write-Host "✅ Profile configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Profile already configured" -ForegroundColor Yellow
}

# Setup git hooks
Write-Host "`n🪝 Setting up git hooks..." -ForegroundColor Cyan

$preCommitHook = @'
#!/bin/sh
# Git Safety Net - Pre-commit hook

echo "🔍 Running pre-commit checks..."

# Check for TODO/FIXME
todos=$(git diff --cached | grep -i "TODO\|FIXME" || true)
if [ -n "$todos" ]; then
    echo "⚠️  Warning: Found TODO/FIXME comments"
fi

echo "✅ Pre-commit checks passed"
exit 0
'@

$prePushHook = @'
#!/bin/sh
# Git Safety Net - Pre-push hook

branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$branch" = "main" ]; then
    echo "⚠️  Pushing to main branch"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Push cancelled"
        exit 1
    fi
fi

echo "✅ Pre-push checks passed"
exit 0
'@

Set-Content ".git\hooks\pre-commit" $preCommitHook
Set-Content ".git\hooks\pre-push" $prePushHook

Write-Host "✅ Git hooks installed" -ForegroundColor Green

# Test scripts exist
Write-Host "`n🧪 Verifying scripts..." -ForegroundColor Cyan
$scripts = @("work.ps1", "done.ps1", "status.ps1", "sync-devices.ps1")
foreach ($script in $scripts) {
    if (Test-Path "scripts\$script") {
        Write-Host "✅ $script" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $script not found (will be created)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart PowerShell to load new profile"
Write-Host "2. Run: work (to start work session)"
Write-Host "3. Run: done `"message`" (to commit and push)"
Write-Host "4. Run: status (to check git status)"
Write-Host "5. Run: sync (to switch devices)`n"
