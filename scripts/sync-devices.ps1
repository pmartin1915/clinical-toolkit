# Git Safety Net - Sync Devices

Write-Host "`n🔄 Device Sync" -ForegroundColor Cyan
Write-Host "==============`n" -ForegroundColor Cyan

# Load config
$config = Get-Content ".git-safety-net\config.json" | ConvertFrom-Json

Write-Host "Current device: $($config.deviceName)" -ForegroundColor Cyan

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "`n⚠️  Uncommitted changes detected" -ForegroundColor Yellow
    git status --short
    
    $commit = Read-Host "`nCommit these changes? (y/n)"
    if ($commit -eq "y") {
        $message = Read-Host "Commit message"
        & "$PSScriptRoot\done.ps1" -Message $message
    } else {
        Write-Host "❌ Cannot sync with uncommitted changes" -ForegroundColor Red
        exit 1
    }
}

# Check for unpushed commits
$branch = git rev-parse --abbrev-ref HEAD
$unpushed = git log origin/$branch..$branch --oneline 2>$null
if ($unpushed) {
    Write-Host "`n⬆️  Pushing unpushed commits..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ Pushed" -ForegroundColor Green
}

# Update config
$otherDevice = if ($config.deviceName -eq "PC") { "Laptop" } else { "PC" }
$config.lastDevice = $config.deviceName
$config.lastSync = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$config | ConvertTo-Json | Set-Content ".git-safety-net\config.json"

Write-Host "`n✅ Sync complete!" -ForegroundColor Green
Write-Host "`n📱 On your $otherDevice, run:" -ForegroundColor Cyan
Write-Host "   git pull origin main`n" -ForegroundColor Yellow
