<#
.SYNOPSIS
Deploys Clinical Toolkit Desktop app using Tauri

.DESCRIPTION
Runs pre-deployment checks (typecheck, lint, tests, coverage), builds web app,
creates Tauri desktop executable, and optionally signs the binaries.

.PARAMETER BuildType
Build variant: debug (faster, no optimizations) or release (optimized, smaller).
Default: release

.PARAMETER SkipTests
Skip running tests for faster builds

.PARAMETER SkipLint
Skip linting for faster builds

.PARAMETER Sign
Enable code signing for production releases

.PARAMETER SigningIdentity
Code signing certificate/identity:
- Windows: Certificate thumbprint (SHA1 hash)
- macOS: Signing identity name (e.g., "Developer ID Application: Your Name")

.PARAMETER SigningPassword
Password for signing certificate (Windows only, for PFX files)

.EXAMPLE
.\deploy-desktop.ps1
Runs all checks and builds release version (unsigned)

.EXAMPLE
.\deploy-desktop.ps1 -BuildType debug -SkipTests
Builds debug version without running tests

.EXAMPLE
.\deploy-desktop.ps1 -Sign -SigningIdentity "ABC123DEF456"
Builds and signs with specified certificate (Windows)

.NOTES
Requires: Node.js, Rust toolchain, npm
Build time: 5-15 minutes (release), 2-5 minutes (debug)
Output: src-tauri/target/[debug|release]/bundle/

Code Signing Setup:
- Windows: Use signtool.exe (included with Windows SDK)
  Get certificate thumbprint: Get-ChildItem Cert:\CurrentUser\My
  Or use PFX file with -SigningPassword
- macOS: Use codesign (built-in)
  Get identity: security find-identity -v -p codesigning
  For distribution, also notarize: xcrun notarytool
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "release",

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLint,

    [Parameter(Mandatory = $false)]
    [switch]$Sign,

    [Parameter(Mandatory = $false)]
    [string]$SigningIdentity,

    [Parameter(Mandatory = $false)]
    [string]$SigningPassword
)

# Import shared deployment module
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$commonModulePath = Join-Path (Split-Path (Split-Path $scriptPath -Parent) -Parent) "scripts\deployment-common.psm1"
Import-Module $commonModulePath -Force

# Initialize logging
$logFile = Initialize-DeploymentLog -ScriptName "deploy-desktop-clinicaltoolkit"
Write-DeploymentLog "Log file: $logFile" -Level Debug
Write-DeploymentLog "" -Level Info

# Display header
Write-DeploymentLog "=== Clinical Toolkit - Desktop Deployment ===" -Level Info
Write-DeploymentLog "Build Type: $BuildType" -Level Info
if ($Sign) {
    Write-DeploymentLog "Code Signing: Enabled" -Level Info
}
Write-DeploymentLog "" -Level Info

# Validate signing parameters
if ($Sign -and -not $SigningIdentity) {
    Write-DeploymentLog "Error: -Sign requires -SigningIdentity parameter" -Level Error
    Write-DeploymentLog "Windows: Provide certificate thumbprint" -Level Info
    Write-DeploymentLog "macOS: Provide signing identity name" -Level Info
    exit 1
}

# Load configuration
$appConfig = Get-AppConfig -AppName "ClinicalToolkit"
$appPath = Join-Path (Split-Path $scriptPath -Parent) ""

# Calculate step count
$stepCount = 6  # Base: typecheck, lint, tests, coverage, web build, tauri build
if ($SkipLint) { $stepCount-- }
if ($SkipTests) { $stepCount -= 2 }  # Tests and coverage
if ($Sign) { $stepCount++ }
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

# Step 6: Build Tauri desktop app
$currentStep++
$tauriCommand = if ($BuildType -eq "debug") { "tauri:dev" } else { "tauri:build" }
Write-DeploymentLog "[$currentStep/$stepCount] Building Tauri desktop app ($BuildType)..." -Level Info
Write-DeploymentLog "Note: This may take several minutes..." -Level Info

npm run $tauriCommand
if ($LASTEXITCODE -ne 0) {
    Write-DeploymentLog "Tauri build failed" -Level Error
    exit 1
}
Write-DeploymentLog "Tauri build completed" -Level Success
Write-DeploymentLog "" -Level Info

# Locate build artifacts
$bundlePath = "src-tauri/target/$BuildType/bundle"
$artifacts = @()

