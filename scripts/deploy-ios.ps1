<#
.SYNOPSIS
Deploys Clinical Toolkit iOS app using Capacitor and Xcode

.DESCRIPTION
Runs pre-deployment checks (typecheck, lint, tests, coverage), builds web app,
syncs with Capacitor, and builds iOS app/archive using xcodebuild (macOS only).
On Windows, prepares the project for transfer to macOS.

.PARAMETER BuildType
Build variant: debug, release, or archive (for App Store).
Default: archive
Note: Only available on macOS

.PARAMETER Simulator
Build for iOS Simulator instead of device (macOS only)

.PARAMETER SkipTests
Skip running tests for faster builds

.PARAMETER SkipLint
Skip linting for faster builds

.PARAMETER ExportMethod
Export method for IPA: app-store, ad-hoc, development, or enterprise
Default: app-store
Note: Only used with -BuildType archive

.EXAMPLE
.\deploy-ios.ps1
Prepares iOS project (Windows) or builds archive (macOS)

.EXAMPLE
.\deploy-ios.ps1 -BuildType archive -SkipTests
Builds archive for App Store without running tests (macOS)

.EXAMPLE
.\deploy-ios.ps1 -BuildType debug -Simulator
Builds for iOS Simulator (macOS)

.NOTES
Requires (macOS): Xcode, Xcode Command Line Tools
Requires (All): Node.js, npm
Build time: 5-15 minutes (macOS), 2-5 minutes (Windows prep)

macOS Setup:
  - Install Xcode from Mac App Store
  - Install Command Line Tools: xcode-select --install
  - Configure signing: Xcode > Preferences > Accounts

Windows: Project will be prepared for transfer to macOS for building

Code Signing (macOS):
  - Automatic signing: Xcode manages certificates
  - Manual signing: Configure in Xcode project settings
  - Get identity: security find-identity -v -p codesigning
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("debug", "release", "archive")]
    [string]$BuildType = "archive",

    [Parameter(Mandatory = $false)]
    [switch]$Simulator,

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLint,

    [Parameter(Mandatory = $false)]
    [ValidateSet("app-store", "ad-hoc", "development", "enterprise")]
    [string]$ExportMethod = "app-store"
)

# Import shared deployment module
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$commonModulePath = Join-Path (Split-Path (Split-Path $scriptPath -Parent) -Parent) "scripts\deployment-common.psm1"
Import-Module $commonModulePath -Force

# Initialize logging
$logFile = Initialize-DeploymentLog -ScriptName "deploy-ios-clinicaltoolkit"
Write-DeploymentLog "Log file: $logFile" -Level Debug
Write-DeploymentLog "" -Level Info

# Detect platform
$isMacOS = $IsMacOS -or ($PSVersionTable.Platform -eq "Unix" -and (uname) -eq "Darwin")

# Display header
Write-DeploymentLog "=== Clinical Toolkit - iOS Deployment ===" -Level Info
Write-DeploymentLog "Platform: $(if ($isMacOS) { 'macOS' } else { 'Windows' })" -Level Info
if ($isMacOS) {
    Write-DeploymentLog "Build Type: $BuildType" -Level Info
    if ($Simulator) {
        Write-DeploymentLog "Target: iOS Simulator" -Level Info
    }
} else {
    Write-DeploymentLog "Mode: Project preparation (build requires macOS)" -Level Warning
}
Write-DeploymentLog "" -Level Info

# Load configuration
$appConfig = Get-AppConfig -AppName "ClinicalToolkit"
$appPath = Join-Path (Split-Path $scriptPath -Parent) ""

# Calculate step count
$stepCount = 7  # Base: typecheck, lint, tests, coverage, platform check, web build, capacitor sync
if ($SkipLint) { $stepCount-- }
if ($SkipTests) { $stepCount -= 2 }  # Tests and coverage
if ($isMacOS) { $stepCount++ }  # Add xcodebuild step
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

# Step 5: Check/add iOS platform
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Checking iOS platform..." -Level Info
Set-Location $appPath
$iosPath = Join-Path $appPath "ios"

if (-not (Test-Path $iosPath)) {
    Write-DeploymentLog "iOS platform not found, adding..." -Level Info
    npx cap add ios
    if ($LASTEXITCODE -ne 0) {
        Write-DeploymentLog "Failed to add iOS platform" -Level Error
        exit 1
    }
    Write-DeploymentLog "iOS platform added" -Level Success
} else {
    Write-DeploymentLog "iOS platform found" -Level Success
}
Write-DeploymentLog "" -Level Info

# Step 6: Build web app
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Building web application..." -Level Info
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Web build failed" -Level Error
    exit 1
}
Write-DeploymentLog "Web build completed" -Level Success
Write-DeploymentLog "" -Level Info

# Step 7: Sync Capacitor
$currentStep++
Write-DeploymentLog "[$currentStep/$stepCount] Syncing Capacitor to iOS..." -Level Info
npx cap sync ios
if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Capacitor sync failed" -Level Error
    Write-DeploymentLog "Run 'npx cap doctor' to diagnose issues" -Level Info
    exit 1
}
Write-DeploymentLog "Capacitor sync completed" -Level Success
Write-DeploymentLog "" -Level Info

