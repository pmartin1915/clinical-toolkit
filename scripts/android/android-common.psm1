# Android Common Functions Module
# Shared functions for Android automation scripts

# Module variables
$script:ConfigPath = Join-Path $PSScriptRoot "android-config.json"
$script:Config = $null
$script:LogFile = $null

<#
.SYNOPSIS
Gets the Android configuration from android-config.json

.DESCRIPTION
Reads and caches the configuration file for Android automation scripts

.OUTPUTS
PSCustomObject containing configuration settings
#>
function Get-AndroidConfig {
    if ($null -eq $script:Config) {
        if (-not (Test-Path $script:ConfigPath)) {
            throw "Configuration file not found: $script:ConfigPath"
        }
        $script:Config = Get-Content $script:ConfigPath -Raw | ConvertFrom-Json
    }
    return $script:Config
}

<#
.SYNOPSIS
Initializes logging for Android scripts

.DESCRIPTION
Creates a timestamped log file in the logs directory

.PARAMETER ScriptName
Name of the calling script (e.g., "android-quick-build")

.OUTPUTS
String path to the created log file
#>
function Initialize-AndroidLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptName
    )

    $config = Get-AndroidConfig
    $logsDir = Join-Path (Split-Path $PSScriptRoot -Parent) "logs"

    # Create logs directory if it doesn't exist
    if (-not (Test-Path $logsDir)) {
        New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
    }

    # Create timestamped log file
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $script:LogFile = Join-Path $logsDir "$ScriptName-$timestamp.log"

    # Write initial log entry
    $header = @"
=============================================================================
$($config.appName) - $ScriptName
Started: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
=============================================================================

"@
    $header | Out-File -FilePath $script:LogFile -Encoding utf8

    return $script:LogFile
}

<#
.SYNOPSIS
Writes output to both console and log file

.DESCRIPTION
Outputs messages to the console with color and simultaneously writes to log file

.PARAMETER Message
The message to write

.PARAMETER ForegroundColor
Console color for the message (optional)

.PARAMETER NoNewline
Suppress newline after message (optional)
#>
function Write-AndroidLog {
    param(
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [AllowEmptyString()]
        [string]$Message,

        [Parameter(Mandatory = $false)]
        [System.ConsoleColor]$ForegroundColor,

        [switch]$NoNewline
    )

    # Write to console
    $writeParams = @{
        Object = $Message
    }
    if ($ForegroundColor) {
        $writeParams['ForegroundColor'] = $ForegroundColor
    }
    if ($NoNewline) {
        $writeParams['NoNewline'] = $true
    }
    Write-Host @writeParams

    # Write to log file (without color codes)
    if ($script:LogFile) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        $logMessage = "[$timestamp] $Message"
        if ($NoNewline) {
            $logMessage | Out-File -FilePath $script:LogFile -Append -NoNewline -Encoding utf8
        } else {
            $logMessage | Out-File -FilePath $script:LogFile -Append -Encoding utf8
        }
    }
}

<#
.SYNOPSIS
Tests for required Android development prerequisites

.DESCRIPTION
Checks if required tools are installed (adb, npm, npx, etc.)

.PARAMETER RequireAdb
Whether ADB is required for this operation

.PARAMETER RequireNpm
Whether npm is required for this operation

.OUTPUTS
Boolean - Returns $true if all required prerequisites are met
#>
function Test-AndroidPrerequisites {
    param(
        [switch]$RequireAdb,
        [switch]$RequireNpm
    )

    $allPresent = $true

    if ($RequireAdb) {
        $adbPath = Get-Command adb -ErrorAction SilentlyContinue
        if (-not $adbPath) {
            Write-AndroidLog "Error: adb not found in PATH" -ForegroundColor Red
            Write-AndroidLog "Install Android SDK platform-tools:" -ForegroundColor Gray
            Write-AndroidLog "  - Android Studio: SDK Manager > SDK Tools > Android SDK Platform-Tools" -ForegroundColor Gray
            Write-AndroidLog "  - Standalone: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Gray
            $allPresent = $false
        }
    }

    if ($RequireNpm) {
        $npmPath = Get-Command npm -ErrorAction SilentlyContinue
        if (-not $npmPath) {
            Write-AndroidLog "Error: npm not found in PATH" -ForegroundColor Red
            Write-AndroidLog "Install Node.js from: https://nodejs.org/" -ForegroundColor Gray
            $allPresent = $false
        }

        $npxPath = Get-Command npx -ErrorAction SilentlyContinue
        if (-not $npxPath) {
            Write-AndroidLog "Error: npx not found in PATH" -ForegroundColor Red
            Write-AndroidLog "npx should come with npm. Try reinstalling Node.js" -ForegroundColor Gray
            $allPresent = $false
        }
    }

    return $allPresent
}

