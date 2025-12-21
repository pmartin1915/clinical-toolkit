# Android Quick Build - One-Command Build + Install
# Builds APK and installs on connected device without opening Android Studio
#
# Usage:
#   .\scripts\android\android-quick-build.ps1              # Debug build (default)
#   .\scripts\android\android-quick-build.ps1 -Release     # Release build
#   .\scripts\android\android-quick-build.ps1 -SkipTests   # Skip pre-build tests
#   .\scripts\android\android-quick-build.ps1 -DeviceId <id>  # Install on specific device

param(
    [switch]$Release,
    [switch]$SkipTests,
    [switch]$SkipInstall,
    [string]$DeviceId
)

$ErrorActionPreference = "Stop"

# Import shared module
Import-Module (Join-Path $PSScriptRoot "android-common.psm1") -Force

# Initialize logging
$logFile = Initialize-AndroidLog -ScriptName "android-quick-build"
Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
Write-AndroidLog ""

# Load configuration
$config = Get-AndroidConfig

Write-AndroidLog "=== Android Quick Build ===" -ForegroundColor Cyan
Write-AndroidLog ""

# Configuration
$BuildType = if ($Release) { "Release" } else { "Debug" }
$BuildVariant = if ($Release) { $config.buildVariants.release } else { $config.buildVariants.debug }
$ApkPath = if ($Release) { $config.paths.apk.release } else { $config.paths.apk.debug }

Write-AndroidLog "Build Configuration:" -ForegroundColor Yellow
Write-AndroidLog "  App: $($config.appName)" -ForegroundColor Gray
Write-AndroidLog "  Package: $($config.packageName)" -ForegroundColor Gray
Write-AndroidLog "  Type: $BuildType" -ForegroundColor Gray
Write-AndroidLog "  Skip Tests: $SkipTests" -ForegroundColor Gray
Write-AndroidLog "  Skip Install: $SkipInstall" -ForegroundColor Gray
Write-AndroidLog ""

# Check prerequisites
Write-AndroidLog "Checking prerequisites..." -ForegroundColor Gray
$hasNpm = Test-AndroidPrerequisites -RequireNpm
if (-not $hasNpm) {
    exit 1
}

if (-not $SkipInstall) {
    $hasAdb = Test-AndroidPrerequisites -RequireAdb
    if (-not $hasAdb) {
        Write-AndroidLog ""
        Write-AndroidLog "Warning: ADB not found. Will skip installation." -ForegroundColor Yellow
        $SkipInstall = $true
    }
}
Write-AndroidLog ""

# Step 1: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-AndroidLog "[1/5] Running tests..." -ForegroundColor Yellow
    npm run test:run 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host
    if ($LASTEXITCODE -ne 0) {
        Write-AndroidLog "Tests failed! Use -SkipTests to skip." -ForegroundColor Red
        exit 1
    }
    Write-AndroidLog "[OK] Tests passed" -ForegroundColor Green
    Write-AndroidLog ""
} else {
    Write-AndroidLog "[1/5] Skipping tests" -ForegroundColor Yellow
    Write-AndroidLog ""
}

# Step 2: Build web app
Write-AndroidLog "[2/5] Building web app..." -ForegroundColor Yellow
npm run build 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host
if ($LASTEXITCODE -ne 0) {
    Write-AndroidLog "Build failed!" -ForegroundColor Red
    exit 1
}
Write-AndroidLog "[OK] Web build completed" -ForegroundColor Green
Write-AndroidLog ""

