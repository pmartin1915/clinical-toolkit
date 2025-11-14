# Git Safety Net - Start Work Session

param(
    [string]$ProjectPath = "."
)

Write-Host "`n🚀 Starting Work Session" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Navigate to project
Set-Location $ProjectPath

# Load config
$config = Get-Content ".git-safety-net\config.json" | ConvertFrom-Json

# Check branch
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if ($branch -ne "main") {
    Write-Host "⚠️  Warning: Not on main branch (currently on: $branch)" -ForegroundColor Yellow
    $switch = Read-Host "Switch to main? (y/n)"
    if ($switch -eq "y") {
        git checkout main
        $branch = "main"
    }
}

Write-Host "✅ Branch: $branch" -ForegroundColor Green

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
}

# Pull latest
Write-Host "⬇️  Pulling latest changes..." -ForegroundColor Yellow
try {
    git pull origin main
    Write-Host "✅ Up to date with origin/main" -ForegroundColor Green
} catch {
    Write-Host "❌ Pull failed: $_" -ForegroundColor Red
}

# Show last commit
Write-Host "`n📊 Last commit:" -ForegroundColor Cyan
git log -1 --pretty=format:"%h - %s (%cr) <%an>" --color=always

# Device tracking
Write-Host "`n📱 Device: $($config.deviceName)" -ForegroundColor Cyan
if ($config.lastDevice -ne $config.deviceName) {
    Write-Host "⚠️  Last used on: $($config.lastDevice)" -ForegroundColor Yellow
}

# Log session start
$sessionLog = Get-Content ".git-safety-net\session-log.json" | ConvertFrom-Json
$session = @{
    device = $config.deviceName
    start = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    end = $null
    duration = $null
    commits = 0
    filesChanged = 0
}
$sessionLog.sessions += $session
$sessionLog | ConvertTo-Json -Depth 10 | Set-Content ".git-safety-net\session-log.json"

Write-Host "`n✅ Ready to work!`n" -ForegroundColor Green
