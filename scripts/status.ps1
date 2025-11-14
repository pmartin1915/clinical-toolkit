# Git Safety Net - Quick Status Check

Write-Host "`n📊 Git Status" -ForegroundColor Cyan
Write-Host "=============`n" -ForegroundColor Cyan

# Load config
$config = Get-Content ".git-safety-net\config.json" | ConvertFrom-Json

# Current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Branch: " -NoNewline
Write-Host $branch -ForegroundColor Green

# Uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "`n⚠️  Uncommitted changes:" -ForegroundColor Yellow
    git status --short
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

# Unpushed commits
$unpushed = git log origin/$branch..$branch --oneline 2>$null
if ($unpushed) {
    Write-Host "`n⚠️  Unpushed commits:" -ForegroundColor Yellow
    Write-Host $unpushed
}

# Last 3 commits
Write-Host "`n📜 Recent commits:" -ForegroundColor Cyan
git log -3 --pretty=format:"%C(yellow)%h%C(reset) - %s %C(green)(%cr)%C(reset) %C(blue)<%an>%C(reset)" --color=always

# Device info
Write-Host "`n`n📱 Device: $($config.deviceName)" -ForegroundColor Cyan
Write-Host "Last sync: $($config.lastSync)"

# Check if pull needed
git fetch origin main 2>$null
$behind = git rev-list HEAD..origin/main --count 2>$null
if ($behind -gt 0) {
    Write-Host "`n⚠️  Behind origin/main by $behind commit(s)" -ForegroundColor Yellow
    Write-Host "Run: git pull origin main"
}

Write-Host ""