# Step 3: Sync Capacitor
Write-AndroidLog "[3/5] Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host
if ($LASTEXITCODE -ne 0) {
    Write-AndroidLog "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-AndroidLog "[OK] Capacitor sync completed" -ForegroundColor Green
Write-AndroidLog ""

# Step 4: Build Android APK with Gradle
Write-AndroidLog "[4/5] Building Android APK ($BuildType)..." -ForegroundColor Yellow
Write-AndroidLog "  Using Gradle CLI (no Android Studio required)" -ForegroundColor Gray
Write-AndroidLog ""

# Navigate to android directory and run Gradle
Push-Location $config.paths.androidDir
try {
    $gradleCmd = if ($IsWindows -or $env:OS -eq "Windows_NT") {
        Join-Path "." $config.paths.gradleWrapper
    } else {
        Join-Path "." $config.paths.gradleWrapperUnix
    }

    & $gradleCmd $BuildVariant 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host

    if ($LASTEXITCODE -ne 0) {
        Write-AndroidLog "Gradle build failed!" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-AndroidLog "[OK] APK build completed" -ForegroundColor Green
Write-AndroidLog ""

# Verify APK exists
if (-not (Test-Path $ApkPath)) {
    Write-AndroidLog "APK not found at: $ApkPath" -ForegroundColor Red
    exit 1
}

$ApkSizeMB = [math]::Round((Get-Item $ApkPath).Length / 1MB, 2)
Write-AndroidLog "[OK] APK created: $ApkPath (Size: $ApkSizeMB MB)" -ForegroundColor Green
Write-AndroidLog ""

# Step 5: Install on device
if ($SkipInstall) {
    Write-AndroidLog "[5/5] Skipping installation" -ForegroundColor Yellow
    Write-AndroidLog ""
    Write-AndroidLog "=== Build Complete ===" -ForegroundColor Green
    Write-AndroidLog "APK Location: $ApkPath" -ForegroundColor Cyan
    Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
    exit 0
}

Write-AndroidLog "[5/5] Installing on device..." -ForegroundColor Yellow
Write-AndroidLog ""

# Get connected devices
$devices = Get-ConnectedDevices -DeviceId $DeviceId
if (-not $devices) {
    Write-AndroidLog "=== Build Complete (Installation Skipped) ===" -ForegroundColor Yellow
    Write-AndroidLog "APK Location: $ApkPath" -ForegroundColor Cyan
    Write-AndroidLog ""
    Write-AndroidLog "To install manually:" -ForegroundColor Gray
    Write-AndroidLog "  1. Connect device via USB or start emulator" -ForegroundColor Gray
    Write-AndroidLog "  2. Run: adb install -r $ApkPath" -ForegroundColor Gray
    Write-AndroidLog ""
    Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
    exit 0
}

# Select target device
$targetDevice = Select-TargetDevice -Devices $devices -DeviceId $DeviceId
if (-not $targetDevice) {
    Write-AndroidLog "Device selection failed" -ForegroundColor Red
    exit 1
}
Write-AndroidLog ""

# Validate device connection
Write-AndroidLog "Testing device connection..." -ForegroundColor Gray
if (-not (Test-DeviceConnection -DeviceId $targetDevice.Id)) {
    Write-AndroidLog "Error: Device not responsive" -ForegroundColor Red
    exit 1
}
Write-AndroidLog "[OK] Device connection verified" -ForegroundColor Green
Write-AndroidLog ""

# Install APK
Write-AndroidLog "Installing APK..." -ForegroundColor Gray
adb -s $targetDevice.Id install -r $ApkPath 2>&1 | Tee-Object -FilePath $logFile -Append | Write-Host

if ($LASTEXITCODE -ne 0) {
    Write-AndroidLog "Installation failed!" -ForegroundColor Red
    Write-AndroidLog "Try manual installation: adb -s $($targetDevice.Id) install -r $ApkPath" -ForegroundColor Yellow
    exit 1
}

Write-AndroidLog "[OK] Installation completed" -ForegroundColor Green
Write-AndroidLog ""

# Success summary
Write-AndroidLog "=== Build & Install Complete ===" -ForegroundColor Green
Write-AndroidLog "APK: $ApkPath ($ApkSizeMB MB)" -ForegroundColor Cyan
Write-AndroidLog "Device: $($targetDevice.Id) ($($targetDevice.Manufacturer) $($targetDevice.Model))" -ForegroundColor Cyan
Write-AndroidLog ""

Write-AndroidLog "To launch the app:" -ForegroundColor Gray
Write-AndroidLog "  adb -s $($targetDevice.Id) shell monkey -p $($config.packageName) 1" -ForegroundColor DarkGray
Write-AndroidLog ""

Write-AndroidLog "Quick commands:" -ForegroundColor Gray
Write-AndroidLog "  Logs: .\scripts\android\android-log-watch.ps1 -DeviceId $($targetDevice.Id)" -ForegroundColor DarkGray
Write-AndroidLog "  Tests: .\scripts\android\android-test-device.ps1 -DeviceId $($targetDevice.Id)" -ForegroundColor DarkGray
Write-AndroidLog "  Uninstall: adb -s $($targetDevice.Id) uninstall $($config.packageName)" -ForegroundColor DarkGray
Write-AndroidLog ""

Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
