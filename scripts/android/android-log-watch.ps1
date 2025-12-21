# Android Log Watch - Real-Time Log Monitoring
# Monitors Android device logs with filtering for the app
#
# Usage:
#   .\scripts\android\android-log-watch.ps1                    # Auto-detect device, React Native logs
#   .\scripts\android\android-log-watch.ps1 -DeviceId <id>     # Specific device
#   .\scripts\android\android-log-watch.ps1 -Filter "MyTag:V"  # Custom logcat filter
#   .\scripts\android\android-log-watch.ps1 -All               # Show all logs (no filtering)
#   .\scripts\android\android-log-watch.ps1 -Clear             # Clear logs before watching

param(
    [string]$DeviceId,
    [string]$Filter,
    [switch]$All,
    [switch]$Clear
)

$ErrorActionPreference = "Stop"

# Import shared module
Import-Module (Join-Path $PSScriptRoot "android-common.psm1") -Force

# Initialize logging
$logFile = Initialize-AndroidLog -ScriptName "android-log-watch"
Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
Write-AndroidLog ""

# Load configuration
$config = Get-AndroidConfig

Write-AndroidLog "=== Android Log Watch ===" -ForegroundColor Cyan
Write-AndroidLog ""

# Check prerequisites
Write-AndroidLog "Checking prerequisites..." -ForegroundColor Gray
if (-not (Test-AndroidPrerequisites -RequireAdb)) {
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
Write-AndroidLog "Device: $($targetDevice.Model) (Android $($targetDevice.AndroidVersion))" -ForegroundColor Gray
Write-AndroidLog ""

# Check if app is installed
$appInstalled = Test-AppInstalled -DeviceId $targetDevice.Id -PackageName $config.packageName

if ($appInstalled) {
    Write-AndroidLog "App Status: Installed" -ForegroundColor Green

    # Get app version
    $version = Get-AppVersion -DeviceId $targetDevice.Id -PackageName $config.packageName
    if ($version) {
        Write-AndroidLog "Version: $version" -ForegroundColor Gray
    }
} else {
    Write-AndroidLog "App Status: Not Installed" -ForegroundColor Yellow
    Write-AndroidLog "Run android-quick-build.ps1 to install the app" -ForegroundColor Gray
}
Write-AndroidLog ""

# Clear logs if requested
if ($Clear) {
    Write-AndroidLog "Clearing existing logs..." -ForegroundColor Yellow
    adb -s $targetDevice.Id logcat -c 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-AndroidLog "[OK] Logs cleared" -ForegroundColor Green
    }
    Write-AndroidLog ""
}

# Determine filter
$logcatFilter = if ($All) {
    ""
} elseif ($Filter) {
    $Filter
} else {
    $config.logcat.defaultFilter
}

Write-AndroidLog "Log Configuration:" -ForegroundColor Yellow
if ($All) {
    Write-AndroidLog "  Filter: None (showing all logs)" -ForegroundColor Gray
} else {
    Write-AndroidLog "  Filter: $logcatFilter" -ForegroundColor Gray
}
Write-AndroidLog "  Package: $($config.packageName)" -ForegroundColor Gray
Write-AndroidLog "  Press Ctrl+C to stop" -ForegroundColor Gray
Write-AndroidLog ""

Write-AndroidLog "=== Watching Logs ===" -ForegroundColor Green
Write-AndroidLog ""

# Display quick filter examples
Write-AndroidLog "Quick filter examples:" -ForegroundColor DarkGray
Write-AndroidLog "  ReactNativeJS only: -Filter 'ReactNativeJS:V *:S'" -ForegroundColor DarkGray
Write-AndroidLog "  All app logs: -Filter '$($config.packageName):V *:S'" -ForegroundColor DarkGray
Write-AndroidLog "  Errors only: -Filter '*:E'" -ForegroundColor DarkGray
Write-AndroidLog "  Warnings+: -Filter '*:W'" -ForegroundColor DarkGray
Write-AndroidLog "  All logs: -All" -ForegroundColor DarkGray
Write-AndroidLog ""

# Start log monitoring with color coding (SECURITY FIX: Use & instead of Invoke-Expression)
try {
    if ($All) {
        # No filter - show all logs
        adb -s $targetDevice.Id logcat 2>&1 | ForEach-Object {
            $line = $_
            # Write to log file
            $line | Out-File -FilePath $logFile -Append -Encoding utf8

            # Color-code console output
            if ($line -match '\bE\b' -or $line -match 'ERROR') {
                Write-Host $line -ForegroundColor Red
            } elseif ($line -match '\bW\b' -or $line -match 'WARN') {
                Write-Host $line -ForegroundColor Yellow
            } elseif ($line -match '\bI\b' -or $line -match 'INFO') {
                Write-Host $line -ForegroundColor White
            } elseif ($line -match '\bD\b' -or $line -match 'DEBUG') {
                Write-Host $line -ForegroundColor Gray
            } else {
                Write-Host $line
            }
        }
    } else {
        # With filter
        $filterArgs = $logcatFilter -split ' '
        & adb -s $targetDevice.Id logcat @filterArgs 2>&1 | ForEach-Object {
            $line = $_
            # Write to log file
            $line | Out-File -FilePath $logFile -Append -Encoding utf8

            # Color-code console output
            if ($line -match '\bE\b' -or $line -match 'ERROR') {
                Write-Host $line -ForegroundColor Red
            } elseif ($line -match '\bW\b' -or $line -match 'WARN') {
                Write-Host $line -ForegroundColor Yellow
            } elseif ($line -match '\bI\b' -or $line -match 'INFO') {
                Write-Host $line -ForegroundColor White
            } elseif ($line -match '\bD\b' -or $line -match 'DEBUG') {
                Write-Host $line -ForegroundColor Gray
            } else {
                Write-Host $line
            }
        }
    }
} catch {
    Write-AndroidLog ""
    Write-AndroidLog "Log monitoring stopped" -ForegroundColor Yellow
}

Write-AndroidLog ""
Write-AndroidLog "=== Log Watch Ended ===" -ForegroundColor Cyan
Write-AndroidLog "Log file: $logFile" -ForegroundColor DarkGray
