# Setup iOS platform for Clinical Toolkit
# One-time setup to add iOS support

Write-Host "=== Clinical Toolkit - iOS Setup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Installing @capacitor/ios dependency..." -ForegroundColor Yellow
npm install @capacitor/ios
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install @capacitor/ios!" -ForegroundColor Red
    exit 1
}
Write-Host "@capacitor/ios installed" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Adding iOS platform..." -ForegroundColor Yellow
npx cap add ios
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to add iOS platform!" -ForegroundColor Red
    Write-Host "Make sure you've built the web app first: npm run build" -ForegroundColor Yellow
    exit 1
}
Write-Host "iOS platform added" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync ios
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Capacitor sync completed" -ForegroundColor Green
Write-Host ""

Write-Host "=== iOS Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - On macOS: npx cap open ios" -ForegroundColor Gray
Write-Host "  - Configure signing in Xcode" -ForegroundColor Gray
Write-Host "  - Build and test on simulator or device" -ForegroundColor Gray
Write-Host ""
Write-Host "To deploy: .\scripts\deploy-ios.ps1" -ForegroundColor Gray