# Step 8: Build with Xcode (macOS only)
if ($isMacOS) {
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Building iOS app with xcodebuild..." -Level Info
    Write-DeploymentLog "Note: This may take several minutes..." -Level Info

    # Find workspace
    $workspacePath = Join-Path $iosPath "App\App.xcworkspace"
    if (-not (Test-Path $workspacePath)) {
        Write-DeploymentLog "Error: Xcode workspace not found at $workspacePath" -Level Error
        exit 1
    }

    $scheme = "App"
    $configuration = if ($BuildType -eq "debug") { "Debug" } else { "Release" }

    if ($Simulator) {
        # Build for simulator
        Write-DeploymentLog "Building for iOS Simulator..." -Level Info
        xcodebuild -workspace $workspacePath `
            -scheme $scheme `
            -configuration $configuration `
            -sdk iphonesimulator `
            -derivedDataPath "build"

        if ($LASTEXITCODE -eq 0) {
            Write-DeploymentLog "Simulator build completed" -Level Success
            $appPath = "build/Build/Products/$configuration-iphonesimulator/App.app"
            if (Test-Path $appPath) {
                Write-DeploymentLog "App bundle: $appPath" -Level Info
            }
        } else {
            Write-DeploymentLog "Simulator build failed with exit code $LASTEXITCODE" -Level Error
            exit 1
        }

    } elseif ($BuildType -eq "archive") {
        # Create archive for App Store
        Write-DeploymentLog "Creating archive for App Store..." -Level Info
        $archivePath = "build/App.xcarchive"

        xcodebuild -workspace $workspacePath `
            -scheme $scheme `
            -configuration Release `
            archive `
            -archivePath $archivePath

        if ($LASTEXITCODE -ne 0) {
            Write-DeploymentLog "Archive creation failed with exit code $LASTEXITCODE" -Level Error
            exit 1
        }

        Write-DeploymentLog "Archive created successfully" -Level Success

        # Export IPA
        Write-DeploymentLog "Exporting IPA..." -Level Info

        # Create ExportOptions.plist
        $exportPlistPath = "build/ExportOptions.plist"
        $exportPlistContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$ExportMethod</string>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <true/>
</dict>
</plist>
"@
        $exportPlistContent | Out-File -FilePath $exportPlistPath -Encoding UTF8

        $exportPath = "build"
        xcodebuild -exportArchive `
            -archivePath $archivePath `
            -exportPath $exportPath `
            -exportOptionsPlist $exportPlistPath

        if ($LASTEXITCODE -eq 0) {
            Write-DeploymentLog "IPA exported successfully" -Level Success
            $ipaPath = Join-Path $exportPath "App.ipa"
            if (Test-Path $ipaPath) {
                $ipaSize = [math]::Round((Get-Item $ipaPath).Length / 1MB, 2)
                Write-DeploymentLog "IPA: $ipaPath ($ipaSize MB)" -Level Info
            }
        } else {
            Write-DeploymentLog "IPA export failed with exit code $LASTEXITCODE" -Level Error
            Write-DeploymentLog "Check signing configuration in Xcode" -Level Info
            exit 1
        }

    } else {
        # Regular build (debug or release)
        Write-DeploymentLog "Building for device ($configuration)..." -Level Info
        xcodebuild -workspace $workspacePath `
            -scheme $scheme `
            -configuration $configuration `
            -sdk iphoneos `
            -derivedDataPath "build"

        if ($LASTEXITCODE -eq 0) {
            Write-DeploymentLog "Device build completed" -Level Success
            $appPath = "build/Build/Products/$configuration-iphoneos/App.app"
            if (Test-Path $appPath) {
                Write-DeploymentLog "App bundle: $appPath" -Level Info
            }
        } else {
            Write-DeploymentLog "Device build failed with exit code $LASTEXITCODE" -Level Error
            exit 1
        }
    }

    Write-DeploymentLog "" -Level Info

} else {
    # Windows - project prepared, provide next steps
    Write-DeploymentLog "iOS project prepared for macOS build" -Level Success
    Write-DeploymentLog "" -Level Info
    Write-DeploymentLog "To build on macOS:" -Level Info
    Write-DeploymentLog "  1. Transfer project to Mac" -Level Info
    Write-DeploymentLog "  2. cd clinical-toolkit" -Level Info
    Write-DeploymentLog "  3. Run: .\scripts\deploy-ios.ps1 -BuildType archive" -Level Info
    Write-DeploymentLog "" -Level Info
}

# Display completion message
Write-DeploymentLog "=== iOS Build Complete ===" -Level Success
Write-DeploymentLog "" -Level Info

# Next steps
if ($isMacOS) {
    if ($BuildType -eq "archive") {
        Write-DeploymentLog "Next steps:" -Level Info
        Write-DeploymentLog "  - Upload to App Store Connect: xcrun altool --upload-app..." -Level Info
        Write-DeploymentLog "  - Or use Xcode: Window > Organizer > Archives" -Level Info
    } elseif ($Simulator) {
        Write-DeploymentLog "To run in simulator:" -Level Info
        Write-DeploymentLog "  xcrun simctl install booted build/Build/Products/*-iphonesimulator/App.app" -Level Info
    } else {
        Write-DeploymentLog "To install on device:" -Level Info
        Write-DeploymentLog "  Connect device and use Xcode" -Level Info
    }
} else {
    Write-DeploymentLog "Project ready for macOS transfer" -Level Info
}

Write-DeploymentLog "" -Level Info