<#
.SYNOPSIS
Gets list of connected Android devices

.DESCRIPTION
Uses ADB to detect connected devices and returns device information

.PARAMETER DeviceId
Optional specific device ID to validate

.OUTPUTS
PSCustomObject array containing device information, or $null if no devices found
#>
function Get-ConnectedDevices {
    param(
        [Parameter(Mandatory = $false)]
        [string]$DeviceId
    )

    Write-AndroidLog "Detecting connected devices..." -ForegroundColor Gray

    # Get raw device list from adb
    $devicesOutput = adb devices 2>&1 | Select-Object -Skip 1 | Where-Object { $_ -match '\t' }

    if (-not $devicesOutput) {
        Write-AndroidLog ""
        Write-AndroidLog "No devices connected" -ForegroundColor Yellow
        Write-AndroidLog ""
        Write-AndroidLog "To connect a device:" -ForegroundColor Gray
        Write-AndroidLog "  1. Connect device via USB or start emulator" -ForegroundColor Gray
        Write-AndroidLog "  2. Enable USB debugging (Settings > Developer Options)" -ForegroundColor Gray
        Write-AndroidLog "  3. Authorize computer on device" -ForegroundColor Gray
        Write-AndroidLog ""
        return $null
    }

    # Parse connected devices
    $devices = @()
    foreach ($line in $devicesOutput) {
        if ($line -match '^(\S+)\s+device$') {
            $deviceId = $matches[1]

            # Get device information
            $model = adb -s $deviceId shell getprop ro.product.model 2>$null
            $manufacturer = adb -s $deviceId shell getprop ro.product.manufacturer 2>$null
            $androidVersion = adb -s $deviceId shell getprop ro.build.version.release 2>$null
            $apiLevel = adb -s $deviceId shell getprop ro.build.version.sdk 2>$null

            $devices += [PSCustomObject]@{
                Id = $deviceId
                Model = if ($model) { $model.Trim() } else { "Unknown" }
                Manufacturer = if ($manufacturer) { $manufacturer.Trim() } else { "Unknown" }
                AndroidVersion = if ($androidVersion) { $androidVersion.Trim() } else { "Unknown" }
                ApiLevel = if ($apiLevel) { $apiLevel.Trim() } else { "Unknown" }
            }
        }
    }

    if ($devices.Count -eq 0) {
        Write-AndroidLog ""
        Write-AndroidLog "No devices in 'device' state (check for 'unauthorized' or 'offline')" -ForegroundColor Yellow
        Write-AndroidLog "Run 'adb devices' to see device status" -ForegroundColor Gray
        Write-AndroidLog ""
        return $null
    }

    # If specific device requested, validate it exists
    if ($DeviceId) {
        $device = $devices | Where-Object { $_.Id -eq $DeviceId }
        if (-not $device) {
            Write-AndroidLog ""
            Write-AndroidLog "Error: Device ID not found: $DeviceId" -ForegroundColor Red
            Write-AndroidLog ""
            Write-AndroidLog "Available devices:" -ForegroundColor Gray
            for ($i = 0; $i -lt $devices.Count; $i++) {
                Write-AndroidLog "  [$i] $($devices[$i].Id) - $($devices[$i].Manufacturer) $($devices[$i].Model)" -ForegroundColor Gray
            }
            Write-AndroidLog ""
            return $null
        }
        return @($device)
    }

    return $devices
}

<#
.SYNOPSIS
Selects a target device from available devices

.DESCRIPTION
Displays connected devices and either auto-selects (if only one) or prompts user

.PARAMETER Devices
Array of device objects from Get-ConnectedDevices

.PARAMETER DeviceId
Optional pre-selected device ID

