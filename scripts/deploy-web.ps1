# Deploy Clinical Toolkit Web (PWA)
# Runs pre-deployment checks, builds, and deploys to Netlify

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$Preview,

    [Parameter(Mandatory = $false)]
    [switch]$Production,

    [Parameter(Mandatory = $false)]
    [switch]$SkipTests,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLint,

    [Parameter(Mandatory = $false)]
    [switch]$AutoDeploy
)

Write-Host "=== Clinical Toolkit - Web Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Determine deployment mode
$deploymentMode = if ($Production) { "PRODUCTION" } elseif ($Preview) { "PREVIEW" } else { "BUILD ONLY" }
Write-Host "Deployment Mode: $deploymentMode" -ForegroundColor Cyan
Write-Host ""

$stepCount = if ($AutoDeploy -or $Production -or $Preview) { 7 } else { 6 }
$currentStep = 0

# Pre-deployment checks
$currentStep++
Write-Host "[$currentStep/$stepCount] Running type check..." -ForegroundColor Yellow
npx tsc -b
if ($LASTEXITCODE -ne 0) {
    Write-Host "Type check failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Type check passed" -ForegroundColor Green
Write-Host ""

if (-not $SkipLint) {
    $currentStep++
    Write-Host "[$currentStep/$stepCount] Running linter..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Linting failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Linting passed" -ForegroundColor Green
    Write-Host ""
}

if (-not $SkipTests) {
    $currentStep++
    Write-Host "[$currentStep/$stepCount] Running tests..." -ForegroundColor Yellow
    npm run test:run
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Tests failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Tests passed" -ForegroundColor Green
    Write-Host ""

    $currentStep++
    Write-Host "[$currentStep/$stepCount] Running coverage check..." -ForegroundColor Yellow
    npm run test:coverage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Coverage threshold not met!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Coverage check passed" -ForegroundColor Green
    Write-Host ""
}

$currentStep++
Write-Host "[$currentStep/$stepCount] Building web app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build completed" -ForegroundColor Green
Write-Host ""

$currentStep++
Write-Host "[$currentStep/$stepCount] Build artifacts ready in dist/" -ForegroundColor Yellow
$distSize = (Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
Write-Host ""

# Deploy to Netlify if requested
if ($AutoDeploy -or $Production -or $Preview) {
    # Check if Netlify CLI is installed
    $netlifyCli = Get-Command netlify -ErrorAction SilentlyContinue
    if (-not $netlifyCli) {
        Write-Host "Netlify CLI not found. Install it with: npm install -g netlify-cli" -ForegroundColor Red
        exit 1
    }

    $currentStep++
    Write-Host "[$currentStep/$stepCount] Deploying to Netlify..." -ForegroundColor Yellow

    if ($Production) {
        Write-Host "Deploying to PRODUCTION..." -ForegroundColor Yellow
        netlify deploy --prod --dir=dist
    } else {
        Write-Host "Deploying to PREVIEW..." -ForegroundColor Yellow
        netlify deploy --dir=dist
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful!" -ForegroundColor Green
    } else {
        Write-Host "Deployment failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

Write-Host "=== Deployment Ready ===" -ForegroundColor Green
Write-Host ""
if (-not ($AutoDeploy -or $Production -or $Preview)) {
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  - Deploy to preview: .\scripts\deploy-web.ps1 -Preview" -ForegroundColor Gray
    Write-Host "  - Deploy to production: .\scripts\deploy-web.ps1 -Production" -ForegroundColor Gray
    Write-Host "  - Or manually upload dist/ to your hosting provider" -ForegroundColor Gray
}
