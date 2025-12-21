# Backward Compatibility Wrapper
# This script redirects to the new location: scripts/android/android-log-watch.ps1
#
# All Android scripts have been moved to scripts/android/ for better organization
# This wrapper ensures existing documentation and workflows continue to work

Write-Host "Note: Android scripts have been reorganized to scripts/android/" -ForegroundColor Yellow
Write-Host "Redirecting to: scripts\android\android-log-watch.ps1" -ForegroundColor Gray
Write-Host ""

$newScriptPath = Join-Path $PSScriptRoot "android\android-log-watch.ps1"

# Forward all parameters to the new script
& $newScriptPath @PSBoundParameters
exit $LASTEXITCODE
