# Git Safety Net - Finish Work Session

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "`n💾 Finishing Work Session" -ForegroundColor Cyan
Write-Host "=========================`n" -ForegroundColor Cyan

# Load config
$config = Get-Content ".git-safety-net\config.json" | ConvertFrom-Json

# Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
    exit 0
}

Write-Host "📝 Changes to commit:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Run tests if configured
if ($config.testBeforeCommit) {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    if (Test-Path "package.json") {
        $testResult = npm test 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Tests failed!" -ForegroundColor Red
            Write-Host "`nOptions:" -ForegroundColor Yellow
            Write-Host "1. Review and fix tests"
            Write-Host "2. Commit anyway (not recommended)"
            Write-Host "3. Commit with --no-verify (skip tests)"
            
            $choice = Read-Host "`nChoice (1/2/3)"
            
            if ($choice -eq "1") {
                Write-Host "❌ Commit cancelled. Fix tests and try again." -ForegroundColor Red
                exit 1
            } elseif ($choice -eq "3") {
                $noVerify = "--no-verify"
            }
        } else {
            Write-Host "✅ Tests passed" -ForegroundColor Green
        }
    }
}

# Stage all changes
Write-Host "`n📦 Staging changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing..." -ForegroundColor Yellow
if ($noVerify) {
    git commit -m $Message --no-verify
} else {
    git commit -m $Message
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Committed" -ForegroundColor Green

# Push
Write-Host "⬆️  Pushing to origin/main..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed successfully" -ForegroundColor Green

# Update session log
$sessionLog = Get-Content ".git-safety-net\session-log.json" | ConvertFrom-Json
$lastSession = $sessionLog.sessions[-1]
if ($lastSession) {
    $lastSession.end = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $start = [DateTime]::Parse($lastSession.start)
    $end = [DateTime]::Parse($lastSession.end)
    $duration = $end - $start
    $lastSession.duration = "{0}h {1}m" -f [int]$duration.TotalHours, $duration.Minutes
    $lastSession.commits += 1
    $lastSession.filesChanged = ($status | Measure-Object).Count
    
    $sessionLog | ConvertTo-Json -Depth 10 | Set-Content ".git-safety-net\session-log.json"
}

# Update config
$config.lastSync = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$config | ConvertTo-Json | Set-Content ".git-safety-net\config.json"

Write-Host "`n📊 Session Summary:" -ForegroundColor Cyan
Write-Host "Files changed: $($lastSession.filesChanged)"
Write-Host "Duration: $($lastSession.duration)"
Write-Host "`n✅ Work session complete!`n" -ForegroundColor Green
