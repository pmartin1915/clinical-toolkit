<#
.SYNOPSIS
Deploys Clinical Toolkit Android app using Capacitor and Gradle

.DESCRIPTION
Runs pre-deployment checks (typecheck, lint, tests, coverage), builds web app,
syncs with Capacitor, and builds Android APK/AAB using Gradle automation.

.PARAMETER BuildType
Build variant: debug (unsigned, for testing) or release (signed, for distribution).
Default: debug
Note: Release builds require signing configuration in android/app/build.gradle

.PARAMETER Bundle
Build AAB (Android App Bundle) instead of APK. Required for Play Store.

.PARAMETER SkipTests
Skip running tests for faster builds

.PARAMETER SkipLint
Skip linting for faster builds

.PARAMETER Install
Install APK on connected device via ADB after successful build
(Only works with APK, not AAB)

.EXAMPLE
.\deploy-android.ps1
Runs all checks and builds debug APK

.EXAMPLE
.\deploy-android.ps1 -BuildType debug -SkipTests
Builds debug APK without running tests

.EXAMPLE
.\deploy-android.ps1 -BuildType release -Bundle
Builds release AAB for Play Store (requires signing setup)

.EXAMPLE
.\deploy-android.ps1 -BuildType debug -Install
Builds debug APK and installs on connected device

.NOTES
Requires: Node.js, Android SDK, Gradle
Environment: ANDROID_HOME must be set
Build time: 3-10 minutes
Outputs:
  - Debug APK: android/app/build/outputs/apk/debug/app-debug.apk
  - Release APK: android/app/build/outputs/apk/release/app-release.apk
  - Release AAB: android/app/build/outputs/bundle/release/app-release.aab

Release Build Signing:
Configure signing in android/app/build.gradle:
  android {
      signingConfigs {
          release {
              storeFile file("path/to/keystore.jks")
              storePassword "password"
              keyAlias "alias"
              keyPassword "password"
          }
      }
      buildTypes {
          release {
              signingConfig signingConfigs.release
          }
      }
  }
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "debug",

    [Parameter(Mandatory = $false)]
    [switch]$Bundle,

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLint,

    [Parameter(Mandatory = $false)]
    [switch]$Install
)

# Import shared deployment module
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$commonModulePath = Join-Path (Split-Path (Split-Path $scriptPath -Parent) -Parent) "scripts\deployment-common.psm1"
Import-Module $commonModulePath -Force

# Initialize logging
$logFile = Initialize-DeploymentLog -ScriptName "deploy-android-clinicaltoolkit"
Write-DeploymentLog "Log file: $logFile" -Level Debug
Write-DeploymentLog "" -Level Info

# Display header
Write-DeploymentLog "=== Clinical Toolkit - Android Deployment ===" -Level Info
Write-DeploymentLog "Build Type: $BuildType" -Level Info
if ($Bundle) {
    Write-DeploymentLog "Output: AAB (Android App Bundle)" -Level Info
} else {
    Write-DeploymentLog "Output: APK" -Level Info
}
Write-DeploymentLog "" -Level Info

# Validate install parameter
if ($Install -and $Bundle) {
    Write-DeploymentLog "Warning: Cannot install AAB files directly. Use APK for installation." -Level Warning
    Write-DeploymentLog "Disabling -Install flag." -Level Warning
    $Install = $false
    Write-DeploymentLog "" -Level Info
}

# Load configuration
$appConfig = Get-AppConfig -AppName "ClinicalToolkit"
$appPath = Join-Path (Split-Path $scriptPath -Parent) ""

# Calculate step count
$stepCount = 7  # Base: typecheck, lint, tests, coverage, web build, capacitor sync, gradle build
if ($SkipLint) { $stepCount-- }
if ($SkipTests) { $stepCount -= 2 }  # Tests and coverage
if ($Install) { $stepCount++ }
$currentStep = 0

# Step 1: Type checking
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Running type check..." -Level Info
$typecheckPassed = Test-TypeScript -AppName "ClinicalToolkit"
if (-not $typecheckPassed) {
    exit 1
}
Write-DeploymentLog "" -Level Info

# Step 2: Linting
if (-not $SkipLint) {
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Running linter..." -Level Info
    $lintPassed = Test-Linter -AppName "ClinicalToolkit"
    if (-not $lintPassed) {
        Write-DeploymentLog "Hint: Run 'npm run lint:fix' to auto-fix issues" -Level Info
        exit 1
    }
    Write-DeploymentLog "" -Level Info
}

# Step 3: Tests
if (-not $SkipTests) {
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Running tests..." -Level Info
    $testsPassed = Test-AppTests -AppName "ClinicalToolkit"
    if (-not $testsPassed) {
        exit 1
    }
    Write-DeploymentLog "" -Level Info

    # Step 4: Coverage
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Running coverage check..." -Level Info
    $coveragePassed = Test-Coverage -AppName "ClinicalToolkit"
    if (-not $coveragePassed) {
        exit 1
    }
    Write-DeploymentLog "" -Level Info
}

# Step 5: Build web app
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Building web application..." -Level Info
Set-Location $appPath
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Web build failed" -Level Error
    exit 1
}
Write-DeploymentLog "Web build completed" -Level Success
Write-DeploymentLog "" -Level Info

# Step 6: Sync Capacitor
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Syncing Capacitor to Android..." -Level Info
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Capacitor sync failed" -Level Error
    Write-DeploymentLog "Run 'npx cap doctor' to diagnose issues" -Level Info
    exit 1
}
Write-DeploymentLog "Capacitor sync completed" -Level Success
Write-DeploymentLog "" -Level Info

# Step 7: Build with Gradle
$currentStep++