.OUTPUTS
PSCustomObject of the selected device, or $null if selection failed
#>
function Select-TargetDevice {
    param(
        [Parameter(Mandatory = $true)]
        [array]$Devices,

        [Parameter(Mandatory = $false)]
        [string]$DeviceId
    )

    Write-AndroidLog "Connected devices:" -ForegroundColor Green
    for ($i = 0; $i -lt $Devices.Count; $i++) {
        $device = $Devices[$i]
        Write-AndroidLog "  [$i] $($device.Id) - $($device.Manufacturer) $($device.Model) (Android $($device.AndroidVersion))" -ForegroundColor Gray
    }
    Write-AndroidLog ""

    # If DeviceId specified, find and return it
    if ($DeviceId) {
        $targetDevice = $Devices | Where-Object { $_.Id -eq $DeviceId }
        if ($targetDevice) {
            Write-AndroidLog "Using specified device: $($targetDevice.Id)" -ForegroundColor Cyan
            return $targetDevice
        } else {
            Write-AndroidLog "Error: Specified device not found: $DeviceId" -ForegroundColor Red
            return $null
        }
    }

    # Auto-select if only one device
    if ($Devices.Count -eq 1) {
        Write-AndroidLog "Using device: $($Devices[0].Id)" -ForegroundColor Cyan
        return $Devices[0]
    }

    # Multiple devices - use first (could enhance to prompt user)
    Write-AndroidLog "Multiple devices detected. Using first device: $($Devices[0].Id)" -ForegroundColor Cyan
    Write-AndroidLog "To specify a device, use: -DeviceId <DEVICE_ID>" -ForegroundColor Gray
    return $Devices[0]
}

<#
.SYNOPSIS
Checks if an app package is installed on a device

.DESCRIPTION
Uses ADB to check if the specified package is installed

.PARAMETER DeviceId
Device ID to check

.PARAMETER PackageName
Android package name to check for (optional, uses config if not provided)

.OUTPUTS
Boolean - $true if package is installed, $false otherwise
#>
function Test-AppInstalled {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DeviceId,

        [Parameter(Mandatory = $false)]
        [string]$PackageName
    )

    if (-not $PackageName) {
        $config = Get-AndroidConfig
        $PackageName = $config.packageName
    }

    $installed = adb -s $DeviceId shell pm list packages 2>$null | Select-String $PackageName

    return ($null -ne $installed)
}

<#
.SYNOPSIS
Gets the version of an installed app

.DESCRIPTION
Uses ADB to retrieve the app version name from the device

.PARAMETER DeviceId
Device ID to query

.PARAMETER PackageName
Android package name (optional, uses config if not provided)

.OUTPUTS
String - Version name, or $null if not found
#>
function Get-AppVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DeviceId,

        [Parameter(Mandatory = $false)]
        [string]$PackageName
    )

    if (-not $PackageName) {
        $config = Get-AndroidConfig
        $PackageName = $config.packageName
    }

    $versionInfo = adb -s $DeviceId shell dumpsys package $PackageName 2>$null |
                   Select-String "versionName" |
                   Select-Object -First 1

    if ($versionInfo) {
        # Extract version from output like "versionName=1.0.0"
        if ($versionInfo -match 'versionName=(.+)') {
            return $matches[1].Trim()
        }
    }

    return $null
}

<#
.SYNOPSIS
Validates device connection and responsiveness

.DESCRIPTION
Tests if a device is connected and responsive to ADB commands

.PARAMETER DeviceId
Device ID to test

.OUTPUTS
Boolean - $true if device is responsive, $false otherwise
#>
function Test-DeviceConnection {
    param(
        [Parameter(Mandatory = $true)]
        [string]$DeviceId
    )

    $connectionTest = adb -s $DeviceId shell echo "connected" 2>$null
    return ($connectionTest -eq "connected")
}

# Export module functions
Export-ModuleMember -Function @(
    'Get-AndroidConfig',
    'Initialize-AndroidLog',
    'Write-AndroidLog',
    'Test-AndroidPrerequisites',
    'Get-ConnectedDevices',
    'Select-TargetDevice',
    'Test-AppInstalled',
    'Get-AppVersion',
    'Test-DeviceConnection'
)
