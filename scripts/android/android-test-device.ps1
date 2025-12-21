# Android Device Testing - Run Tests on Connected Device
# Runs automated tests on a physical device or emulator via ADB
#
# Usage:
#   .\scripts\android\android-test-device.ps1              # Auto-detect device
#   .\scripts\android\android-test-device.ps1 -DeviceId <id>  # Specific device
#   .\scripts\android\android-test-device.ps1 -TestCommand "test:e2e"  # Custom test command

param(
    [string]$DeviceId,
    [string]$TestCommand = "test:run"
)

$ErrorActionPreference = "Stop"

# Import shared module
Import-Module (Join-Path $PSScriptRoot "android-common.psm1") -Force

# Initialize logging
$logFile = Initialize-AndroidLog -ScriptName "android-test-device"
Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
Write-AndroidLog ""

# Load configuration
$config = Get-AndroidConfig

Write-AndroidLog "=== Android Device Testing ===" -ForegroundColor Cyan
Write-AndroidLog ""

# Check prerequisites
Write-AndroidLog "Checking prerequisites..." -ForegroundColor Gray
if (-not (Test-AndroidPrerequisites -RequireAdb -RequireNpm)) {
    exit 1
}
Write-AndroidLog ""

# Get connected devices
$devices = Get-ConnectedDevices -DeviceId $DeviceId
if (-not $devices) {
    Write-AndroidLog "Please connect a device or start an emulator" -ForegroundColor Yellow
    exit 1
}

# Select target device
$targetDevice = Select-TargetDevice -Devices $devices -DeviceId $DeviceId
if (-not $targetDevice) {
    Write-AndroidLog "Device selection failed" -ForegroundColor Red
    exit 1
}
Write-AndroidLog ""

# Display device information
Write-AndroidLog "Device Information:" -ForegroundColor Yellow
Write-AndroidLog "  Manufacturer: $($targetDevice.Manufacturer)" -ForegroundColor Gray
Write-AndroidLog "  Model: $($targetDevice.Model)" -ForegroundColor Gray
Write-AndroidLog "  Android: $($targetDevice.AndroidVersion) (API $($targetDevice.ApiLevel))" -ForegroundColor Gray
Write-AndroidLog ""

# Check if app is installed
Write-AndroidLog "Checking if app is installed..." -ForegroundColor Gray
$appInstalled = Test-AppInstalled -DeviceId $targetDevice.Id -PackageName $config.packageName

if ($appInstalled) {
    Write-AndroidLog "[OK] App is installed" -ForegroundColor Green

    # Get app version
    $version = Get-AppVersion -DeviceId $targetDevice.Id -PackageName $config.packageName
    if ($version) {
        Write-AndroidLog "  Version: $version" -ForegroundColor Gray
    }
} else {
    Write-AndroidLog "[WARN] App not installed on device" -ForegroundColor Yellow
    Write-AndroidLog "Run android-quick-build.ps1 to build and install the app" -ForegroundColor Gray
    Write-AndroidLog ""

    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne 'y') {
        exit 0
    }
}
Write-AndroidLog ""

# Test device connection
Write-AndroidLog "Testing device connection..." -ForegroundColor Gray
if (-not (Test-DeviceConnection -DeviceId $targetDevice.Id)) {
    Write-AndroidLog "Error: Device not responsive" -ForegroundColor Red
    exit 1
}
Write-AndroidLog "[OK] Device connection verified" -ForegroundColor Green
Write-AndroidLog ""

# Set environment variable for test framework
$env:ANDROID_SERIAL = $targetDevice.Id
Write-AndroidLog "Set ANDROID_SERIAL=$($targetDevice.Id)" -ForegroundColor Gray
Write-AndroidLog ""

# Run tests (SECURITY FIX: Use & instead of Invoke-Expression)
Write-AndroidLog "Running tests..." -ForegroundColor Yellow
Write-AndroidLog "Test Command: npm run $TestCommand" -ForegroundColor Gray
Write-AndroidLog ""

# Execute test command directly (not via Invoke-Expression for security)
& npm run $TestCommand 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host
$testExitCode = $LASTEXITCODE

Write-AndroidLog ""

# Test results summary
if ($testExitCode -eq 0) {
    Write-AndroidLog "=== Tests Passed ===" -ForegroundColor Green
} else {
    Write-AndroidLog "=== Tests Failed ===" -ForegroundColor Red
}

Write-AndroidLog "Device: $($targetDevice.Id) ($($targetDevice.Manufacturer) $($targetDevice.Model))" -ForegroundColor Cyan
Write-AndroidLog "Android: $($targetDevice.AndroidVersion) (API $($targetDevice.ApiLevel))" -ForegroundColor Cyan
Write-AndroidLog ""

# Helpful commands
Write-AndroidLog "To view device logs:" -ForegroundColor Gray
Write-AndroidLog "  .\scripts\android\android-log-watch.ps1 -DeviceId $($targetDevice.Id)" -ForegroundColor DarkGray
Write-AndroidLog ""

Write-AndroidLog "To clear logs:" -ForegroundColor Gray
Write-AndroidLog "  adb -s $($targetDevice.Id) logcat -c" -ForegroundColor DarkGray
Write-AndroidLog ""

Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray

exit $testExitCode