# Determine Gradle task
if ($Bundle) {
    $gradleTask = "bundle" + (Get-Culture).TextInfo.ToTitleCase($BuildType)
    $outputType = "AAB"
} else {
    $gradleTask = "assemble" + (Get-Culture).TextInfo.ToTitleCase($BuildType)
    $outputType = "APK"
}

Write-DeploymentLog "[$currentStep/$stepCount] Building Android $outputType ($BuildType)..." -Level Info
Write-DeploymentLog "Gradle task: $gradleTask" -Level Debug
Write-DeploymentLog "Note: This may take several minutes..." -Level Info

# Determine Gradle wrapper command based on platform
$androidPath = Join-Path $appPath "android"
if (-not (Test-Path $androidPath)) {
    Write-DeploymentLog "Error: android/ directory not found" -Level Error
    Write-DeploymentLog "Run 'npx cap add android' first" -Level Info
    exit 1
}

$gradlewCmd = if ($IsWindows) { ".\gradlew.bat" } else { "./gradlew" }
$gradlewPath = Join-Path $androidPath $gradlewCmd

if (-not (Test-Path $gradlewPath)) {
    Write-DeploymentLog "Error: Gradle wrapper not found at $gradlewPath" -Level Error
    exit 1
}

# Execute Gradle build
Set-Location $androidPath
& $gradlewCmd $gradleTask

if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Gradle build failed with exit code $LASTEXITCODE" -Level Error
    exit 1
}

Write-DeploymentLog "Gradle build completed" -Level Success
Write-DeploymentLog "" -Level Info

# Locate build artifacts
$buildOutputPath = Join-Path $androidPath "app\build\outputs"
$artifactPath = $null
$artifactSize = 0

if ($Bundle) {
    # AAB location
    $aabPath = Join-Path $buildOutputPath "bundle\$BuildType\app-$BuildType.aab"
    if (Test-Path $aabPath) {
        $artifactPath = $aabPath
        $artifactSize = [math]::Round((Get-Item $aabPath).Length / 1MB, 2)
        Write-DeploymentLog "AAB created: $aabPath ($artifactSize MB)" -Level Success
    } else {
        Write-DeploymentLog "Warning: AAB not found at expected location" -Level Warning
        Write-DeploymentLog "Check: $buildOutputPath\bundle\" -Level Info
    }
} else {
    # APK location
    $apkPath = Join-Path $buildOutputPath "apk\$BuildType\app-$BuildType.apk"
    if (Test-Path $apkPath) {
        $artifactPath = $apkPath
        $artifactSize = [math]::Round((Get-Item $apkPath).Length / 1MB, 2)
        Write-DeploymentLog "APK created: $apkPath ($artifactSize MB)" -Level Success
    } else {
        Write-DeploymentLog "Warning: APK not found at expected location" -Level Warning
        Write-DeploymentLog "Check: $buildOutputPath\apk\" -Level Info
    }
}

Write-DeploymentLog "" -Level Info

# Step 8: Install on device (if requested and APK)
if ($Install -and $artifactPath -and -not $Bundle) {
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Installing on connected device..." -Level Info

    # Check if adb is available
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if (-not $adb) {
        Write-DeploymentLog "Error: adb not found in PATH" -Level Error
        Write-DeploymentLog "Add Android SDK platform-tools to PATH" -Level Info
        Write-DeploymentLog "Location: %ANDROID_HOME%\platform-tools" -Level Info
        exit 1
    }

    # Check for connected devices
    Write-DeploymentLog "Checking for connected devices..." -Level Info
    $devices = adb devices
    $deviceLines = $devices -split "`n" | Where-Object { $_ -match "\tdevice$" }

    if ($deviceLines.Count -eq 0) {
        Write-DeploymentLog "Error: No devices connected" -Level Error
        Write-DeploymentLog "Connect a device and enable USB debugging" -Level Info
        exit 1
    }

    Write-DeploymentLog "Found $($deviceLines.Count) connected device(s)" -Level Success

    # Install APK
    Write-DeploymentLog "Installing APK..." -Level Info
    adb install -r $artifactPath

    if ($LASTEXITCODE -eq 0) {
        Write-DeploymentLog "APK installed successfully" -Level Success
    } else {
        Write-DeploymentLog "Installation failed with exit code $LASTEXITCODE" -Level Error
        exit 1
    }

    Write-DeploymentLog "" -Level Info
}

# Display completion message
Write-DeploymentLog "=== Android Build Complete ===" -Level Success
Write-DeploymentLog "" -Level Info

# Next steps
if ($artifactPath) {
    Write-DeploymentLog "Build artifact: $artifactPath" -Level Info
    Write-DeploymentLog "Size: $artifactSize MB" -Level Info
    Write-DeploymentLog "" -Level Info
}

if ($BuildType -eq "release") {
    if ($Bundle) {
        Write-DeploymentLog "Next steps:" -Level Info
        Write-DeploymentLog "  - Upload to Play Console: https://play.google.com/console" -Level Info
        Write-DeploymentLog "  - Use bundletool for testing: bundletool build-apks --bundle=app-release.aab" -Level Info
    } else {
        Write-DeploymentLog "Next steps:" -Level Info
        Write-DeploymentLog "  - Distribute APK for testing" -Level Info
        Write-DeploymentLog "  - Or build AAB for Play Store: .\deploy-android.ps1 -BuildType release -Bundle" -Level Info
    }
} else {
    Write-DeploymentLog "Debug build - ready for testing" -Level Info
    if (-not $Install) {
        Write-DeploymentLog "To install: .\deploy-android.ps1 -BuildType debug -Install" -Level Info
    }
}

Write-DeploymentLog "" -Level Info