if (Test-Path $bundlePath) {
    Write-DeploymentLog "Build artifacts:" -Level Info
    $artifacts = Get-ChildItem -Path $bundlePath -Recurse -File | Where-Object {
        $_.Extension -in @('.exe', '.msi', '.dmg', '.app', '.AppImage', '.deb')
    }

    foreach ($artifact in $artifacts) {
        $size = [math]::Round($artifact.Length / 1MB, 2)
        Write-DeploymentLog "  - $($artifact.Name) ($size MB)" -Level Info
    }
    Write-DeploymentLog "" -Level Info
} else {
    Write-DeploymentLog "Warning: Build artifacts not found at $bundlePath" -Level Warning
    Write-DeploymentLog "Check src-tauri/target/$BuildType/" -Level Info
    Write-DeploymentLog "" -Level Info
}

# Step 7: Code signing (if requested)
if ($Sign) {
    $currentStep++
    Write-DeploymentLog "[$currentStep/$stepCount] Signing build artifacts..." -Level Info

    $signableFiles = $artifacts | Where-Object { $_.Extension -in @('.exe', '.msi', '.dmg', '.app') }

    if ($signableFiles.Count -eq 0) {
        Write-DeploymentLog "No signable artifacts found" -Level Warning
    } else {
        if ($IsWindows) {
            # Windows code signing with signtool
            Write-DeploymentLog "Platform: Windows - Using signtool" -Level Info

            # Check if signtool is available
            $signtool = Get-Command signtool -ErrorAction SilentlyContinue
            if (-not $signtool) {
                Write-DeploymentLog "Error: signtool.exe not found in PATH" -Level Error
                Write-DeploymentLog "Install Windows SDK: https://developer.microsoft.com/windows/downloads/windows-sdk/" -Level Info
                exit 1
            }

            foreach ($file in $signableFiles) {
                Write-DeploymentLog "Signing: $($file.Name)" -Level Info

                # Build signtool command
                $signtoolArgs = @(
                    "sign"
                    "/sha1", $SigningIdentity
                    "/fd", "SHA256"
                    "/tr", "http://timestamp.digicert.com"
                    "/td", "SHA256"
                )

                if ($SigningPassword) {
                    $signtoolArgs += @("/p", $SigningPassword)
                }

                $signtoolArgs += $file.FullName

                & signtool $signtoolArgs

                if ($LASTEXITCODE -eq 0) {
                    Write-DeploymentLog "  [OK] Signed successfully" -Level Success
                } else {
                    Write-DeploymentLog "  [FAIL] Signing failed with exit code $LASTEXITCODE" -Level Error
                    exit 1
                }
            }
        } elseif ($IsMacOS) {
            # macOS code signing with codesign
            Write-DeploymentLog "Platform: macOS - Using codesign" -Level Info

            foreach ($file in $signableFiles) {
                Write-DeploymentLog "Signing: $($file.Name)" -Level Info

                codesign --force --deep --sign "$SigningIdentity" "$($file.FullName)"

                if ($LASTEXITCODE -eq 0) {
                    Write-DeploymentLog "  [OK] Signed successfully" -Level Success

                    # Verify signature
                    codesign --verify --verbose "$($file.FullName)"
                    if ($LASTEXITCODE -eq 0) {
                        Write-DeploymentLog "  [OK] Signature verified" -Level Success
                    } else {
                        Write-DeploymentLog "  [WARN] Signature verification failed" -Level Warning
                    }
                } else {
                    Write-DeploymentLog "  [FAIL] Signing failed with exit code $LASTEXITCODE" -Level Error
                    exit 1
                }
            }

            Write-DeploymentLog "" -Level Info
            Write-DeploymentLog "Note: For distribution outside Mac App Store, also notarize:" -Level Info
            Write-DeploymentLog "  xcrun notarytool submit <file> --keychain-profile <profile>" -Level Info
        } else {
            Write-DeploymentLog "Code signing not supported on this platform" -Level Warning
        }
    }

    Write-DeploymentLog "" -Level Info
}

# Display completion message
Write-DeploymentLog "=== Desktop Build Complete ===" -Level Success
Write-DeploymentLog "" -Level Info
Write-DeploymentLog "Build artifacts location: $bundlePath" -Level Info
Write-DeploymentLog "" -Level Info

# Next steps
if ($Sign) {
    Write-DeploymentLog "Signed binaries ready for distribution" -Level Success
} else {
    Write-DeploymentLog "Note: Binaries are unsigned. Use -Sign for production releases." -Level Info
}
Write-DeploymentLog "" -Level Info
