# Android Automation Scripts

**Location**: `clinical-toolkit/scripts/android/`

**Phase 0 Polish Complete** - Enhanced with shared configuration, logging, and security improvements.

## Quick Start

```powershell
# From clinical-toolkit root directory:

# Build and install (one command)
.\scripts\android\android-quick-build.ps1

# Watch logs
.\scripts\android\android-log-watch.ps1

# Run tests on device
.\scripts\android\android-test-device.ps1
```

## Files

### Core Scripts
- **android-quick-build.ps1** - One-command build + install (no Android Studio)
- **android-test-device.ps1** - Run tests on connected device
- **android-log-watch.ps1** - Real-time log monitoring with color coding

### Infrastructure
- **android-common.psm1** - Shared PowerShell module with reusable functions
- **android-config.json** - Centralized configuration (package name, paths, timeouts)

### Backward Compatibility
- **../android-*.ps1** - Wrapper scripts for backward compatibility (auto-redirect to new location)

## Key Improvements (Phase 0)

### 1. Centralized Configuration
All hard-coded values moved to `android-config.json`:
- Package name: `com.clinicaltoolkit.app`
- APK paths
- Build variants
- Logcat filters
- Timeouts

**Update package name once** in config, all scripts use it automatically.

### 2. Shared PowerShell Module
`android-common.psm1` provides reusable functions:
- `Get-ConnectedDevices` - Device detection with full info
- `Select-TargetDevice` - Smart device selection
- `Test-AndroidPrerequisites` - Dependency checks
- `Write-AndroidLog` - Dual console + file logging
- `Test-AppInstalled` - Check if app is on device
- `Get-AppVersion` - Get installed app version
- `Test-DeviceConnection` - Validate device responsiveness

**Benefits**:
- DRY principle (no duplicated code)
- Consistent error handling
- Easier maintenance

### 3. File Logging
All scripts now log to timestamped files in `scripts/logs/`:
- Console output preserved (colorful, user-friendly)
- Log files capture full execution history
- Timestamps on every log entry
- Audit trail for debugging

**Example log**: `scripts/logs/android-quick-build-2025-11-28_14-30-15.log`

### 4. Security Improvements
- **Removed `Invoke-Expression`** - Direct command invocation (prevents code injection)
- **Input validation** - Device IDs validated before use
- **Proper parameter handling** - Uses `& npm run` instead of string eval

### 5. Enhanced Error Handling
- Prerequisite checks before running (adb, npm, npx)
- Graceful degradation (warnings vs errors)
- Helpful error messages with fix suggestions
- Device connection validation
- APK verification

### 6. Better User Experience
- Color-coded output (Green=success, Red=errors, Yellow=warnings)
- Progress indicators (`[1/5] Building...`)
- Device information display (manufacturer, model, Android version)
- Helpful command suggestions
- Quick reference for next actions

## Configuration

### Package Name
Update in `android-config.json`:
```json
{
  "packageName": "com.clinicaltoolkit.app"
}
```

### Paths
Default paths assume standard Capacitor structure. Adjust if needed:
```json
{
  "paths": {
    "androidDir": "android",
    "apk": {
      "debug": "android/app/build/outputs/apk/debug/app-debug.apk",
      "release": "android/app/build/outputs/apk/release/app-release.apk"
    }
  }
}
```

### Logcat Filters
Customize log filtering:
```json
{
  "logcat": {
    "defaultFilter": "ReactNativeJS:V *:S"
  }
}
```

## Usage Examples

### Build & Install (Debug)
```powershell
.\scripts\android\android-quick-build.ps1
```

### Build Release APK
```powershell
.\scripts\android\android-quick-build.ps1 -Release
```

### Skip Tests (Faster Iteration)
```powershell
.\scripts\android\android-quick-build.ps1 -SkipTests
```

### Build Only (No Install)
```powershell
.\scripts\android\android-quick-build.ps1 -SkipInstall
```

### Specific Device
```powershell
.\scripts\android\android-quick-build.ps1 -DeviceId emulator-5554
```

### Watch Logs (Default Filter)
```powershell
.\scripts\android\android-log-watch.ps1
```

### Watch All Logs
```powershell
.\scripts\android\android-log-watch.ps1 -All
```

### Clear Logs First
```powershell
.\scripts\android\android-log-watch.ps1 -Clear
```

### Custom Log Filter
```powershell
.\scripts\android\android-log-watch.ps1 -Filter "*:E"  # Errors only
```

### Run Tests on Device
```powershell
.\scripts\android\android-test-device.ps1
```

### Custom Test Command
```powershell
.\scripts\android\android-test-device.ps1 -TestCommand "test:e2e"
```

## Module Functions (For Custom Scripts)

You can use the shared module in your own scripts:

```powershell
Import-Module "path/to/android-common.psm1" -Force

# Initialize logging
$logFile = Initialize-AndroidLog -ScriptName "my-script"

# Check prerequisites
if (-not (Test-AndroidPrerequisites -RequireAdb)) {
    exit 1
}

# Get devices
$devices = Get-ConnectedDevices
if ($devices) {
    $target = Select-TargetDevice -Devices $devices

    # Check if app installed
    if (Test-AppInstalled -DeviceId $target.Id) {
        Write-AndroidLog "App is installed!" -ForegroundColor Green
    }
}
```

## Log Files

Location: `clinical-toolkit/scripts/logs/`

Filename format: `{script-name}-{timestamp}.log`

Example:
```
android-quick-build-2025-11-28_14-30-15.log
android-test-device-2025-11-28_14-35-22.log
android-log-watch-2025-11-28_14-40-10.log
```

**Log contents**:
- Timestamped entries
- All console output
- Command outputs (npm, adb, gradlew)
- Error messages and stack traces

**Log retention**: Manual cleanup (could automate retention policy later)

## Quality Improvements

### Before (7.5/10)
- Hard-coded package name in 4+ files
- Duplicated device detection code (~150 lines)
- No file logging
- Security issues (Invoke-Expression)
- Inconsistent error handling

### After (9/10)
- Centralized configuration
- Shared module (DRY principle)
- Full file logging with timestamps
- Security fixes applied
- Consistent, comprehensive error handling
- Better user experience

## Migration Notes

**Backward Compatible**: Existing documentation and workflows using `.\scripts\android-*.ps1` continue to work via wrapper scripts.

**New Recommended Paths**:
- `.\scripts\android\android-quick-build.ps1` (instead of `.\scripts\android-quick-build.ps1`)
- `.\scripts\android\android-test-device.ps1`
- `.\scripts\android\android-log-watch.ps1`

**Breaking Changes**: None (wrappers maintain compatibility)

## Troubleshooting

### "Module not found"
- Ensure `android-common.psm1` is in `scripts/android/` directory
- Run script from project root or use full paths

### "Configuration file not found"
- Ensure `android-config.json` exists in `scripts/android/`
- Check file is valid JSON

### "No devices connected"
- Connect device via USB or start emulator
- Enable USB debugging on device
- Run `adb devices` to verify connection
- Authorize computer on device if prompted

### "Package name not found"
- Update `packageName` in `android-config.json` if different
- Verify package name matches `capacitor.config.ts`

## See Also

- [ANDROID_CLI_AUTOMATION.md](../../docs/android/ANDROID_CLI_AUTOMATION.md) - Complete Android automation guide
- [WORKFLOW_ANALYSIS_AND_RECOMMENDATIONS.md](../../docs/WORKFLOW_ANALYSIS_AND_RECOMMENDATIONS.md) - Phase 0 analysis
- [android-config.json](android-config.json) - Configuration reference
